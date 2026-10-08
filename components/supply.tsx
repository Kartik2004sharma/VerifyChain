"use client";
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { keccak256, toHex, type Address } from "viem";
import manifest from "@/deployments/manifest.json";
import { SupplyChainTrackerABI } from "@/lib/contracts/abis";
import { productIdSchema } from "@/lib/domain/metadata";
import { PageHeading, Empty } from "./shell";
import { useReadiness } from "./readiness";
import { useTransaction } from "./transaction";
type Step = {
  number: number;
  location: string;
  handler: string;
  timestamp: number;
  proof: string;
  verified: boolean;
  action: string;
  notes: string;
  block: string;
};
const tracker = (manifest.contracts as Record<string, { address: Address }>)
  .SupplyChainTracker?.address;
export function Supply() {
  const { address, chainId } = useAccount();
  const [id, setId] = useState("");
  const [data, setData] = useState<{
    steps: Step[];
    complete: boolean;
    total?: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [action, setAction] = useState("manufactured");
  const tx = useTransaction();
  const ready = useReadiness();
  const authorized = useReadContract({
    address: tracker,
    abi: SupplyChainTrackerABI,
    functionName: "isHandlerAuthorized",
    args: address ? [address] : undefined,
    query: { enabled: !!tracker && !!address },
  });
  const owner = useReadContract({
    address: tracker,
    abi: SupplyChainTrackerABI,
    functionName: "owner",
    query: { enabled: !!tracker },
  });
  const canWrite =
    ready === true &&
    !!address &&
    (authorized.data || owner.data === address) &&
    chainId === 11155111;
  useEffect(() => {
    const value = new URL(window.location.href).searchParams.get("id");
    if (value) {
      setId(value);
      void load(value);
    }
  }, []);
  async function load(value: string) {
    setData(null);
    setError("");
    if (!productIdSchema.safeParse(value).success) {
      setError("Enter a valid product ID.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(
        `/api/supply?id=${encodeURIComponent(value.trim())}`,
      );
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Journey unavailable");
    } finally {
      setBusy(false);
    }
  }
  async function write(complete = false) {
    if (!tracker) return;
    try {
      setError("");
      const proof = keccak256(
        toHex(
          JSON.stringify({
            schema: "verifychain.checkpoint.v1",
            id: id.trim(),
            location: location.trim(),
            action,
            notes: notes.trim(),
          }),
        ),
      );
      await tx.send({
        address: tracker,
        abi: SupplyChainTrackerABI,
        functionName: complete
          ? "completeSupplyChain"
          : data?.steps.length
            ? "addSupplyChainStep"
            : "initializeSupplyChain",
        args: complete
          ? [id.trim()]
          : [id.trim(), location.trim(), action, proof, notes.trim()],
        event: complete ? "SupplyChainCompleted" : "SupplyChainStepAdded",
      });
      await load(id);
    } catch (e) {
      setError(
        e instanceof Error ? e.message.split("\n")[0] : "Checkpoint failed",
      );
    }
  }
  return (
    <>
      <PageHeading
        kicker="SUPPLY CHAIN / AVAILABLE JOURNEY"
        title="Follow the recorded path."
        description="Checkpoints are handler submissions. The global handler list does not establish exclusive custody."
      />
      <section className="panel">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void load(id);
          }}
        >
          <label htmlFor="journey-id">Product ID</label>
          <div className="input-action">
            <input
              id="journey-id"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setData(null);
              }}
              required
            />
            <button className="button" disabled={busy}>
              {busy ? "Loading…" : "Find journey"}
            </button>
          </div>
        </form>
        <p className="error" role="status">
          {error}
        </p>
      </section>
      {data && (
        <section className="panel">
          <div className="panel-heading">
            <h2>Recorded checkpoints</h2>
            <span className="badge">
              {data.complete ? "Marked complete" : "Open journey"}
            </span>
          </div>
          {data.steps.length ? (
            <ol className="timeline">
              {data.steps.map((step) => (
                <li key={step.number}>
                  <span className="timeline-number">{step.number}</span>
                  <div>
                    <p className="eyebrow">
                      {step.action.replaceAll("_", " ")}
                    </p>
                    <h3>{step.location}</h3>
                    <p>{step.notes}</p>
                    <p className="muted">
                      {new Date(step.timestamp * 1000).toLocaleString()} ·{" "}
                      {step.verified
                        ? "Handler verification flag set"
                        : "Awaiting handler verification"}
                    </p>
                    <details>
                      <summary>Inspect checkpoint</summary>
                      <dl className="review-evidence">
                        <dt>Handler</dt>
                        <dd className="mono break">{step.handler}</dd>
                        <dt>Proof commitment</dt>
                        <dd className="mono break">{step.proof}</dd>
                        <dt>Block</dt>
                        <dd>{step.block}</dd>
                      </dl>
                    </details>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <Empty title="No journey recorded">
              No checkpoints exist for this ID. This is independent of product
              registration.
            </Empty>
          )}
          {data.total && data.total > 100 ? (
            <p>
              Showing the first 100 of {data.total} checkpoints. Full-chain
              inspection is required for longer journeys.
            </p>
          ) : null}
        </section>
      )}
      <section className="panel">
        <h2>Record a checkpoint</h2>
        <p className="muted">
          Only the contract owner or a globally authorized handler can write.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void write();
          }}
        >
          <div className="form-grid">
            <div>
              <label htmlFor="checkpoint-location">Location</label>
              <input
                id="checkpoint-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                maxLength={200}
              />
            </div>
            <div>
              <label htmlFor="checkpoint-action">Action</label>
              <select
                id="checkpoint-action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                {[
                  "manufactured",
                  "quality_checked",
                  "packaged",
                  "shipped",
                  "in_transit",
                  "customs_cleared",
                  "received_at_warehouse",
                  "quality_inspected",
                  "received_by_distributor",
                  "received_by_retailer",
                  "displayed",
                  "sold",
                  "delivered",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="full">
              <label htmlFor="checkpoint-notes">Notes</label>
              <textarea
                id="checkpoint-notes"
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="button-row">
            <button
              className="button"
              disabled={!canWrite || !data || data.complete || tx.busy}
            >
              Record checkpoint
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={
                !canWrite ||
                !data ||
                data.steps.length < 2 ||
                data.complete ||
                tx.busy
              }
              onClick={() => void write(true)}
            >
              Mark journey complete
            </button>
          </div>
        </form>
        <p role="status">Transaction: {tx.state.phase.replaceAll("_", " ")}</p>
        {tx.state.phase === "uncertain" && (
          <button
            className="button secondary"
            onClick={() =>
              void tx
                .recover()
                .then(() => load(id))
                .catch(() => {})
            }
          >
            Recheck receipt
          </button>
        )}
        {tx.state.hash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${tx.state.hash}`}
            className="mono break text-link"
          >
            Inspect submitted transaction
          </a>
        )}
        {!canWrite && (
          <p className="trust-note">
            Connect an authorized Sepolia wallet after the verified deployment
            is configured.
          </p>
        )}
      </section>
    </>
  );
}
