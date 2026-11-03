import type { GrammarTopic, WritingLog } from "./types";
import { countErrors, grammarPromotions, parseErrorList } from "./writing";

const log = (errors: string[]): WritingLog => ({ id: Math.random().toString(), day: "2026-10-30", level: "", task: "", errors, created_at: "" });
const topic = (name: string, status: GrammarTopic["status"]): GrammarTopic => ({ id: name, name, status, note: "", auto: false, created_at: "" });

describe("writing error tracking", () => {
  it("parses comma separated tags", () => {
    expect(parseErrorList(" articles, ,prepositions ")).toEqual(["articles", "prepositions"]);
  });

  it("counts tags case-insensitively", () => {
    const c = countErrors([log(["Articles"]), log(["articles", "tense"])]);
    expect(c.get("articles")?.count).toBe(2);
    expect(c.get("tense")?.count).toBe(1);
  });

  it("creates a yellow topic once an error repeats", () => {
    const p = grammarPromotions([log(["prepositions"]), log(["Prepositions"])], []);
    expect(p.create).toEqual(["Prepositions"]);
  });

  it("ignores errors seen only once", () => {
    expect(grammarPromotions([log(["tense"])], []).create).toEqual([]);
  });

  it("downgrades a green topic that keeps showing up, leaves red/yellow alone", () => {
    const logs = [log(["articles", "tense"]), log(["articles", "tense"])];
    const p = grammarPromotions(logs, [topic("Articles", "green"), topic("Tense", "red")]);
    expect(p.downgrade.map((t) => t.name)).toEqual(["Articles"]);
    expect(p.create).toEqual([]);
  });
});
