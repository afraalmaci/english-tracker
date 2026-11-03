import type { Phrase, Vocab } from "./types";

const clean = (s: string) => s.replace(/[\t\r\n]+/g, " ").trim();

export interface AnkiExport {
  text: string;
  count: number;
  phraseIds: string[];
  vocabIds: string[];
}

/**
 * Tab-separated file Anki can import directly (File > Import, Basic note type).
 * Front: English. Back: Turkish / meaning plus example. Third column: tag.
 */
export function buildAnkiExport(phrases: Phrase[], vocab: Vocab[]): AnkiExport {
  const ph = phrases.filter((p) => p.en.trim() && !p.in_anki);
  const vo = vocab.filter((v) => !v.in_anki);
  const lines = ["#separator:tab", "#html:false", "#tags column:3"];
  for (const p of ph) lines.push([clean(p.en), clean(p.example ? `${p.tr} | ${p.example}` : p.tr), "soyleyemediklerim"].join("\t"));
  for (const v of vo) lines.push([clean(v.word), clean([v.meaning, v.sentence].filter(Boolean).join(" | ")), "kelime"].join("\t"));
  return { text: lines.join("\n"), count: ph.length + vo.length, phraseIds: ph.map((p) => p.id), vocabIds: vo.map((v) => v.id) };
}

export const pendingAnkiCount = (phrases: Phrase[], vocab: Vocab[]) =>
  phrases.filter((p) => p.en.trim() && !p.in_anki).length + vocab.filter((v) => !v.in_anki).length;
