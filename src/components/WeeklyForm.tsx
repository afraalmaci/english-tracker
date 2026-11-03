import { useEffect, useState, type FormEvent } from "react";
import { useRows, useSave } from "../api/hooks";
import { formatTr, mondayOf, ymd } from "../lib/dates";
import { Card, Field } from "./ui";
import { toast } from "./Toast";

export function WeeklyForm({ title = "Bu haftanın notu", weekStart = ymd(mondayOf(new Date())) }: { title?: string; weekStart?: string }) {
  const { data: notes = [] } = useRows("weekly_notes");
  const save = useSave("weekly_notes");
  const existing = notes.find((n) => n.week_start === weekStart);
  const [form, setForm] = useState({ learned: "", hard: "", next_focus: "" });

  // Fill the form once the stored note arrives (or when switching weeks).
  useEffect(() => {
    setForm({ learned: existing?.learned ?? "", hard: existing?.hard ?? "", next_focus: existing?.next_focus ?? "" });
  }, [existing?.week_start, existing?.learned, existing?.hard, existing?.next_focus]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate({ week_start: weekStart, ...form }, { onSuccess: () => toast("Haftalık not kaydedildi") });
  };

  return (
    <Card title={title} sub={`Hafta: ${formatTr(weekStart)}`}>
      <form onSubmit={submit}>
        <Field label="Bu hafta öğrendiğim kalıplar">
          <textarea value={form.learned} onChange={(e) => setForm({ ...form, learned: e.target.value })} />
        </Field>
        <Field label="En çok zorlandığım şey">
          <textarea value={form.hard} onChange={(e) => setForm({ ...form, hard: e.target.value })} />
        </Field>
        <Field label="Gelecek haftanın odağı">
          <textarea value={form.next_focus} onChange={(e) => setForm({ ...form, next_focus: e.target.value })} />
        </Field>
        <div className="actions">
          <button className="btn pri" disabled={save.isPending}>Kaydet</button>
        </div>
      </form>
    </Card>
  );
}
