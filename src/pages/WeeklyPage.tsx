import { useRows } from "../api/hooks";
import { WeeklyForm } from "../components/WeeklyForm";
import { Card, Empty } from "../components/ui";
import { formatTr, mondayOf, ymd } from "../lib/dates";

export function WeeklyPage() {
  const { data = [] } = useRows("weekly_notes");
  const current = ymd(mondayOf(new Date()));
  const past = data.filter((n) => n.week_start !== current);
  return (
    <>
      <WeeklyForm />
      <Card title="Önceki haftalar">
        {past.length === 0 ? <Empty>Henüz yok.</Empty> : past.map((w) => (
          <div key={w.week_start} className="item">
            <div className="grow">
              <div className="t">{formatTr(w.week_start)} haftası</div>
              {w.learned && <div><span className="muted">Kalıplar:</span> {w.learned}</div>}
              {w.hard && <div><span className="muted">Zorlandım:</span> {w.hard}</div>}
              {w.next_focus && <div><span className="muted">Odak:</span> {w.next_focus}</div>}
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}
