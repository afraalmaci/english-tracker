import { useState, type FormEvent } from "react";
import { useRemove, useSave } from "../api/hooks";
import { RESOURCE_STATUS } from "../lib/plan";
import type { Resource, ResourceStatus } from "../lib/types";
import { nowIso, withProtocol } from "../lib/util";
import { Field, Modal } from "./ui";

export function ResourceItem({ resource: r, compact }: { resource: Resource; compact?: boolean }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="item">
      <div className="grow">
        <div className="t">
          {r.url ? (
            <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title} ↗</a>
          ) : (
            r.title
          )}
        </div>
        {r.author && <div className="muted">{r.author}</div>}
        {r.progress && (
          <div>
            <span className="muted">İlerleme:</span> <b>{r.progress}</b>
          </div>
        )}
        {!compact && r.note && <div className="muted">{r.note}</div>}
        <div className="tags">
          <span className="tag">{r.type}</span>
          {r.skills.map((s) => (
            <span key={s} className="tag acc">{s}</span>
          ))}
          {!compact && <span className="tag">{RESOURCE_STATUS[r.status]}</span>}
        </div>
      </div>
      <button className="btn sm" onClick={() => setEditing(true)}>{compact ? "Güncelle" : "Düzenle"}</button>
      {editing && <ResourceEditModal resource={r} onClose={() => setEditing(false)} />}
    </div>
  );
}

function ResourceEditModal({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const save = useSave("resources");
  const remove = useRemove("resources");
  const [f, setF] = useState(resource);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate({ ...f, title: f.title.trim() || resource.title, url: withProtocol(f.url.trim()), updated_at: nowIso() });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={resource.title}>
      <form onSubmit={submit}>
        <Field label="İlerleme">
          <input value={f.progress} onChange={(e) => setF({ ...f, progress: e.target.value })} placeholder="Örn: Unit 12 / Bölüm 4 / s. 85" autoFocus />
        </Field>
        <Field label="Durum">
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as ResourceStatus })}>
            {Object.entries(RESOURCE_STATUS).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Ad">
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
        </Field>
        <div className="grid2">
          <Field label="Yazar / kanal">
            <input value={f.author} onChange={(e) => setF({ ...f, author: e.target.value })} />
          </Field>
          <Field label="Link">
            <input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
          </Field>
        </div>
        <Field label="Not">
          <textarea value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        </Field>
        <div className="actions">
          <button className="btn pri">Kaydet</button>
          <button type="button" className="btn ghost" onClick={onClose}>Vazgeç</button>
          <span className="grow" />
          <button type="button" className="btn ghost" onClick={() => { remove.mutate(resource.id); onClose(); }}>Sil</button>
        </div>
      </form>
    </Modal>
  );
}
