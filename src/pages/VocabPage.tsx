import { useState, type FormEvent } from "react";
import { useRemove, useRows, useSave } from "../api/hooks";
import { AnkiExportModal } from "../components/AnkiExportModal";
import { toast } from "../components/Toast";
import { Card, Empty, Field, Loading, Modal } from "../components/ui";
import { pendingAnkiCount } from "../lib/anki";
import { VOCAB_GROUPS } from "../lib/plan";
import type { Vocab, VocabGroup } from "../lib/types";
import { nowIso, uuid } from "../lib/util";

const GROUP_ORDER: VocabGroup[] = [2, 1, 3];

export function VocabPage() {
  const { data = [], isLoading } = useRows("vocab");
  const { data: phrases = [] } = useRows("phrases");
  const save = useSave("vocab");
  const [f, setF] = useState({ word: "", meaning: "", sentence: "", group: 1 as VocabGroup });
  const [editing, setEditing] = useState<Vocab | null>(null);
  const [exporting, setExporting] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!f.word.trim()) return;
    save.mutate({ id: uuid(), ...f, word: f.word.trim(), in_anki: false, created_at: nowIso() });
    setF({ word: "", meaning: "", sentence: "", group: f.group });
    toast("Eklendi");
  };
  const pending = pendingAnkiCount(phrases, data);

  return (
    <>
      <Card title="Kelime" sub="Kelimeyi her zaman bir cümleyle kaydet. Asıl odak: 2. grup.">
        <form onSubmit={submit}>
          <div className="grid2">
            <Field label="Kelime / kalıp"><input value={f.word} onChange={(e) => setF({ ...f, word: e.target.value })} placeholder="come across" required /></Field>
            <Field label="Anlamı"><input value={f.meaning} onChange={(e) => setF({ ...f, meaning: e.target.value })} placeholder="rastlamak, karşılaşmak" /></Field>
          </div>
          <Field label="Örnek cümle"><input value={f.sentence} onChange={(e) => setF({ ...f, sentence: e.target.value })} placeholder="I came across this issue in my last project." /></Field>
          <div className="actions">
            <select value={f.group} onChange={(e) => setF({ ...f, group: Number(e.target.value) as VocabGroup })} style={{ width: "auto" }}>
              {([1, 2, 3] as VocabGroup[]).map((g) => <option key={g} value={g}>{g}. {VOCAB_GROUPS[g]}</option>)}
            </select>
            <button className="btn pri">Ekle</button>
          </div>
        </form>
      </Card>

      <Card title="Gruplar" right={<button className="btn sm" disabled={!pending} onClick={() => setExporting(true)}>Anki'ye aktar ({pending})</button>}>
        {isLoading ? <Loading /> : (
          <div className="cols">
            {GROUP_ORDER.map((g) => {
              const items = data.filter((v) => v.group === g);
              return (
                <div key={g} className="col">
                  <h4>{g}. {VOCAB_GROUPS[g]} <span className="count">{items.length}</span></h4>
                  {items.length === 0 && <Empty>Boş</Empty>}
                  {items.map((v) => (
                    <div key={v.id} className="item tight">
                      <div className="grow">
                        <div className="t">{v.word} {v.in_anki && <span className="tag acc">Anki</span>}</div>
                        {v.meaning && <div className="muted">{v.meaning}</div>}
                        {v.sentence && <div className="muted"><i>{v.sentence}</i></div>}
                        <div className="row" style={{ marginTop: 4 }}>
                          {g > 1 && <button className="btn sm" onClick={() => save.mutate({ ...v, group: (g - 1) as VocabGroup })}>← {g - 1}</button>}
                          {g < 3 && <button className="btn sm" onClick={() => save.mutate({ ...v, group: (g + 1) as VocabGroup })}>{g + 1} →</button>}
                          <button className="btn sm ghost" onClick={() => setEditing(v)}>Düzenle</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </Card>
      {editing && <VocabEdit vocab={editing} onClose={() => setEditing(null)} />}
      {exporting && <AnkiExportModal phrases={phrases} vocab={data} onClose={() => setExporting(false)} />}
    </>
  );
}

function VocabEdit({ vocab, onClose }: { vocab: Vocab; onClose: () => void }) {
  const save = useSave("vocab");
  const remove = useRemove("vocab");
  const [f, setF] = useState(vocab);
  return (
    <Modal open onClose={onClose} title="Düzenle">
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(f); onClose(); }}>
        <Field label="Kelime"><input value={f.word} onChange={(e) => setF({ ...f, word: e.target.value })} required /></Field>
        <Field label="Anlamı"><input value={f.meaning} onChange={(e) => setF({ ...f, meaning: e.target.value })} /></Field>
        <Field label="Örnek cümle"><input value={f.sentence} onChange={(e) => setF({ ...f, sentence: e.target.value })} /></Field>
        <label className="inline"><input type="checkbox" checked={f.in_anki} onChange={(e) => setF({ ...f, in_anki: e.target.checked })} /> Anki'de</label>
        <div className="actions">
          <button className="btn pri">Kaydet</button>
          <button type="button" className="btn ghost" onClick={onClose}>Vazgeç</button>
          <span className="grow" />
          <button type="button" className="btn ghost" onClick={() => { remove.mutate(vocab.id); onClose(); }}>Sil</button>
        </div>
      </form>
    </Modal>
  );
}
