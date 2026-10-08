import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ScanLine,
  Fingerprint,
  Route,
  Plus,
  MoveUpRight,
  Layers3,
} from "lucide-react";
import { Brand, AppearanceToggle } from "@/components/brand";
import { EvidenceObject } from "@/components/evidence-object";

export default function Home() {
  return (
    <div className="new-home">
      <header className="landing-nav">
        <Brand />
        <nav aria-label="Main">
          <Link href="#how">The process</Link>
          <Link href="#evidence">The evidence</Link>
          <Link href="/dashboard">
            Workspace <ArrowUpRight size={14} />
          </Link>
        </nav>
        <div className="landing-actions">
          <AppearanceToggle />
          <Link
            className="button small"
            href="/verify"
            aria-label="Verify a product"
          >
            Verify <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>
      <main id="content">
        <section className="home-hero">
          <div className="hero-copy">
            <p className="hero-kicker">
              <span className="hero-kicker-line" /> A BETTER WAY TO READ A
              PRODUCT
            </p>
            <h1>
              What’s behind
              <br />
              your <span>product?</span>
            </h1>
            <p className="hero-lead">
              Turn a product ID into a clearer picture. Inspect its
              registration, check the details, and follow the record.
            </p>
            <form action="/verify" className="hero-lookup">
              <label htmlFor="hero-id">Find a product passport</label>
              <div className="input-action">
                <ScanLine size={22} aria-hidden="true" />
                <input
                  id="hero-id"
                  name="id"
                  required
                  placeholder="Enter your product ID"
                />
                <button className="button" aria-label="Verify product ID">
                  <ArrowRight size={22} />
                </button>
              </div>
            </form>
            <div className="hero-footnote">
              <span className="mono">PUBLIC LOOKUP</span>
              <span>No wallet needed</span>
              <span>Sepolia testnet</span>
            </div>
          </div>
          <div className="hero-stage">
            <EvidenceObject />
            <span className="stage-tag mono">
              A LABEL IS THE START.
              <br />
              THE RECORD IS THE STORY.
            </span>
          </div>
          <div className="hero-bottom">
            <span className="mono">VERIFIABLE RECORDS. VISIBLE LIMITS.</span>
            <Link href="#how">
              Follow the evidence <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <section className="signal-strip" aria-label="Evidence layers">
          <div>
            <Layers3 size={20} />
            <span>On-chain registration</span>
          </div>
          <div>
            <Fingerprint size={20} />
            <span>Metadata integrity</span>
          </div>
          <div>
            <Route size={20} />
            <span>Recorded provenance</span>
          </div>
          <span className="mono">
            ONE PRODUCT PASSPORT <MoveUpRight size={18} />
          </span>
        </section>
        <section className="process-section" id="how">
          <div className="section-intro">
            <p className="eyebrow">01 / FROM OBJECT TO EVIDENCE</p>
            <h2>
              A little less guessing.
              <br />A lot more context.
            </h2>
            <p>
              One ID. Three layers to inspect. Each gives you a different part
              of the product’s record.
            </p>
          </div>
          <div className="process-list">
            {[
              [
                ScanLine,
                "01",
                "Find its record",
                "Enter a product ID or scan its VerifyChain label. The lookup is public and never asks you to sign.",
              ],
              [
                Fingerprint,
                "02",
                "Check the details",
                "See whether retrieved product details match the commitment registered on-chain.",
              ],
              [
                Route,
                "03",
                "Follow the trail",
                "Inspect available checkpoints submitted by authorized handlers, with the evidence behind them.",
              ],
            ].map(([Icon, n, title, description]) => {
              const I = Icon as typeof ScanLine;
              return (
                <div className="process-row" key={String(n)}>
                  <span className="process-number mono">{String(n)}</span>
                  <I size={27} strokeWidth={1.5} />
                  <div>
                    <h3>{String(title)}</h3>
                    <p>{String(description)}</p>
                  </div>
                  <ArrowUpRight size={22} aria-hidden="true" />
                </div>
              );
            })}
          </div>
        </section>
        <section className="proof-section" id="evidence">
          <div className="proof-heading">
            <p className="eyebrow">02 / BUILT FOR A CLOSER LOOK</p>
            <h2>
              See the evidence.
              <br />
              Understand its limits.
            </h2>
            <Link href="/verify" className="button">
              Open verification <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="proof-explainer">
            <div>
              <span className="mono">THE RECORD</span>
              <h3>
                Submitted on-chain.
                <br />
                Open to inspection.
              </h3>
              <p>
                Registration, metadata commitment, registrant wallet and
                available checkpoints. Presented separately, so you can see
                exactly what supports each result.
              </p>
            </div>
            <div>
              <span className="mono">THE LIMITS</span>
              <h3>A record is a starting point.</h3>
              <p>
                It cannot certify a brand, a physical item or exclusive custody.
                Manufacturer identities are self-registered. A copied label can
                point to a real record.
              </p>
            </div>
            <p className="proof-note">
              <span className="dot" />
              Missing evidence stays missing. Service outages never become
              counterfeit verdicts.
            </p>
          </div>
        </section>
        <section className="maker-section">
          <div className="maker-symbol" aria-hidden="true">
            <Plus size={70} strokeWidth={1} />
          </div>
          <div>
            <p className="eyebrow">03 / FOR THE PEOPLE MAKING THINGS</p>
            <h2>
              Your product.
              <br />
              Its own beginning.
            </h2>
            <p>
              Register your identity, review product details, confirm the
              transaction, and create a label that opens the public passport.
            </p>
          </div>
          <Link href="/dashboard/register-product" className="button">
            Create a product record <ArrowUpRight size={18} />
          </Link>
        </section>
        <section className="home-faq">
          <div>
            <p className="eyebrow">A FEW THINGS TO KNOW</p>
            <h2>
              Clear before
              <br />
              you begin.
            </h2>
          </div>
          <div>
            {[
              [
                "Do I need a wallet?",
                "Public verification needs no wallet. Registration and handler writes require your explicit wallet approval.",
              ],
              [
                "Which network does this use?",
                "Ethereum Sepolia, a test network. Records remain testnet evidence even when the website is publicly hosted.",
              ],
              [
                "Are manufacturers certified?",
                "No. Company names are self-registered wallet submissions. An active account is not proof of brand authorization.",
              ],
              [
                "What if a service is unavailable?",
                "You’ll see an unavailable state and a way to retry. No invented records or physical authenticity verdicts replace missing evidence.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <Brand />
        <p>Know the record. Make your own judgment.</p>
        <div>
          <span className="mono">ETHEREUM SEPOLIA TESTNET</span>
          <Link href="/dashboard/settings">
            Network & preferences <ArrowUpRight size={15} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
