import { useState, type FormEvent } from "react";
import { useRemove, useRows, useSave } from "../api/hooks";
import { Card, Empty, Field, Loading, Modal } from "../components/ui";
import { GRAMMAR_SUGGESTIONS, STATUS_ICON, STATUS_LABEL, STATUS_NEXT, STATUS_ORDER } from "../lib/plan";
import type { GrammarStatus, GrammarTopic } from "../lib/types";
import { nowIso, uuid } from "../lib/util";
import { normalize } from "../lib/writing";

const STATUSES: GrammarStatus[] = ["red", "yellow", "green"];

export function GrammarPage() {
  const { data = [], isLoading } = useRows("grammar_topics");
  const save = useSave("grammar_topics");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<GrammarStatus>("red");
  const [editing, setEditing] = useState<GrammarTopic | null>(null);

  const have = new Set(data.map((t) => normalize(t.name)));
  const add = (n: string, s: GrammarStatus) => {
    const clean = n.trim();
    if (!clean || have.has(normalize(clean))) return;
    save.mutate({ id: uuid(), name: clean, status: s, note: "", auto: false, created_at: nowIso() });
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    add(name, status);
    setName("");
  };
  const sorted = [...data].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name));

  return (
    <>
      <Card title="Grammar takibi" sub="Duruma tıklayınca değişir: 🔴 → 🟡 → 🟢. Writing'de aynı hata 2 kez çıkarsa konu otomatik 🟡 olarak gelir.">
        <div className="tags" style={{ marginTop: 10 }}>
          {STATUSES.map((s) => (
            <span key={s} className="tag">{STATUS_ICON[s]} {STATUS_LABEL[s]}: {data.filter((t) => t.status === s).length}</span>
          ))}
        </div>
        <form onSubmit={submit} className="row" style={{ marginTop: 10 }}>
          <input className="grow" value={name} onChange={(e) => setName(e.target.value)} placeholder="Konu ekle (örn: Present perfect)" required style={{ width: "auto" }} />
          <select value={status} onChange={(e) => setStatus(e.target.value as GrammarStatus)} style={{ width: "auto" }}>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_ICON[s]}</option>)}
          </select>
          <button className="btn pri">Ekle</button>
        </form>
        <div className="muted" style={{ marginTop: 10 }}>Hızlı ekle:</div>
        <div className="chips" style={{ marginTop: 6 }}>
          {GRAMMAR_SUGGESTIONS.filter((s) => !have.has(normalize(s))).map((s) => (
            <button key={s} type="button" className="chip" onClick={() => add(s, "red")}>+ {s}</button>
          ))}
        </div>
      </Card>

      <Card title={<>Konular <span className="count">{data.length}</span></>}>
        {isLoading ? <Loading /> : sorted.length === 0 ? <Empty>Testten sonra zayıf çıkan konuları buraya ekle.</Empty> : sorted.map((t) => (
          <div key={t.id} className="item">
            <button className="st" title={STATUS_LABEL[t.status]} onClick={() => save.mutate({ ...t, status: STATUS_NEXT[t.status] })}>
              {STATUS_ICON[t.status]}
            </button>
            <div className="grow">
              <div className="t">{t.name}</div>
              {t.note && <div className="muted">{t.note}</div>}
              {t.auto && <span className="tag">Writing hatalarından</span>}
            </div>
            <button className="btn sm ghost" onClick={() => setEditing(t)}>Not</button>
          </div>
        ))}
      </Card>
      {editing && <GrammarEdit topic={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function GrammarEdit({ topic, onClose }: { topic: GrammarTopic; onClose: () => void }) {
  const save = useSave("grammar_topics");
  const remove = useRemove("grammar_topics");
  const [f, setF] = useState(topic);
  return (
    <Modal open onClose={onClose} title={topic.name}>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(f); onClose(); }}>
        <Field label="Durum">
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as GrammarStatus })}>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_ICON[s]} {STATUS_LABEL[s]}</option>)}
          </select>
        </Field>
        <Field label="Not (kural, tipik hatan)">
          <textarea value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        </Field>
        <div className="actions">
          <button className="btn pri">Kaydet</button>
          <button type="button" className="btn ghost" onClick={onClose}>Vazgeç</button>
          <span className="grow" />
          <button type="button" className="btn ghost" onClick={() => { remove.mutate(topic.id); onClose(); }}>Sil</button>
        </div>
      </form>
    </Modal>
  );
}
