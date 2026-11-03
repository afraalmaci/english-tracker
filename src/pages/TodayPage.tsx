import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useRows, useSave } from "../api/hooks";
import { ResourceItem } from "../components/ResourceItem";
import { WeeklyForm } from "../components/WeeklyForm";
import { Card, ExternalLink, Loading, PlanLinks } from "../components/ui";
import { addDays, DAY_NAMES, daysBetween, formatTr, mondayOf, WEEK_SHORT, ymd } from "../lib/dates";
import { LINKS, RETEST_MIN_DAYS, WEEK_PLAN } from "../lib/plan";
import { streak } from "../lib/streak";
import type { DayLog } from "../lib/types";

export function TodayPage() {
  const days = useRows("day_logs");
  const tests = useRows("level_tests");
  const notes = useRows("weekly_notes");
  const resources = useRows("resources");
  const save = useSave("day_logs");

  const now = new Date();
  const today = ymd(now);
  const weekday = now.getDay();
  const plan = WEEK_PLAN[weekday];

  const logs = useMemo(() => new Map((days.data ?? []).map((d) => [d.day, d])), [days.data]);
  const rec: DayLog = logs.get(today) ?? { day: today, anki: false, main: false, steps: [] };

  if (days.isLoading) return <Loading />;

  const toggle = (field: "anki" | "main") => save.mutate({ ...rec, [field]: !rec[field] });
  const toggleStep = (i: number) => {
    const steps = plan.steps.map((_, j) => Boolean(rec.steps[j]));
    steps[i] = !steps[i];
    save.mutate({ ...rec, steps });
  };

  const lastTest = (tests.data ?? []).at(-1);
  const sinceTest = lastTest ? daysBetween(lastTest.day, today) : 0;
  const monday = mondayOf(now);
  const lastWeekKey = ymd(addDays(monday, -7));
  const missingLastWeek = weekday === 1 && notes.data && !notes.data.some((n) => n.week_start === lastWeekKey);
  const active = (resources.data ?? []).filter((r) => r.status === "active");

  return (
    <>
      {tests.data && !lastTest && (
        <Card title="Başlangıç: seviye testi" sub="Sözlük yok, emin olmadığında tahmin et, her bölümün puanını not et.">
          <PlanLinks keys={["bctest", "efset"]} />
          <div className="actions">
            <Link className="btn pri" to="/testler">Sonuçları gir</Link>
          </div>
        </Card>
      )}
      {lastTest && sinceTest >= RETEST_MIN_DAYS && (
        <div className="banner">
          Son testin üzerinden {sinceTest} gün geçti. Tekrar test zamanı. <Link to="/testler">Testler</Link>
        </div>
      )}
      {missingLastWeek && (
        <div className="banner">
          Geçen haftanın notu boş. <Link to="/hafta">Şimdi yaz</Link>
        </div>
      )}

      <Card>
        <div className="muted">{DAY_NAMES[weekday]}, {formatTr(today)}</div>
        <h2 className="title-lg">{plan.title}</h2>
        <div className="muted">{plan.duration}</div>
        {plan.links.length > 0 && <PlanLinks keys={plan.links} primaryFirst />}
        <ul className="steps">
          {plan.steps.map((s, i) => (
            <li key={s} className={rec.steps[i] ? "ok" : ""} onClick={() => toggleStep(i)}>
              <span className="dot" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
        {!plan.rest && (
          <>
            <CheckRow done={rec.anki} onToggle={() => toggle("anki")} title="Anki tekrarı (10 dk)" sub="Zinciri kırma">
              <ExternalLink href={LINKS.anki.url} small>AnkiWeb</ExternalLink>
            </CheckRow>
            <CheckRow done={rec.main} onToggle={() => toggle("main")} title="Ana çalışma yapıldı" sub={plan.title} />
          </>
        )}
      </Card>

      {plan.rest && <WeeklyForm title="Haftalık not (5 dk)" />}

      <Card title="Bu hafta" right={<span className="muted legend"><i className="pip a" /> Anki <i className="pip m" /> Ana çalışma</span>}>
        <div className="week">
          {WEEK_SHORT.map((label, i) => {
            const key = ymd(addDays(monday, i));
            const r = logs.get(key);
            return (
              <div key={key} className={`d ${key === today ? "today" : ""}`}>
                {label}
                <div className="pips">
                  <i className={`pip ${r?.anki ? "a" : ""}`} />
                  <i className={`pip ${r?.main ? "m" : ""}`} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="row stats">
          <div className="grow">
            <div className="big">{streak(logs, "anki", now)}</div>
            <div className="muted">Anki zinciri (Pazar sayılmaz)</div>
          </div>
          <div className="grow">
            <div className="big">{streak(logs, "main", now)}</div>
            <div className="muted">Ana çalışma serisi</div>
          </div>
        </div>
      </Card>

      {active.length > 0 && (
        <Card title="Devam eden kaynaklar" right={<Link className="btn sm ghost" to="/kaynaklar">Tümü</Link>}>
          {active.map((r) => (
            <ResourceItem key={r.id} resource={r} compact />
          ))}
        </Card>
      )}
    </>
  );
}

function CheckRow({ done, onToggle, title, sub, children }: { done: boolean; onToggle: () => void; title: string; sub: string; children?: React.ReactNode }) {
  return (
    <div className={`check ${done ? "done" : ""}`}>
      <button type="button" className="check-hit" onClick={onToggle} aria-pressed={done}>
        <span className="box">{done ? "✓" : ""}</span>
        <span className="grow">
          <b>{title}</b>
          <span className="muted">{sub}</span>
        </span>
      </button>
      {children}
    </div>
  );
}
