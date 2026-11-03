import { streak } from "./streak";
import type { DayLog } from "./types";

const logs = (entries: [string, Partial<DayLog>][]) =>
  new Map(entries.map(([day, v]) => [day, { day, anki: false, main: false, steps: [], ...v }]));

describe("streak", () => {
  // 2026-10-30 is a Friday, 2026-10-25 a Sunday.
  const friday = new Date(2026, 9, 30, 21, 0);

  it("counts consecutive done days including today", () => {
    const m = logs([["2026-10-30", { anki: true }], ["2026-10-29", { anki: true }], ["2026-10-28", { anki: true }]]);
    expect(streak(m, "anki", friday)).toBe(3);
  });

  it("does not break the chain when today is still open", () => {
    const m = logs([["2026-10-29", { anki: true }], ["2026-10-28", { anki: true }]]);
    expect(streak(m, "anki", friday)).toBe(2);
  });

  it("skips Sundays instead of breaking on them", () => {
    const m = logs([["2026-10-27", { anki: true }], ["2026-10-26", { anki: true }], ["2026-10-24", { anki: true }]]);
    const tuesday = new Date(2026, 9, 27);
    expect(streak(m, "anki", tuesday)).toBe(3);
  });

  it("stops at the first missed planned day", () => {
    const m = logs([["2026-10-30", { anki: true }], ["2026-10-28", { anki: true }]]);
    expect(streak(m, "anki", friday)).toBe(1);
  });

  it("tracks fields independently", () => {
    const m = logs([["2026-10-30", { anki: true, main: false }]]);
    expect(streak(m, "main", friday)).toBe(0);
  });
});
