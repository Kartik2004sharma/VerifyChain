"use client";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage, useReadContract } from "wagmi";
import { isAddress, type Address } from "viem";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Download } from "lucide-react";
import manifest from "@/deployments/manifest.json";
import { ProductRegistryABI } from "@/lib/contracts/abis";
import {
  canonicalMetadata,
  metadataHash,
  metadataSchema,
  qrLabel,
  type ProductMetadata,
} from "@/lib/domain/metadata";
import { PageHeading } from "./shell";
import { useReadiness } from "./readiness";
import { useTransaction } from "./transaction";
import { download } from "./passport";
export const registryAddress = (
  manifest.contracts as Record<string, { address: Address }>
).ProductRegistry?.address;
function Progress({
  phase,
  hash,
  message,
  onRecheck,
}: {
  phase: string;
  hash?: string;
  message?: string;
  onRecheck?: () => void;
}) {
  return (
    <div role="status" className="transaction-state">
      <span className="eyebrow">TRANSACTION</span>
      <p>{phase.replaceAll("_", " ")}</p>
      {phase === "uncertain" && onRecheck && (
        <button type="button" className="button secondary" onClick={onRecheck}>
          Recheck receipt
        </button>
      )}
      {message && <p className="error">{message}</p>}
      {hash && (
        <a
          className="mono break text-link"
          href={`https://sepolia.etherscan.io/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
        >
          Inspect {hash}
        </a>
      )}
    </div>
  );
}
export function Manufacturer() {
  const { address, chainId } = useAccount();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const tx = useTransaction();
  const ready = useReadiness();
  const enabled =
    !!registryAddress && isAddress(registryAddress) && ready === true;
  return (
    <>
      <PageHeading
        kicker="MANUFACTURER / 02"
        title="Start with your identity."
        description="Register the company name your wallet submits. This is self-registration, not brand certification."
      />
      <section className="panel form-panel">
        <h2>Manufacturer identity</h2>
        <p className="muted">
          One registration per wallet. The owner can deactivate accounts.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            try {
              if (!registryAddress || !ready)
                throw new Error("A verified deployment manifest is required.");
              if (
                !name.trim() ||
                new TextEncoder().encode(name.trim()).length > 100
              )
                throw new Error("Company name must be 1–100 UTF-8 bytes.");
              await tx.send({
                address: registryAddress,
                abi: ProductRegistryABI,
                functionName: "registerManufacturer",
                args: [name.trim()],
                event: "ManufacturerRegistered",
              });
            } catch (e) {
              setError(
                e instanceof Error
                  ? e.message.split("\n")[0]
                  : "Registration failed",
              );
            }
          }}
        >
          <label htmlFor="company">Company name</label>
          <input
            id="company"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <p className="error" role="status">
            {error}
          </p>
          <button
            className="button"
            disabled={
              !enabled ||
              !address ||
              chainId !== 11155111 ||
              tx.busy ||
              tx.state.phase === "confirmed"
            }
          >
            Register identity <ArrowRight size={17} />
          </button>
        </form>
        {!enabled && (
          <p className="trust-note">
            Registration is unavailable until repaired contracts are deployed
            and verified.
          </p>
        )}
        {!address && <p>Connect a wallet using the header to begin.</p>}
        <Progress
          {...tx.state}
          onRecheck={() => void tx.recover().catch(() => {})}
        />
        {tx.state.phase === "confirmed" && (
          <Link href="/dashboard/register-product" className="button">
            Register a product <ArrowRight size={17} />
          </Link>
        )}
      </section>
    </>
  );
}
const initial: ProductMetadata = {
  schema: "verifychain.product.v1",
  productId: "",
  name: "",
  description: "",
  category: "",
  serial: "",
  origin: "",
};
export function Registration() {
  const account = useAccount();
  const { signMessageAsync } = useSignMessage();
  const tx = useTransaction();
  const ready = useReadiness();
  const [metadata, setMetadata] = useState(initial);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [stored, setStored] = useState<{
    uri: string;
    hash: `0x${string}`;
  } | null>(null);
  const [qr, setQR] = useState("");
  const m = useReadContract({
    address: registryAddress,
    abi: ProductRegistryABI,
    functionName: "getManufacturer",
    args: account.address ? [account.address] : undefined,
    query: { enabled: !!registryAddress && !!account.address },
  });
  const registered = !!m.data?.[1],
    active = !!m.data?.[2];
  useEffect(() => {
    setStored(null);
    setStep(1);
    setQR("");
  }, [account.address]);
  async function showLabel() {
    const { default: QRCode } = await import("qrcode");
    setQR(
      await QRCode.toString(
        `${location.origin}/verify?id=${encodeURIComponent(metadata.productId)}`,
        { type: "svg", width: 280, margin: 2, errorCorrectionLevel: "M" },
      ),
    );
    setStep(3);
  }
  async function recoverAttempt() {
    try {
      if (await tx.recover()) await showLabel();
    } catch {
      /* Receipt message is shown by the transaction state. */
    }
  }
  async function submit() {
    if (uploading || tx.busy) return;
    setError("");
    setUploading(true);
    try {
      if (
        !ready ||
        !registryAddress ||
        !account.address ||
        account.chainId !== 11155111
      )
        throw new Error(
          "Connect a wallet on Sepolia and configure the deployment.",
        );
      if (!registered || !active)
        throw new Error("An active manufacturer registration is required.");
      let content = stored;
      if (!content) {
        const challengeResponse = await fetch("/api/metadata/challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: account.address }),
        });
        const challenge = await challengeResponse.json();
        if (!challengeResponse.ok) throw new Error(challenge.error);
        const signature = await signMessageAsync({
          message: challenge.message,
        });
        const r = await fetch("/api/metadata/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata, token: challenge.token, signature }),
        });
        const result = await r.json();
        if (!r.ok) throw new Error(result.error);
        if (
          result.hash !== metadataHash(metadata) ||
          result.canonical !== canonicalMetadata(metadata)
        )
          throw new Error(
            "Storage commitment differs from the reviewed metadata.",
          );
        content = { uri: result.uri, hash: result.hash };
        setStored(content);
      }
      await tx.send({
        address: registryAddress,
        abi: ProductRegistryABI,
        functionName: "registerProduct",
        args: [metadata.productId, metadata.name, content.hash, content.uri],
        event: "ProductRegistered",
      });
      await showLabel();
    } catch (e) {
      setError(
        e instanceof Error ? e.message.split("\n")[0] : "Registration failed",
      );
    } finally {
      setUploading(false);
    }
  }
  return (
    <>
      <PageHeading
        kicker="PRODUCT REGISTRATION / 03"
        title="Give the record a beginning."
        description="Review exactly what you commit. Confirm only after the blockchain receipt is checked."
      />
      <ol className="stepper">
        {["Product details", "Review commitment", "Confirmation"].map(
          (s, i) => (
            <li key={s} aria-current={step === i + 1 ? "step" : undefined}>
              <span>{step > i + 1 ? <Check size={15} /> : i + 1}</span>
              {s}
            </li>
          ),
        )}
      </ol>
      <div className="registration-layout">
        <section className="panel registration-panel">
          {step === 1 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const parsed = metadataSchema.safeParse(metadata);
                if (!parsed.success) {
                  setError(parsed.error.issues[0].message);
                  return;
                }
                setMetadata(parsed.data);
                setError("");
                setStep(2);
              }}
            >
              <h2>Product details</h2>
              <p className="muted">
                The serial and ID distinguish this product’s canonical metadata.
              </p>
              <div className="form-grid">
                {[
                  ["productId", "Product ID"],
                  ["name", "Product name"],
                  ["category", "Category"],
                  ["serial", "Serial number"],
                  ["origin", "Origin"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label htmlFor={key}>{label}</label>
                    <input
                      id={key}
                      value={metadata[key as keyof ProductMetadata]}
                      onChange={(e) => {
                        setStored(null);
                        setMetadata((v) => ({ ...v, [key]: e.target.value }));
                      }}
                      required
                    />
                  </div>
                ))}
                <div className="full">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    maxLength={2000}
                    value={metadata.description}
                    onChange={(e) =>
                      setMetadata((v) => ({
                        ...v,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <p className="error" role="status">
                {error}
              </p>
              <button className="button">
                Review commitment <ArrowRight size={17} />
              </button>
            </form>
          ) : step === 2 ? (
            <>
              <h2>Review the exact commitment</h2>
              <p className="muted">
                Canonical v1 metadata is hashed using Keccak-256. A signed
                upload authorization stores it on IPFS before you approve the
                Sepolia transaction.
              </p>
              <pre className="canonical">{canonicalMetadata(metadata)}</pre>
              <dl className="review-evidence">
                <dt>Commitment</dt>
                <dd className="mono break">{metadataHash(metadata)}</dd>
                <dt>Storage</dt>
                <dd className="mono break">
                  {stored?.uri ?? "Not uploaded yet"}
                </dd>
                <dt>Network</dt>
                <dd>Ethereum Sepolia testnet</dd>
              </dl>
              {!registered && (
                <p>
                  Register your{" "}
                  <Link
                    className="text-link"
                    href="/dashboard/register-manufacturer"
                  >
                    manufacturer identity
                  </Link>{" "}
                  before submitting.
                </p>
              )}
              <div className="button-row">
                <button
                  className="button secondary"
                  disabled={uploading || tx.busy}
                  onClick={() => {
                    setStep(1);
                    setStored(null);
                  }}
                >
                  Edit details
                </button>
                <button
                  className="button"
                  disabled={
                    uploading ||
                    tx.busy ||
                    !ready ||
                    !registryAddress ||
                    !account.address ||
                    account.chainId !== 11155111 ||
                    !registered ||
                    !active
                  }
                  onClick={() => void submit()}
                >
                  {uploading ? "Preparing signed upload…" : "Upload & register"}
                  <ArrowRight size={17} />
                </button>
              </div>
              <p className="error" role="status">
                {error}
              </p>
              <Progress {...tx.state} onRecheck={() => void recoverAttempt()} />
              {!registryAddress && (
                <p className="trust-note">
                  Writes are unavailable until the verified deployment manifest
                  is configured. You can still review your metadata.
                </p>
              )}
            </>
          ) : (
            <>
              <span className="badge">Receipt confirmed</span>
              <h2>Your record has a beginning.</h2>
              <p>
                Save this label. It opens the public passport for{" "}
                {metadata.productId}.
              </p>
              {qr && (
                <Image
                  unoptimized
                  className="qr"
                  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`}
                  width="280"
                  height="280"
                  alt={`Product passport QR for ${metadata.productId}`}
                />
              )}
              <Progress {...tx.state} onRecheck={() => void recoverAttempt()} />
              <div className="button-row">
                <Link
                  className="button"
                  href={`/verify?id=${encodeURIComponent(metadata.productId)}`}
                >
                  Open passport <ArrowRight size={17} />
                </Link>
                <button
                  className="button secondary"
                  onClick={() =>
                    download(
                      "verifychain-label.svg",
                      qrLabel(qr, metadata.productId),
                      "image/svg+xml",
                    )
                  }
                >
                  <Download size={16} />
                  Download QR
                </button>
                <button
                  className="button secondary"
                  onClick={() => {
                    tx.reset();
                    setStep(1);
                    setStored(null);
                    setMetadata(initial);
                    setQR("");
                  }}
                >
                  Register another
                </button>
              </div>
            </>
          )}
        </section>
        <aside className="registration-companion">
          <span className="eyebrow">YOUR NEXT PRODUCT RECORD</span>
          <h2>Make every detail count.</h2>
          <p>
            The details you review become the record your customers can inspect.
          </p>
          <ol>
            {[
              [
                "Define the product",
                "An ID, serial and origin make the record specific.",
              ],
              [
                "Review the commitment",
                "Check the exact details before storing or signing.",
              ],
              [
                "Keep the label",
                "A confirmed record gets a QR link to its public passport.",
              ],
            ].map(([title, text], i) => (
              <li key={title} className={step === i + 1 ? "current" : ""}>
                <span className="mono">0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="companion-note">
            Ethereum Sepolia testnet. Product details are public. Registration
            does not certify physical authenticity.
          </p>
        </aside>
      </div>
    </>
  );
}
