import type { GrammarTopic, WritingLog } from "./types";

export const normalize = (s: string) => s.trim().toLowerCase();

/** How often each error tag appears across all writing logs, keyed by normalized tag. */
export function countErrors(logs: WritingLog[]): Map<string, { label: string; count: number }> {
  const m = new Map<string, { label: string; count: number }>();
  for (const log of logs) {
    for (const raw of log.errors) {
      const key = normalize(raw);
      if (!key) continue;
      const cur = m.get(key);
      m.set(key, { label: cur?.label ?? raw.trim(), count: (cur?.count ?? 0) + 1 });
    }
  }
  return m;
}

export interface Promotion {
  /** New topics to create with status yellow. */
  create: string[];
  /** Existing green topics that should drop back to yellow. */
  downgrade: GrammarTopic[];
}

/** An error seen `threshold` or more times becomes (or returns to) a yellow grammar topic. */
export function grammarPromotions(logs: WritingLog[], topics: GrammarTopic[], threshold = 2): Promotion {
  const byName = new Map(topics.map((t) => [normalize(t.name), t]));
  const out: Promotion = { create: [], downgrade: [] };
  for (const [key, { label, count }] of countErrors(logs)) {
    if (count < threshold) continue;
    const topic = byName.get(key);
    if (!topic) out.create.push(label.charAt(0).toUpperCase() + label.slice(1));
    else if (topic.status === "green") out.downgrade.push(topic);
  }
  return out;
}

export const parseErrorList = (s: string) =>
  s.split(",").map((x) => x.trim()).filter(Boolean);
