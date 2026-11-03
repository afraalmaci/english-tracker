import { daysBetween, mondayOf, ymd } from "./dates";
import { scoreDelta } from "./tests";

describe("dates", () => {
  it("formats local dates without UTC shift", () => {
    expect(ymd(new Date(2026, 9, 30, 23, 59))).toBe("2026-10-30");
  });
  it("finds Monday of the week, Sunday belongs to the previous week", () => {
    expect(ymd(mondayOf(new Date(2026, 10, 1)))).toBe("2026-10-26");
    expect(ymd(mondayOf(new Date(2026, 9, 26)))).toBe("2026-10-26");
  });
  it("counts days across a DST change", () => {
    expect(daysBetween("2026-10-24", "2026-10-26")).toBe(2);
  });
});

describe("scoreDelta", () => {
  it("returns numeric change", () => expect(scoreDelta("52", "61.5")).toBe(9.5));
  it("handles x/y scores by leading number", () => expect(scoreDelta("40/60", "45/60")).toBe(5));
  it("returns null for levels and equal values", () => {
    expect(scoreDelta("B1", "B2")).toBeNull();
    expect(scoreDelta("50", "50")).toBeNull();
  });
});
