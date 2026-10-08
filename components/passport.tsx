"use client";
import { useState } from "react";
import {
  Check,
  ArrowUpRight,
  Download,
  Copy,
  ShieldCheck,
  AlertTriangle,
  SearchX,
  CloudOff,
} from "lucide-react";
import Link from "next/link";
import { labels, type Passport as PassportData } from "@/lib/domain/passport";
import { csvCell } from "@/lib/domain/metadata";
export function download(
  name: string,
  content: string,
  type = "application/json",
) {
  const u = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
export function Passport({ data }: { data: PassportData }) {
  const [notice, setNotice] = useState("");
  const record =
    !!data.manufacturer &&
    ["registered", "revoked", "integrity_mismatch"].includes(data.status);
  const good = data.status === "registered";
  const neutral = ["not_found", "unavailable"].includes(data.status);
  const tone = good
    ? "positive"
    : neutral
      ? "neutral"
      : data.status === "integrity_mismatch"
        ? "caution"
        : "attention";
  const StatusIcon = good
    ? ShieldCheck
    : data.status === "not_found"
      ? SearchX
      : data.status === "unavailable"
        ? CloudOff
        : AlertTriangle;
  async function pdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("VerifyChain evidence summary", 18, 22);
    doc.setFontSize(10);
    const text =
      Object.entries(data)
        .map(
          ([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`,
        )
        .join("\n\n") +
      "\n\nEthereum Sepolia testnet. Wallet registration does not certify a brand or physical authenticity.";
    const lines = doc.splitTextToSize(text, 170);
    let y = 35;
    for (const line of lines) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 18, y);
      y += 5;
    }
    doc.save("verifychain-evidence.pdf");
  }
  return (
    <section
      className={`passport passport-${data.status}`}
      aria-label="Product passport"
    >
      <div className="passport-top">
        <span className="eyebrow">PRODUCT PASSPORT</span>
        <span className="mono">SEPOLIA / 11155111</span>
      </div>
      <div className="passport-summary">
        <div className={`verdict ${tone}`}>
          <StatusIcon size={23} />
          <span>{labels[data.status]}</span>
        </div>
        <h2>{record ? (data.name ?? data.productId) : data.productId}</h2>
        <p className="mono product-id" data-testid="passport-id">
          {data.productId}
        </p>
        <p>{data.message}</p>
      </div>
      {data.contract && (
        <>
          {record && (
            <div className="passport-grid">
              <div>
                <span className="eyebrow">REGISTRANT</span>
                <h3>{data.manufacturer?.companyName ?? "Unavailable"}</h3>
                <p className="mono break">{data.manufacturer?.address}</p>
                <p className="muted">
                  Self-registered identity ·{" "}
                  {data.manufacturer?.active
                    ? "Active account"
                    : "Inactive account"}
                </p>
              </div>
              <div>
                <span className="eyebrow">METADATA INTEGRITY</span>
                <h3>
                  {data.integrity === "match"
                    ? "Commitment matches"
                    : data.integrity === "mismatch"
                      ? "Content differs"
                      : "Metadata unavailable"}
                </h3>
                <p className="muted">
                  {data.integrity === "match"
                    ? "Canonical product details match the on-chain hash."
                    : "Registration and metadata availability are separate checks."}
                </p>
              </div>
            </div>
          )}
          {record && data.metadata && (
            <div className="details-grid">
              {[
                ["Category", data.metadata.category],
                ["Serial", data.metadata.serial],
                ["Origin", data.metadata.origin],
                ["Description", data.metadata.description],
              ].map(([k, v]) => (
                <div key={k}>
                  <span className="eyebrow">{k}</span>
                  <p>{v || "Not supplied"}</p>
                </div>
              ))}
            </div>
          )}
          <div className="passport-actions">
            <Link
              href={`/dashboard/supply-chain?id=${encodeURIComponent(data.productId)}`}
              className="button secondary"
            >
              View supply chain <ArrowUpRight size={16} />
            </Link>
            <button
              className="button secondary"
              onClick={() =>
                download(
                  "verifychain-evidence.json",
                  JSON.stringify(data, null, 2),
                )
              }
            >
              <Download size={16} />
              JSON
            </button>
            <button
              className="button secondary"
              onClick={() =>
                download(
                  "verifychain-evidence.csv",
                  [
                    "Product ID,Status,Chain,Contract,Commitment,Checked at",
                    [
                      data.productId,
                      data.status,
                      data.chainId,
                      data.contract,
                      data.commitment,
                      data.checkedAt,
                    ]
                      .map(csvCell)
                      .join(","),
                  ].join("\n"),
                  "text/csv",
                )
              }
            >
              CSV
            </button>
            <button
              className="button secondary"
              onClick={() => {
                void pdf().catch(() =>
                  setNotice("PDF export failed. Try JSON."),
                );
              }}
            >
              PDF
            </button>
          </div>
          <details className="evidence">
            <summary>
              Inspect blockchain evidence <span>↗</span>
            </summary>
            <dl>
              {[
                ["Network", "Ethereum Sepolia testnet"],
                ["Registry", data.contract],
                ["Read block", data.block],
                ["Registration block", data.registrationBlock],
                ["Metadata URI", data.uri],
                ["Commitment", data.commitment],
                [
                  "Receipt",
                  data.transactionHash ??
                    "Registration receipt not resolved; this read has no transaction.",
                ],
                ["Checked at", data.checkedAt],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd className="mono break">{v ?? "Unavailable"}</dd>
                </div>
              ))}
            </dl>
            <a
              href={`https://sepolia.etherscan.io/address/${data.contract}`}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Inspect registry on Etherscan <ArrowUpRight size={16} />
            </a>
            <button
              className="button secondary"
              onClick={() => {
                navigator.clipboard
                  .writeText(data.productId)
                  .then(() => setNotice("Product ID copied"))
                  .catch(() =>
                    setNotice("Copy unavailable; select the ID above."),
                  );
              }}
            >
              <Copy size={15} />
              Copy ID
            </button>
          </details>
        </>
      )}
      <p role="status" className="notice">
        {notice && (
          <>
            <Check size={16} />
            {notice}
          </>
        )}
      </p>
    </section>
  );
}
