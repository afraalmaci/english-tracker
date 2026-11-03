import { useMemo, useState, type FormEvent } from "react";
import { useRemove, useRows, useSave } from "../api/hooks";
import { toast } from "../components/Toast";
import { Card, Empty, ExternalLink, Field, Loading } from "../components/ui";
import { formatTr, ymd } from "../lib/dates";
import { LINKS, WRITING_ERROR_SUGGESTIONS } from "../lib/plan";
import type { WritingLog } from "../lib/types";
import { nowIso, uuid } from "../lib/util";
import { countErrors, grammarPromotions, parseErrorList } from "../lib/writing";

export function WritingPage() {
  const { data = [], isLoading } = useRows("writing_logs");
  const { data: topics = [] } = useRows("grammar_topics");
  const save = useSave("writing_logs");
  const remove = useRemove("writing_logs");
  const saveTopic = useSave("grammar_topics");
  const [f, setF] = useState({ day: ymd(new Date()), level: "", task: "", errors: "" });

  const counts = useMemo(() => [...countErrors(data).values()].sort((a, b) => b.count - a.count), [data]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const log: WritingLog = { id: uuid(), day: f.day || ymd(new Date()), level: f.level.trim(), task: f.task.trim(), errors: parseErrorList(f.errors), created_at: nowIso() };
    save.mutate(log);
    // Repeated mistakes feed the grammar board.
    const promo = grammarPromotions([log, ...data], topics);
    for (const name of promo.create) {
      saveTopic.mutate({ id: uuid(), name, status: "yellow", note: "", auto: true, created_at: nowIso() });
      toast(`${name} Grammar'a 🟡 olarak eklendi`);
    }
    for (const t of promo.downgrade) {
      saveTopic.mutate({ ...t, status: "yellow" });
      toast(`${t.name} tekrar 🟡 oldu`);
    }
    if (!promo.create.length && !promo.downgrade.length) toast("Kaydedildi");
    setF({ ...f, level: "", task: "", errors: "" });
  };

  const addErrorChip = (s: string) => {
    const cur = parseErrorList(f.errors);
    if (!cur.includes(s)) setF({ ...f, errors: [...cur, s].join(", ") });
  };

  return (
    <>
      <Card title="Writing log" sub="Haftalık Write & Improve seviyesini ve tekrar eden hatalarını gir. Hatalar virgülle ayrılır." right={<ExternalLink href={LINKS.wi.url} small>W&I</ExternalLink>}>
        <form onSubmit={submit}>
          <div className="grid2">
            <Field label="Tarih"><input type="date" value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })} /></Field>
            <Field label="Seviye (W&I)"><input value={f.level} onChange={(e) => setF({ ...f, level: e.target.value })} placeholder="B1 high" /></Field>
          </div>
          <Field label="Task"><input value={f.task} onChange={(e) => setF({ ...f, task: e.target.value })} placeholder="Email to a colleague" /></Field>
          <Field label="Hatalar"><input value={f.errors} onChange={(e) => setF({ ...f, errors: e.target.value })} placeholder="articles, prepositions, tense" /></Field>
          <div className="chips" style={{ marginTop: 6 }}>
            {WRITING_ERROR_SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="chip" onClick={() => addErrorChip(s)}>+ {s}</button>
            ))}
          </div>
          <div className="actions"><button className="btn pri">Kaydet</button></div>
        </form>
      </Card>

      <Card title="Tekrar eden hatalar">
        {counts.length === 0 ? <Empty>Henüz kayıt yok.</Empty> : (
          <>
            <div className="chips">
              {counts.map((c) => (
                <span key={c.label} className={`tag big-tag ${c.count >= 2 ? "acc" : ""}`}>{c.label} × {c.count}</span>
              ))}
            </div>
            <div className="muted" style={{ marginTop: 6 }}>2 ve üzeri olanlar Grammar'da 🟡 olarak takipte.</div>
          </>
        )}
      </Card>

      <Card title="Geçmiş">
        {isLoading ? <Loading /> : data.length === 0 ? <Empty>Henüz kayıt yok.</Empty> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tarih</th><th>Seviye</th><th>Task / hatalar</th><th /></tr></thead>
              <tbody>
                {data.map((w) => (
                  <tr key={w.id}>
                    <td>{formatTr(w.day)}</td>
                    <td><b>{w.level}</b></td>
                    <td>{w.task}<div className="muted">{w.errors.join(", ")}</div></td>
                    <td><button className="btn sm ghost" onClick={() => remove.mutate(w.id)}>Sil</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
