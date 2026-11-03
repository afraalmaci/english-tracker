import { useState, type FormEvent } from "react";
import { useRemove, useRows, useSave } from "../api/hooks";
import { AnkiExportModal } from "../components/AnkiExportModal";
import { toast } from "../components/Toast";
import { Card, Chips, Empty, Field, Loading, Modal } from "../components/ui";
import { pendingAnkiCount } from "../lib/anki";
import { formatTr, ymd } from "../lib/dates";
import { PHRASE_SOURCES } from "../lib/plan";
import type { Phrase } from "../lib/types";
import { nowIso, uuid } from "../lib/util";

type Filter = "all" | "noen" | "pending" | "done";

export function PhrasesPage() {
  const { data = [], isLoading } = useRows("phrases");
  const { data: vocab = [] } = useRows("vocab");
  const save = useSave("phrases");
  const [f, setF] = useState({ tr: "", en: "", example: "", source: PHRASE_SOURCES[0] });
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<Phrase | null>(null);
  const [exporting, setExporting] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!f.tr.trim()) return;
    save.mutate({ id: uuid(), tr: f.tr.trim(), en: f.en.trim(), example: f.example.trim(), source: f.source, in_anki: false, created_at: nowIso() });
    setF({ ...f, tr: "", en: "", example: "" });
    toast("Eklendi");
  };

  const noEn = data.filter((p) => !p.en).length;
  const pendingHere = data.filter((p) => p.en && !p.in_anki).length;
  const shown = data.filter((p) =>
    filter === "all" || (filter === "noen" && !p.en) || (filter === "pending" && p.en && !p.in_anki) || (filter === "done" && p.in_anki));

  return (
    <>
      <Card title="Söyleyemediklerim" sub="Söylemek isteyip diyemediğin şeyler. Türkçe yaz, İngilizcesini öğren, Anki'ye aktar.">
        <form onSubmit={submit}>
          <Field label="Türkçe"><input value={f.tr} onChange={(e) => setF({ ...f, tr: e.target.value })} required placeholder="Örn: Bu konuda pek deneyimim yok ama hızlı öğrenirim" /></Field>
          <Field label="İngilizcesi"><input value={f.en} onChange={(e) => setF({ ...f, en: e.target.value })} placeholder="I don't have much experience with that, but I pick things up quickly." /></Field>
          <div className="grid2">
            <Field label="Örnek cümle / not"><input value={f.example} onChange={(e) => setF({ ...f, example: e.target.value })} placeholder="opsiyonel" /></Field>
            <Field label="Nerede">
              <select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })}>
                {PHRASE_SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="actions"><button className="btn pri">Ekle</button></div>
        </form>
      </Card>

      <Card
        title={<>Liste <span className="count">{data.length}</span></>}
        right={<button className="btn sm" disabled={!pendingAnkiCount(data, vocab)} onClick={() => setExporting(true)}>Anki'ye aktar ({pendingHere})</button>}
      >
        <Chips
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Tümü" },
            { value: "noen", label: `İngilizcesi eksik (${noEn})` },
            { value: "pending", label: `Anki'de değil (${pendingHere})` },
            { value: "done", label: "Anki'de" },
          ]}
        />
        {isLoading ? <Loading /> : shown.length === 0 ? <Empty>Burada henüz bir şey yok.</Empty> : shown.map((p) => (
          <div key={p.id} className="item">
            <div className="grow">
              <div className="t">{p.en || <span className="muted">İngilizcesi eksik</span>}</div>
              <div className="muted">{p.tr}</div>
              {p.example && <div className="muted"><i>{p.example}</i></div>}
              <div className="tags">
                {p.source && <span className="tag">{p.source}</span>}
                {p.in_anki && <span className="tag acc">Anki ✓</span>}
                <span className="tag">{formatTr(ymd(new Date(p.created_at)))}</span>
              </div>
            </div>
            <button className="btn sm" onClick={() => setEditing(p)}>Düzenle</button>
          </div>
        ))}
      </Card>
      {editing && <PhraseEdit phrase={editing} onClose={() => setEditing(null)} />}
      {exporting && <AnkiExportModal phrases={data} vocab={vocab} onClose={() => setExporting(false)} />}
    </>
  );
}

function PhraseEdit({ phrase, onClose }: { phrase: Phrase; onClose: () => void }) {
  const save = useSave("phrases");
  const remove = useRemove("phrases");
  const [f, setF] = useState(phrase);
  return (
    <Modal open onClose={onClose} title="Düzenle">
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(f); onClose(); }}>
        <Field label="Türkçe"><input value={f.tr} onChange={(e) => setF({ ...f, tr: e.target.value })} required /></Field>
        <Field label="İngilizcesi"><input value={f.en} onChange={(e) => setF({ ...f, en: e.target.value })} autoFocus /></Field>
        <Field label="Örnek / not"><input value={f.example} onChange={(e) => setF({ ...f, example: e.target.value })} /></Field>
        <label className="inline"><input type="checkbox" checked={f.in_anki} onChange={(e) => setF({ ...f, in_anki: e.target.checked })} /> Anki'de</label>
        <div className="actions">
          <button className="btn pri">Kaydet</button>
          <button type="button" className="btn ghost" onClick={onClose}>Vazgeç</button>
          <span className="grow" />
          <button type="button" className="btn ghost" onClick={() => { remove.mutate(phrase.id); onClose(); }}>Sil</button>
        </div>
      </form>
    </Modal>
  );
}
