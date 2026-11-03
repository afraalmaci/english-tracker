import { addDays, startOfDay, ymd } from "./dates";
import type { DayLog } from "./types";

/** Sundays are rest days: they neither extend nor break a streak. */
export const isPlannedDay = (d: Date) => d.getDay() !== 0;

/**
 * Consecutive planned days on which `field` was done, counting back from today.
 * If today is not done yet, counting starts from yesterday so an open day does not reset the chain.
 */
export function streak(logs: Map<string, DayLog>, field: "anki" | "main", today: Date = new Date()): number {
  let d = startOfDay(today);
  if (!logs.get(ymd(d))?.[field]) d = addDays(d, -1);
  let n = 0;
  for (let guard = 0; guard < 2000; guard++) {
    if (!isPlannedDay(d)) {
      d = addDays(d, -1);
      continue;
    }
    if (logs.get(ymd(d))?.[field]) {
      n++;
      d = addDays(d, -1);
    } else break;
  }
  return n;
}
