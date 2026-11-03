import type { LevelTest } from "./types";

export type ScoreKey = keyof Pick<LevelTest, "bc_grammar" | "bc_vocab" | "bc_level" | "ef_reading" | "ef_listening" | "ef_total" | "cefr">;

export const TEST_FIELDS: { key: ScoreKey; label: string; placeholder: string }[] = [
  { key: "bc_grammar", label: "BC Grammar", placeholder: "puan" },
  { key: "bc_vocab", label: "BC Vocabulary", placeholder: "puan" },
  { key: "bc_level", label: "BC seviye", placeholder: "B2" },
  { key: "ef_reading", label: "EF Reading", placeholder: "puan" },
  { key: "ef_listening", label: "EF Listening", placeholder: "puan" },
  { key: "ef_total", label: "EF Toplam", placeholder: "puan" },
  { key: "cefr", label: "EF CEFR", placeholder: "B2" },
];

/** Numeric change between two score strings like "62" or "45/60"; null when either is not a number. */
export function scoreDelta(prev: string, cur: string): number | null {
  const a = parseFloat(prev);
  const b = parseFloat(cur);
  if (Number.isNaN(a) || Number.isNaN(b) || a === b) return null;
  return Math.round((b - a) * 10) / 10;
}
