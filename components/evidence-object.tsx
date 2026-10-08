import { Fingerprint, ArrowUpRight } from "lucide-react";

/** Original label artwork; never presented as a live record or scannable QR. */
export function EvidenceObject({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`evidence-object ${compact ? "object-compact" : ""}`}>
      <div className="object-coordinate mono">OBJECT / RECORD / ORIGIN</div>
      <svg
        className="parcel-art"
        viewBox="0 0 560 440"
        role="img"
        aria-label="Illustrated parcel with an inspectable product label"
      >
        <ellipse
          cx="283"
          cy="370"
          rx="176"
          ry="22"
          fill="#030919"
          opacity=".17"
        />
        <path
          d="M83 149 272 64 472 156 279 250Z"
          fill="#f0f3ff"
          stroke="#10182b"
          strokeWidth="2"
        />
        <path
          d="M83 149 279 250 279 388 83 280Z"
          fill="#bacaff"
          stroke="#10182b"
          strokeWidth="2"
        />
        <path
          d="M279 250 472 156 472 291 279 388Z"
          fill="#7998ef"
          stroke="#10182b"
          strokeWidth="2"
        />
        <path d="m165 112 192 101 34-17L198 97Z" fill="#dae3ff" />
        <path d="m243 231 36 19v138l-36-19Z" fill="#e7edff" opacity=".8" />
        <path
          d="m312 235 115-56v69l-115 57Z"
          fill="#fff"
          stroke="#10182b"
          strokeWidth="1.5"
        />
        <path d="m326 238 24-12v23l-24 12Z" fill="#2455ec" />
        <path
          d="m358 222 54-26m-54 37 40-20m-40 30 54-26"
          stroke="#10182b"
          strokeWidth="3"
        />
        <path d="m326 277 86-42" stroke="#10182b" strokeWidth="6" />
        <path
          d="m104 186 60 32m-60-18 82 44m-82-30 43 23"
          stroke="#5976bd"
          strokeWidth="3"
        />
        <path
          d="m104 250 0 16m7-12v16m7-12v16m7-12v16m7-12v16m7-12v16"
          stroke="#10182b"
          strokeWidth="3"
        />
        <path
          d="M38 69v-18h18m448 0h18v18M38 357v18h18m448 0h18v-18"
          fill="none"
          stroke="#6c88e1"
          strokeWidth="1.5"
        />
        <path
          d="M19 310h74m373-207h75"
          stroke="#6c88e1"
          strokeDasharray="4 5"
        />
        <circle cx="93" cy="310" r="4" fill="#2455ec" />
        <circle cx="466" cy="103" r="4" fill="#2455ec" />
      </svg>
      <div className="object-label">
        <div className="object-label-icon">
          <Fingerprint size={28} strokeWidth={1.5} />
        </div>
        <div>
          <span className="mono">PRODUCT PASSPORT</span>
          <strong>More than a label.</strong>
        </div>
        <ArrowUpRight size={22} />
      </div>
      <div className="object-caption mono">
        CONCEPT ILLUSTRATION · NO LIVE PRODUCT
      </div>
    </div>
  );
}
