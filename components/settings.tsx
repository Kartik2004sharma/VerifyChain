"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import manifest from "@/deployments/manifest.json";
import { PageHeading } from "./shell";
export function Settings() {
  const { theme, setTheme } = useTheme();
  const [compact, setCompact] = useState(false);
  const [saved, setSaved] = useState("");
  useEffect(
    () => setCompact(localStorage.getItem("verifychain:compact") === "true"),
    [],
  );
  return (
    <>
      <PageHeading
        kicker="SETTINGS / YOUR WORKSPACE"
        title="Make the evidence comfortable."
        description="Display preferences stay on this device. Network configuration is managed by the deployment operator."
      />
      <div className="two-columns">
        <section className="panel">
          <h2>Display preferences</h2>
          <label htmlFor="theme">Appearance</label>
          <select
            id="theme"
            value={theme ?? "light"}
            onChange={(e) => {
              setTheme(e.target.value);
              setSaved("Appearance saved on this device.");
            }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={compact}
              onChange={(e) => {
                const value = e.target.checked;
                setCompact(value);
                localStorage.setItem("verifychain:compact", String(value));
                document.documentElement.dataset.compact = String(value);
                setSaved("Spacing preference saved on this device.");
              }}
            />
            Compact record spacing
          </label>
          <p role="status">{saved}</p>
        </section>
        <section className="panel">
          <h2>Network & release</h2>
          <dl className="review-evidence">
            <dt>Network</dt>
            <dd>Ethereum Sepolia · 11155111</dd>
            <dt>Manifest status</dt>
            <dd>{manifest.status}</dd>
            <dt>Contracts</dt>
            <dd>
              {Object.entries(manifest.contracts).length
                ? Object.entries(manifest.contracts).map(([k, v]) => (
                    <p className="mono break" key={k}>
                      {k}: {(v as { address: string }).address}
                    </p>
                  ))
                : "Awaiting a verified deployment; archived addresses are not used."}
            </dd>
            <dt>Financial features</dt>
            <dd>Quarantined outside this release</dd>
          </dl>
        </section>
      </div>
      <section className="panel">
        <h2>Privacy & evidence limits</h2>
        <p>
          Camera frames stay on your device. Uploaded canonical product metadata
          is public on IPFS and its commitment is public on-chain. Do not enter
          personal or confidential information.
        </p>
        <p>
          Wallet self-registration does not certify a brand. Handler
          authorization is global and does not establish exclusive product
          custody.
        </p>
      </section>
    </>
  );
}
