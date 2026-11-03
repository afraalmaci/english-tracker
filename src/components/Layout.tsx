import { useMemo } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useRows } from "../api/hooks";
import { streak } from "../lib/streak";

const TABS = [
  { to: "/", label: "Bugün" },
  { to: "/kaynaklar", label: "Kaynaklar" },
  { to: "/kelime", label: "Kelime" },
  { to: "/grammar", label: "Grammar" },
  { to: "/writing", label: "Writing" },
  { to: "/hafta", label: "Pazar notu" },
  { to: "/testler", label: "Testler" },
  { to: "/soyleyemediklerim", label: "Söyleyemediklerim" },
];

export function Layout() {
  const { data: days = [] } = useRows("day_logs");
  const ankiStreak = useMemo(() => streak(new Map(days.map((d) => [d.day, d])), "anki"), [days]);
  return (
    <>
      <header className="top">
        <div>
          <h1>English Tracker</h1>
        </div>
        <div className="row">
          <span className="streak" title="Anki zinciri">🔥 {ankiStreak} gün</span>
          <Link to="/ayarlar" className="btn ghost sm" aria-label="Ayarlar">⚙︎</Link>
        </div>
      </header>
      <nav className="tabs">
        <div className="in">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.to === "/"} className={({ isActive }) => (isActive ? "on" : "")}>
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}
