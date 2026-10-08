"use client";
import Link from "next/link";
import { useReadiness } from "./readiness";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Brand, AppearanceToggle } from "./brand";
import dynamic from "next/dynamic";
import {
  ArrowUpRight,
  Menu,
  X,
  PackageSearch,
  ScanLine,
  PackagePlus,
  Route,
  History,
  SlidersHorizontal,
  LayoutDashboard,
  Building2,
  ChartNoAxesCombined,
} from "lucide-react";
const Wallet = dynamic(() => import("./wallet").then((m) => m.Wallet), {
  ssr: false,
  loading: () => <span className="muted">Wallet</span>,
});
const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/verify", label: "Verify a product", icon: ScanLine },
  {
    href: "/dashboard/register-product",
    label: "Register product",
    icon: PackagePlus,
  },
  {
    href: "/dashboard/register-manufacturer",
    label: "Manufacturer",
    icon: Building2,
  },
  { href: "/dashboard/supply-chain", label: "Supply chain", icon: Route },
  {
    href: "/dashboard/verification-history",
    label: "Observations",
    icon: History,
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: ChartNoAxesCombined,
  },
  { href: "/dashboard/settings", label: "Settings", icon: SlidersHorizontal },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const ready = useReadiness();
  const nav = (close = false) => (
    <nav aria-label="Workspace">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          onClick={() => {
            if (close) dialog.current?.close();
          }}
          key={href}
          href={href}
          aria-current={path === href ? "page" : undefined}
        >
          <Icon size={18} />
          {label}
          {path === href && <span className="nav-mark" />}
        </Link>
      ))}
    </nav>
  );
  return (
    <div className="workspace">
      <div className="workspace-body">
        <header className="workspace-header">
          <div className="workspace-heading-row">
            <Brand />
            <span className="header-context mono">
              PRODUCT RECORDS <span>/</span>{" "}
              {links.find((l) => l.href === path)?.label ?? "Workspace"}
            </span>
            <div className="header-tools">
              <AppearanceToggle />
              <button
                className="icon-button mobile-menu"
                aria-label="Open navigation"
                onClick={() => dialog.current?.showModal()}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
          <div className="workspace-account">
            <span className="service">
              <span className={`dot ${ready ? "online" : ""}`} />
              {ready === undefined
                ? "Checking service"
                : ready
                  ? "Read service ready"
                  : "Read service unavailable"}
            </span>
            <Wallet />
          </div>
        </header>
        <div className="workspace-nav">{nav()}</div>
        <main id="content" className="workspace-main">
          {children}
        </main>
        <footer className="workspace-footer">
          <span>VerifyChain · Ethereum Sepolia testnet</span>
          <Link href="/">
            Inspect evidence. Know its limits. <ArrowUpRight size={13} />
          </Link>
        </footer>
      </div>
      <dialog ref={dialog} className="nav-dialog">
        <div className="dialog-heading">
          <Brand />
          <button
            className="icon-button"
            aria-label="Close navigation"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </button>
        </div>
        {nav(true)}
        <p className="muted">
          Sepolia testnet · Wallet needed only for writes.
        </p>
      </dialog>
    </div>
  );
}
export function PageHeading({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h1>{title}</h1>
        <p className="lead muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <PackageSearch size={30} strokeWidth={1.5} />
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
