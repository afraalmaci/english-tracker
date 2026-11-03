import { useEffect, type ReactNode } from "react";
import { LINKS, type LinkKey } from "../lib/plan";

export function Card({ title, sub, right, children }: { title?: ReactNode; sub?: ReactNode; right?: ReactNode; children?: ReactNode }) {
  return (
    <section className="card">
      {(title || right) && (
        <div className="row">
          {title && <h2 className="grow">{title}</h2>}
          {right}
        </div>
      )}
      {sub && <div className="muted">{sub}</div>}
      {children}
    </section>
  );
}

export function ExternalLink({ href, children, primary, small }: { href: string; children: ReactNode; primary?: boolean; small?: boolean }) {
  return (
    <a className={`btn ${primary ? "pri" : ""} ${small ? "sm" : ""}`} href={href} target="_blank" rel="noopener noreferrer">
      {children} ↗
    </a>
  );
}

export function PlanLinks({ keys, primaryFirst }: { keys: LinkKey[]; primaryFirst?: boolean }) {
  return (
    <div className="row" style={{ marginTop: 10 }}>
      {keys.map((k, i) => (
        <ExternalLink key={k} href={LINKS[k].url} primary={primaryFirst && i === 0}>
          {LINKS[k].label}
        </ExternalLink>
      ))}
    </div>
  );
}

export function Chips<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="chips" style={{ margin: "8px 0" }}>
      {options.map((o) => (
        <button key={o.value} type="button" className={`chip ${value === o.value ? "on" : ""}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="f">{label}</span>
      {children}
    </label>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card" role="dialog" aria-modal="true">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export const Empty = ({ children }: { children: ReactNode }) => <div className="empty">{children}</div>;

export const Loading = () => <div className="card"><div className="muted">Yükleniyor...</div></div>;
