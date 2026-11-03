import { buildAnkiExport, pendingAnkiCount } from "./anki";
import type { Phrase, Vocab } from "./types";

const phrase = (p: Partial<Phrase>): Phrase => ({ id: "p", tr: "", en: "", example: "", source: "", in_anki: false, created_at: "", ...p });
const vocab = (v: Partial<Vocab>): Vocab => ({ id: "v", word: "", meaning: "", sentence: "", group: 1, in_anki: false, created_at: "", ...v });

describe("anki export", () => {
  it("exports only phrases with English that are not in Anki yet", () => {
    const exp = buildAnkiExport(
      [phrase({ id: "a", tr: "merhaba", en: "hello" }), phrase({ id: "b", tr: "eksik" }), phrase({ id: "c", tr: "x", en: "y", in_anki: true })],
      [],
    );
    expect(exp.phraseIds).toEqual(["a"]);
    expect(exp.count).toBe(1);
  });

  it("writes a tab separated file with Anki headers and tags", () => {
    const exp = buildAnkiExport([], [vocab({ id: "v1", word: "come across", meaning: "rastlamak", sentence: "I came across it." })]);
    const lines = exp.text.split("\n");
    expect(lines.slice(0, 3)).toEqual(["#separator:tab", "#html:false", "#tags column:3"]);
    expect(lines[3]).toBe("come across\trastlamak | I came across it.\tkelime");
  });

  it("strips tabs and newlines from fields so rows stay intact", () => {
    const exp = buildAnkiExport([phrase({ tr: "a\tb", en: "line1\nline2" })], []);
    expect(exp.text.split("\n")[3]).toBe("line1 line2\ta b\tsoyleyemediklerim");
  });

  it("counts pending cards", () => {
    expect(pendingAnkiCount([phrase({ en: "x" })], [vocab({}), vocab({ in_anki: true })])).toBe(2);
  });
});
