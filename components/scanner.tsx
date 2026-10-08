"use client";
import { useEffect, useRef, useState } from "react";
import { parseQR } from "@/lib/domain/metadata";
export function Scanner({
  onScan,
  onClose,
}: {
  onScan: (id: string) => void;
  onClose: () => void;
}) {
  const [error, setError] = useState("");
  const instance = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  useEffect(() => {
    let cancelled = false,
      accepted = false;
    let scanner: import("html5-qrcode").Html5Qrcode;
    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        scanner = new Html5Qrcode("qr-reader");
        instance.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: { width: 220, height: 220 } },
          (payload) => {
            if (accepted) return;
            try {
              const id = parseQR(payload, location.origin);
              accepted = true;
              onScan(id);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Invalid label");
            }
          },
          () => {},
        );
        if (cancelled && scanner.isScanning) await scanner.stop();
      } catch {
        if (!cancelled)
          setError(
            "Camera unavailable or permission denied. Close the camera and enter the ID manually.",
          );
      }
    }
    void start();
    return () => {
      cancelled = true;
      if (scanner?.isScanning) void scanner.stop().catch(() => {});
    };
  }, [onScan]);
  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>Scan a VerifyChain label</h2>
        <button className="button secondary" onClick={onClose}>
          Close camera
        </button>
      </div>
      <p>
        Camera frames stay on your device. Only this website’s labels are
        accepted.
      </p>
      <div id="qr-reader" />
      <p role="status" className="error">
        {error}
      </p>
    </div>
  );
}
