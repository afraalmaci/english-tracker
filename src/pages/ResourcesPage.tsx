import { useState, type FormEvent } from "react";
import { useRows, useSave } from "../api/hooks";
import { ResourceItem } from "../components/ResourceItem";
import { toast } from "../components/Toast";
import { Card, Chips, Empty, ExternalLink, Field, Loading } from "../components/ui";
import { LINKS, PLAN_RESOURCES, RESOURCE_STATUS, RESOURCE_TYPES, SKILLS } from "../lib/plan";
import type { ResourceStatus } from "../lib/types";
import { nowIso, uuid, withProtocol } from "../lib/util";

const EMPTY = { title: "", type: RESOURCE_TYPES[0], author: "", url: "", status: "active" as ResourceStatus, skills: [] as string[] };

export function ResourcesPage() {
  const { data = [], isLoading } = useRows("resources");
  const save = useSave("resources");
  const [f, setF] = useState(EMPTY);
  const [filter, setFilter] = useState<ResourceStatus | "all">("active");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!f.title.trim()) return;
    const now = nowIso();
    save.mutate({ id: uuid(), ...f, title: f.title.trim(), url: withProtocol(f.url.trim()), progress: "", note: "", created_at: now, updated_at: now });
    setF({ ...EMPTY, type: f.type });
    toast("Eklendi");
  };
  const toggleSkill = (s: string) =>
    setF({ ...f, skills: f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s] });

  const count = (s: ResourceStatus) => data.filter((r) => r.status === s).length;
  const shown = data.filter((r) => filter === "all" || r.status === filter);

  return (
    <>
      <Card title="Kaynak ekle" sub="Kitap, podcast, dizi, kanal, app... Devam edenler Bugün ekranında görünür.">
        <form onSubmit={submit}>
          <Field label="Ad">
            <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Örn: English Collocations in Use" required />
          </Field>
          <div className="grid2">
            <Field label="Tür">
              <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
                {RESOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Yazar / kanal">
              <input value={f.author} onChange={(e) => setF({ ...f, author: e.target.value })} placeholder="opsiyonel" />
            </Field>
            <Field label="Link">
              <input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://... (opsiyonel)" />
            </Field>
            <Field label="Durum">
              <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as ResourceStatus })}>
                {Object.entries(RESOURCE_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </Field>
          </div>
          <span className="f">Beceri</span>
          <div className="chips">
            {SKILLS.map((s) => (
              <button key={s} type="button" className={`chip ${f.skills.includes(s) ? "on" : ""}`} onClick={() => toggleSkill(s)}>{s}</button>
            ))}
          </div>
          <div className="actions"><button className="btn pri">Ekle</button></div>
        </form>
      </Card>

      <Card title={<>Kaynaklarım <span className="count">{data.length}</span></>}>
        <Chips
          value={filter}
          onChange={setFilter}
          options={[
            { value: "active", label: `Devam ediyor (${count("active")})` },
            { value: "queue", label: `Sırada (${count("queue")})` },
            { value: "done", label: `Bitti (${count("done")})` },
            { value: "all", label: "Tümü" },
          ]}
        />
        {isLoading ? <Loading /> : shown.length === 0 ? <Empty>Burada henüz kaynak yok.</Empty> : shown.map((r) => <ResourceItem key={r.id} resource={r} />)}
      </Card>

      <Card title="Plandaki kaynaklar" sub="Haftalık programın sabit kaynakları.">
        {PLAN_RESOURCES.map(({ key, purpose }) => (
          <div key={key} className="item">
            <div className="grow">
              <div className="t">{LINKS[key].label}</div>
              <div className="muted">{purpose}</div>
            </div>
            <ExternalLink href={LINKS[key].url} small>Aç</ExternalLink>
          </div>
        ))}
      </Card>
    </>
  );
}
