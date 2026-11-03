import { useState, type FormEvent } from "react";
import { useRemove, useRows, useSave } from "../api/hooks";
import { toast } from "../components/Toast";
import { Card, Field, PlanLinks } from "../components/ui";
import { addDays, formatTr, parseYmd, ymd } from "../lib/dates";
import { RETEST_MAX_DAYS, RETEST_MIN_DAYS } from "../lib/plan";
import { scoreDelta, TEST_FIELDS, type ScoreKey } from "../lib/tests";
import type { LevelTest } from "../lib/types";
import { nowIso, uuid } from "../lib/util";

type Scores = Record<ScoreKey, string>;
const emptyScores = () => Object.fromEntries(TEST_FIELDS.map((f) => [f.key, ""])) as Scores;

export function TestsPage() {
  const { data = [] } = useRows("level_tests");
  const save = useSave("level_tests");
  const remove = useRemove("level_tests");
  const [day, setDay] = useState(ymd(new Date()));
  const [scores, setScores] = useState<Scores>(emptyScores);
  const [note, setNote] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const row: LevelTest = { id: uuid(), day, note: note.trim(), created_at: nowIso(), ...scores };
    save.mutate(row);
    setScores(emptyScores());
    setNote("");
    toast("Test sonucu kaydedildi");
  };

  const last = data.at(-1);
  return (
    <>
      <Card title="Seviye testleri" sub="Her 6-8 haftada bir iki testi tekrar çöz.">
        <PlanLinks keys={["bctest", "efset"]} />
        <form onSubmit={submit}>
          <div className="grid2" style={{ marginTop: 6 }}>
            <Field label="Tarih"><input type="date" value={day} onChange={(e) => setDay(e.target.value)} /></Field>
            <div />
            {TEST_FIELDS.map((f) => (
              <Field key={f.key} label={f.label}>
                <input value={scores[f.key]} placeholder={f.placeholder} onChange={(e) => setScores({ ...scores, [f.key]: e.target.value })} />
              </Field>
            ))}
          </div>
          <Field label="Not"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Zorlandığın bölüm, gözlemler" /></Field>
          <div className="actions"><button className="btn pri">Kaydet</button></div>
        </form>
      </Card>

      {last && (
        <Card>
          <div className="muted">Sonraki test aralığı</div>
          <div className="title-lg">
            {formatTr(ymd(addDays(parseYmd(last.day), RETEST_MIN_DAYS)))} - {formatTr(ymd(addDays(parseYmd(last.day), RETEST_MAX_DAYS)))}
          </div>
        </Card>
      )}

      {data.length > 0 && (
        <Card title="Karşılaştırma">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th />{data.map((t) => <th key={t.id}>{formatTr(t.day)}</th>)}</tr>
              </thead>
              <tbody>
                {TEST_FIELDS.map((f) => (
                  <tr key={f.key}>
                    <td className="muted">{f.label}</td>
                    {data.map((t, i) => {
                      const d = i > 0 ? scoreDelta(data[i - 1][f.key], t[f.key]) : null;
                      return (
                        <td key={t.id}>
                          <b>{t[f.key]}</b>
                          {d !== null && <span className={d > 0 ? "up" : "down"}> {d > 0 ? "+" : ""}{d}</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr><td className="muted">Not</td>{data.map((t) => <td key={t.id} className="muted">{t.note}</td>)}</tr>
                <tr><td />{data.map((t) => <td key={t.id}><button className="btn sm ghost" onClick={() => remove.mutate(t.id)}>Sil</button></td>)}</tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
