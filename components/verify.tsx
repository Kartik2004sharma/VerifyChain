"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, ScanLine, Search } from "lucide-react";
import { PageHeading } from "./shell";
import { EvidenceObject } from "./evidence-object";
import { Passport } from "./passport";
import { productIdSchema } from "@/lib/domain/metadata";
import { labels, type Passport as PassportData } from "@/lib/domain/passport";
const Scanner = dynamic(() => import("./scanner").then((m) => m.Scanner), {
  ssr: false,
});
export function Verify() {
  const [id, setId] = useState("");
  const [data, setData] = useState<PassportData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const lock = useRef(false);
  const lookup = useCallback(async (value: string) => {
    if (lock.current) return;
    const p = productIdSchema.safeParse(value);
    if (!p.success) {
      setError("Enter an ID of 1–100 UTF-8 bytes without control characters.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    setData(null);
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    try {
      const r = await fetch("/api/blockchain/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: p.data }),
        signal: c.signal,
      });
      const result = await r.json();
      if (!result.status)
        throw new Error(result.error ?? "Service unavailable");
      setData(result);
      const url = new URL(location.href);
      url.searchParams.set("id", p.data);
      history.replaceState(null, "", url);
    } catch (e) {
      if (!c.signal.aborted)
        setError(
          e instanceof Error
            ? e.message
            : "Unable to check this record. Try again.",
        );
    } finally {
      if (controller.current === c) {
        lock.current = false;
        setBusy(false);
      }
    }
  }, []);
  useEffect(() => {
    const value = new URL(location.href).searchParams.get("id");
    if (value) {
      setId(value);
      void lookup(value);
    }
    return () => {
      controller.current?.abort();
      lock.current = false;
    };
  }, [lookup]);
  const scanned = useCallback(
    (value: string) => {
      setId(value);
      setCamera(false);
      void lookup(value);
    },
    [lookup],
  );
  return (
    <>
      <PageHeading
        kicker="PUBLIC VERIFICATION / 01"
        title="Meet the record behind it."
        description="A label is just the beginning. Look up a product and see what the evidence tells you."
      />
      <div className={`verify-studio ${data || busy ? "has-result" : ""}`}>
        <section className="lookup-panel">
          <div className="lookup-heading">
            <Search size={22} />
            <h2>Find a product passport</h2>
            <span className="badge">No wallet required</span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void lookup(id);
            }}
          >
            <label htmlFor="product-id">Product ID</label>
            <div className="input-action">
              <input
                id="product-id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Enter the ID printed on your product"
                aria-describedby="lookup-help lookup-error"
                required
              />
              <button className="button" disabled={busy}>
                {busy ? "Checking…" : "Verify product"}
                <ArrowRight size={17} />
              </button>
            </div>
            <p id="lookup-help" className="muted">
              IDs are case-sensitive. This checks the configured Ethereum
              Sepolia registry.
            </p>
            <p id="lookup-error" role="status" className="error">
              {error}
            </p>
          </form>
          <button className="text-link" onClick={() => setCamera((v) => !v)}>
            <ScanLine size={18} />
            {camera ? "Use manual entry" : "Scan QR with camera"}
          </button>
          <div className="lookup-assurance">
            <span className="mono">01 / ENTER AN ID</span>
            <p>Your lookup is a public read. It never submits a transaction.</p>
          </div>
        </section>
        <aside className="lookup-art" aria-label="Product label illustration">
          <EvidenceObject compact />
        </aside>
      </div>
      {camera && <Scanner onScan={scanned} onClose={() => setCamera(false)} />}
      <div role="status" aria-live="polite" className="sr-only">
        {busy ? "Checking product" : data ? labels[data.status] : ""}
      </div>
      {data ? (
        <Passport data={data} />
      ) : (
        <div className="verification-guide">
          <p className="eyebrow">WHAT YOU WILL SEE</p>
          <div className="three-columns">
            {[
              [
                "01",
                "Registration",
                "Whether a wallet registered this ID and whether the record is revoked.",
              ],
              [
                "02",
                "Integrity",
                "Whether retrieved product details match the on-chain commitment.",
              ],
              [
                "03",
                "Provenance",
                "The registrant, network, record context and available journey checkpoints.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span className="mono">{n}</span>
                <h3>{t}</h3>
                <p className="muted">{d}</p>
              </div>
            ))}
          </div>
          <p className="trust-note">
            A registered record does not certify brand identity or the physical
            item. A copied label can point to a real record.
          </p>
        </div>
      )}
    </>
  );
}
