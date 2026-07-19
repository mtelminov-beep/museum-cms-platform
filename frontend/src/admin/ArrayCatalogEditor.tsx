import { useEffect, useState } from "react";
import type { CmsMaterial, CmsPage, CmsSection, ContentBlock, ContentStatus } from "../types";
import { BlocksEditor } from "./BlocksEditor";
import { MediaUploadField } from "./MediaUploadField";

type FieldKind = "text" | "textarea" | "status" | "tags" | "media" | "blocks";

export interface ArrayFieldSpec {
  key: string;
  label: string;
  kind?: FieldKind;
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function ArrayCatalogEditor<T extends { id: string; title?: string }>({
  items,
  onChange,
  fields,
  createItem,
  titleKey = "title"
}: {
  items: T[];
  onChange: (next: T[]) => void;
  fields: ArrayFieldSpec[];
  createItem: () => T;
  titleKey?: "id" | "title";
}) {
  const list = Array.isArray(items) ? items : [];
  const [selectedId, setSelectedId] = useState<string | undefined>(list[0]?.id);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!list.some((item) => item.id === selectedId)) {
      setSelectedId(list[0]?.id);
    }
  }, [list, selectedId]);

  const filtered = list.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [item.id, item.title, JSON.stringify(item)].join(" ").toLowerCase().includes(q);
  });

  const selectedIndex = list.findIndex((item) => item.id === selectedId);
  const selected = selectedIndex >= 0 ? list[selectedIndex] : null;

  const updateSelected = (patch: Partial<T>) => {
    if (selectedIndex < 0) return;
    onChange(list.map((item, i) => (i === selectedIndex ? { ...item, ...patch } : item)));
  };

  return (
    <div className="array-editor">
      <aside className="array-editor__list">
        <div className="admin-section-head">
          <strong>Список</strong>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              const item = createItem();
              onChange([...list, item]);
              setSelectedId(item.id);
            }}
          >
            + Добавить
          </button>
        </div>
        <label className="admin-field">
          <span>Поиск</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="фильтр…" />
        </label>
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === selectedId ? "array-editor__item active" : "array-editor__item"}
            onClick={() => setSelectedId(item.id)}
          >
            <strong>{String(item[titleKey] || item.id)}</strong>
            <small>{item.id}</small>
          </button>
        ))}
      </aside>

      <div className="array-editor__detail">
        {!selected ? (
          <p className="hint">Выберите элемент или создайте новый.</p>
        ) : (
          <>
            <div className="admin-section-head">
              <strong>Редактирование</strong>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  if (!window.confirm("Удалить элемент?")) return;
                  const next = list.filter((item) => item.id !== selected.id);
                  onChange(next);
                  setSelectedId(next[0]?.id);
                }}
              >
                Удалить
              </button>
            </div>
            <div className="admin-form-grid">
              {fields.map((field) => {
                const kind = field.kind || "text";
                const raw = (selected as Record<string, unknown>)[field.key];

                if (kind === "blocks") return null;

                if (kind === "textarea") {
                  return (
                    <label key={field.key} className="admin-field admin-field-wide">
                      <span>{field.label}</span>
                      <textarea
                        rows={4}
                        value={String(raw ?? "")}
                        onChange={(e) => updateSelected({ [field.key]: e.target.value } as Partial<T>)}
                      />
                    </label>
                  );
                }

                if (kind === "status") {
                  return (
                    <label key={field.key} className="admin-field">
                      <span>{field.label}</span>
                      <select
                        value={String(raw ?? "draft")}
                        onChange={(e) =>
                          updateSelected({ [field.key]: e.target.value as ContentStatus } as Partial<T>)
                        }
                      >
                        <option value="draft">draft</option>
                        <option value="published">published</option>
                        <option value="archived">archived</option>
                      </select>
                    </label>
                  );
                }

                if (kind === "tags") {
                  const tags = Array.isArray(raw) ? (raw as string[]) : [];
                  return (
                    <label key={field.key} className="admin-field admin-field-wide">
                      <span>{field.label} (через запятую)</span>
                      <input
                        value={tags.join(", ")}
                        onChange={(e) =>
                          updateSelected({
                            [field.key]: e.target.value
                              .split(",")
                              .map((x) => x.trim())
                              .filter(Boolean)
                          } as Partial<T>)
                        }
                      />
                    </label>
                  );
                }

                if (kind === "media") {
                  return (
                    <div key={field.key} className="admin-field-wide">
                      <MediaUploadField
                        label={field.label}
                        value={String(raw ?? "")}
                        onChange={(url) => updateSelected({ [field.key]: url } as Partial<T>)}
                        folder="uploads"
                      />
                    </div>
                  );
                }

                return (
                  <label key={field.key} className="admin-field">
                    <span>{field.label}</span>
                    <input
                      value={String(raw ?? "")}
                      onChange={(e) => updateSelected({ [field.key]: e.target.value } as Partial<T>)}
                    />
                  </label>
                );
              })}
            </div>

            {fields.some((f) => f.kind === "blocks") ? (
              <BlocksEditor
                value={Array.isArray((selected as unknown as { blocks?: ContentBlock[] }).blocks)
                  ? (selected as unknown as { blocks: ContentBlock[] }).blocks
                  : []}
                onChange={(blocks) => updateSelected({ blocks } as unknown as Partial<T>)}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export function createSectionItem(): CmsSection {
  return {
    id: newId("section"),
    title: "Новый раздел",
    summary: "",
    image: "",
    status: "draft",
    pageIds: []
  };
}

export function createPageItem(): CmsPage {
  return {
    id: newId("page"),
    slug: `page-${Date.now().toString(36)}`,
    title: "Новая страница",
    summary: "",
    status: "draft",
    blocks: [],
    subsections: []
  };
}

export function createMaterialItem(): CmsMaterial {
  return {
    id: newId("material"),
    title: "Новый материал",
    annotation: "",
    status: "draft",
    category: "",
    fileUrl: "",
    coverImage: ""
  };
}
