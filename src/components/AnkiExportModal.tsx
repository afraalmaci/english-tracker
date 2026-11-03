import { useMemo } from "react";
import { useSave } from "../api/hooks";
import { buildAnkiExport } from "../lib/anki";
import { ymd } from "../lib/dates";
import type { Phrase, Vocab } from "../lib/types";
import { downloadText } from "../lib/util";
import { toast } from "./Toast";
import { Modal } from "./ui";

export function AnkiExportModal({ phrases, vocab, onClose }: { phrases: Phrase[]; vocab: Vocab[]; onClose: () => void }) {
  const exp = useMemo(() => buildAnkiExport(phrases, vocab), [phrases, vocab]);
  const savePhrase = useSave("phrases");
  const saveVocab = useSave("vocab");

  const markDone = () => {
    for (const p of phrases) if (exp.phraseIds.includes(p.id)) savePhrase.mutate({ ...p, in_anki: true });
    for (const v of vocab) if (exp.vocabIds.includes(v.id)) saveVocab.mutate({ ...v, in_anki: true });
    toast("Anki'de olarak işaretlendi");
    onClose();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exp.text);
      toast("Kopyalandı");
    } catch {
      toast("Kopyalanamadı, metni elle seç");
    }
  };

  return (
    <Modal open onClose={onClose} title="Anki'ye aktar">
      <div className="muted">
        {exp.count} kart. Ön yüz İngilizce, arka yüz Türkçe + örnek. Anki'de File → Import ile aç (Basic not tipi).
      </div>
      <textarea readOnly value={exp.text} style={{ minHeight: 160, marginTop: 10, fontSize: 12 }} />
      <div className="actions">
        <button className="btn pri" onClick={() => downloadText(`anki-${ymd(new Date())}.txt`, exp.text)}>Dosya indir (.txt)</button>
        <button className="btn" onClick={copy}>Kopyala</button>
        <button className="btn" onClick={markDone}>Aktarıldı olarak işaretle</button>
        <button className="btn ghost" onClick={onClose}>Kapat</button>
      </div>
    </Modal>
  );
}
