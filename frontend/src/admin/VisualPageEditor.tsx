import { useMemo, useState } from "react";
import { pagesFromSiteStructure } from "../site/structure";
import type { CmsPage, ContentBlock, ContentBlockType, PageSubsection } from "../types";
import { MediaUploadField } from "./MediaUploadField";
import { PublishToggle } from "./PublishToggle";
import { RichTextEditor } from "./RichTextEditor";
import { TildaPageEditor } from "./TildaPageEditor";

const BLOCK_TYPES: Array<{ value: ContentBlockType; label: string }> = [
  { value: "text", label: "Текст" },
  { value: "image", label: "Изображение" },
  { value: "video", label: "Видео" },
  { value: "audio", label: "Аудио" }
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function emptyBlock(type: ContentBlockType): ContentBlock {
  return { id: makeId("block"), type, title: "", text: "", src: "", caption: "" };
}

function BlockCanvasItem({
  block,
  selected,
  onSelect
}: {
  block: ContentBlock;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" className={`vpe-block${selected ? " selected" : ""}`} onClick={onSelect}>
      <span className="vpe-block__type">{BLOCK_TYPES.find((t) => t.value === block.type)?.label}</span>
      {block.title ? <strong>{block.title}</strong> : null}
      {block.type === "text" ? (
        <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text || "<p>Пустой текст</p>" }} />
      ) : null}
      {block.type === "image" && block.src ? <img src={block.src} alt={block.caption || ""} /> : null}
      {block.type === "video" && block.src ? <video src={block.src} controls preload="metadata" /> : null}
      {block.type === "audio" && block.src ? <audio src={block.src} controls preload="none" /> : null}
      {block.type !== "text" && !block.src ? <span className="hint">Нет медиа — выберите блок справа</span> : null}
      {block.caption ? <small>{block.caption}</small> : null}
    </button>
  );
}

function BlocksCanvas({
  blocks,
  selectedId,
  onSelect,
  onChange
}: {
  blocks: ContentBlock[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length || from === to) return;
    const next = [...blocks];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="vpe-canvas">
      {!blocks.length ? <p className="hint">Добавьте блок кнопками выше — страница собирается как у посетителя.</p> : null}
      {blocks.map((block, index) => (
        <div
          key={block.id}
          className="vpe-canvas__row"
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIndex == null) return;
            move(dragIndex, index);
            setDragIndex(null);
          }}
        >
          <div className="vpe-canvas__tools">
            <button type="button" className="btn btn-ghost btn-sm" disabled={index === 0} onClick={() => move(index, index - 1)}>
              ↑
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={index === blocks.length - 1}
              onClick={() => move(index, index + 1)}
            >
              ↓
            </button>
            <span className="hint">⋮⋮ перетащить</span>
          </div>
          <BlockCanvasItem block={block} selected={selectedId === block.id} onSelect={() => onSelect(block.id)} />
        </div>
      ))}
    </div>
  );
}

function BlockInspector({
  block,
  onChange,
  onDelete
}: {
  block: ContentBlock;
  onChange: (patch: Partial<ContentBlock>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="vpe-inspector">
      <div className="admin-section-head">
        <strong>Свойства блока</strong>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDelete}>
          Удалить
        </button>
      </div>
      <label className="admin-field">
        <span>Заголовок</span>
        <input value={block.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
      </label>
      {block.type === "text" ? (
        <RichTextEditor value={block.text ?? ""} onChange={(text) => onChange({ text })} />
      ) : (
        <>
          <MediaUploadField
            label={block.type === "image" ? "Изображение" : block.type === "video" ? "Видео" : "Аудио"}
            value={block.src ?? ""}
            onChange={(src) => onChange({ src })}
          />
          <label className="admin-field">
            <span>Подпись</span>
            <input value={block.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value })} />
          </label>
        </>
      )}
    </div>
  );
}

function SubsectionsEditor({
  value,
  onChange
}: {
  value: PageSubsection[];
  onChange: (next: PageSubsection[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const selected = items.find((item) => item.id === selectedId) ?? null;

  const update = (id: string, patch: Partial<PageSubsection>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <div className="vpe-subsections">
      <div className="admin-section-head">
        <strong>Подразделы страницы</strong>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            const item: PageSubsection = {
              id: makeId("sub"),
              title: "Новый подраздел",
              summary: "",
              image: "",
              enabled: true,
              blocks: []
            };
            onChange([...items, item]);
            setSelectedId(item.id);
          }}
        >
          + Подраздел
        </button>
      </div>
      <div className="array-editor">
        <aside className="array-editor__list">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === selectedId ? "array-editor__item active" : "array-editor__item"}
              onClick={() => setSelectedId(item.id)}
            >
              <strong>{item.title}</strong>
              <small>{item.enabled ? "включён" : "выключен"}</small>
            </button>
          ))}
        </aside>
        <div className="array-editor__detail">
          {!selected ? (
            <p className="hint">Нет подразделов</p>
          ) : (
            <>
              <label className="admin-field">
                <span>Название</span>
                <input value={selected.title} onChange={(e) => update(selected.id, { title: e.target.value })} />
              </label>
              <label className="admin-field">
                <span>Описание</span>
                <textarea
                  rows={3}
                  value={selected.summary ?? ""}
                  onChange={(e) => update(selected.id, { summary: e.target.value })}
                />
              </label>
              <PublishToggle
                published={selected.enabled}
                onChange={(enabled) => update(selected.id, { enabled })}
                label="Показывать подраздел посетителям"
                onLabel="Включён"
                offLabel="Выключен"
              />
              <MediaUploadField
                label="Плитка / обложка"
                value={selected.image ?? ""}
                onChange={(image) => update(selected.id, { image })}
              />
              <VisualBlocksWorkspace
                blocks={selected.blocks}
                onChange={(blocks) => update(selected.id, { blocks })}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  const next = items.filter((item) => item.id !== selected.id);
                  onChange(next);
                  setSelectedId(next[0]?.id);
                }}
              >
                Удалить подраздел
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function VisualBlocksWorkspace({
  blocks,
  onChange
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const list = Array.isArray(blocks) ? blocks : [];
  const [selectedId, setSelectedId] = useState<string | undefined>(list[0]?.id);
  const selected = list.find((block) => block.id === selectedId);

  return (
    <div className="vpe-workspace">
      <div className="blocks-editor__add">
        {BLOCK_TYPES.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              const block = emptyBlock(opt.value);
              onChange([...list, block]);
              setSelectedId(block.id);
            }}
          >
            + {opt.label}
          </button>
        ))}
      </div>
      <div className="vpe-split">
        <BlocksCanvas
          blocks={list}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChange={(next) => {
            onChange(next);
            if (!next.some((b) => b.id === selectedId)) setSelectedId(next[0]?.id);
          }}
        />
        {selected ? (
          <BlockInspector
            block={selected}
            onChange={(patch) =>
              onChange(list.map((block) => (block.id === selected.id ? { ...block, ...patch } : block)))
            }
            onDelete={() => {
              const next = list.filter((block) => block.id !== selected.id);
              onChange(next);
              setSelectedId(next[0]?.id);
            }}
          />
        ) : (
          <div className="vpe-inspector">
            <p className="hint">Выберите блок на холсте</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function VisualPageEditor({
  page,
  onChange,
  onOpenPages
}: {
  page: CmsPage;
  onChange: (next: CmsPage) => void;
  onOpenPages?: () => void;
}) {
  const [mode, setMode] = useState<"visual" | "subsections" | "meta">("visual");
  const subsections = useMemo(() => page.subsections ?? [], [page.subsections]);

  return (
    <div className={`visual-page-editor${mode === "visual" ? " visual-page-editor--focus" : ""}`}>
      <div className="vpe-modes">
        <button type="button" className={mode === "visual" ? "active" : ""} onClick={() => setMode("visual")}>
          Визуальный конструктор
        </button>
        <button
          type="button"
          className={mode === "subsections" ? "active" : ""}
          onClick={() => setMode("subsections")}
        >
          Подразделы
        </button>
        <button type="button" className={mode === "meta" ? "active" : ""} onClick={() => setMode("meta")}>
          Свойства страницы
        </button>
      </div>

      {mode === "meta" ? (
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>ID</span>
            <input value={page.id} onChange={(e) => onChange({ ...page, id: e.target.value })} />
          </label>
          <label className="admin-field">
            <span>Slug</span>
            <input value={page.slug} onChange={(e) => onChange({ ...page, slug: e.target.value })} />
          </label>
          <label className="admin-field">
            <span>Название</span>
            <input value={page.title} onChange={(e) => onChange({ ...page, title: e.target.value })} />
          </label>
          <label className="admin-field">
            <span>Статус</span>
            <select
              value={page.status}
              onChange={(e) => onChange({ ...page, status: e.target.value as CmsPage["status"] })}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </label>
          <label className="admin-field admin-field-wide">
            <span>Описание</span>
            <textarea
              rows={3}
              value={page.summary ?? ""}
              onChange={(e) => onChange({ ...page, summary: e.target.value })}
            />
          </label>
        </div>
      ) : null}

      {mode === "visual" ? <TildaPageEditor page={page} onChange={onChange} onOpenPages={onOpenPages} /> : null}

      {mode === "subsections" ? (
        <SubsectionsEditor
          value={subsections}
          onChange={(next) => onChange({ ...page, subsections: next })}
        />
      ) : null}
    </div>
  );
}

export function PagesCatalogEditor({
  items,
  onChange
}: {
  items: CmsPage[];
  onChange: (next: CmsPage[]) => void;
}) {
  const list = Array.isArray(items) ? items : [];
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(list[0]?.id);
  const [catalogOpen, setCatalogOpen] = useState(!list[0]?.id);
  const filtered = list.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [item.title, item.id, item.slug, item.summary].join(" ").toLowerCase().includes(q);
  });
  const selected = list.find((item) => item.id === selectedId) ?? null;
  const focusMode = Boolean(selected && !catalogOpen);

  return (
    <div className={`array-editor pages-catalog-editor${focusMode ? " pages-catalog-editor--focus" : ""}`}>
      {!focusMode ? (
        <aside className="array-editor__list">
          <div className="admin-section-head">
            <strong>Страницы</strong>
            <div className="admin-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  const seeded = pagesFromSiteStructure() as CmsPage[];
                  const byId = new Map(list.map((p) => [p.id, p]));
                  for (const page of seeded) {
                    if (!byId.has(page.id)) byId.set(page.id, page);
                  }
                  onChange([...byId.values()]);
                  setSelectedId(seeded[0]?.id || list[0]?.id);
                }}
              >
                Структура сайта
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  const page: CmsPage = {
                    id: makeId("page"),
                    slug: `page-${Date.now().toString(36)}`,
                    title: "Новая страница",
                    summary: "",
                    status: "draft",
                    sectionFolder: "uploads",
                    materials: [],
                    blocks: [],
                    subsections: []
                  };
                  onChange([...list, page]);
                  setSelectedId(page.id);
                  setCatalogOpen(false);
                }}
              >
                + Страница
              </button>
            </div>
          </div>
          <label className="admin-field">
            <span>Поиск</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="название, slug…" />
          </label>
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === selectedId ? "array-editor__item active" : "array-editor__item"}
              onClick={() => {
                setSelectedId(item.id);
                setCatalogOpen(false);
              }}
            >
              <strong>{item.title}</strong>
              <small>
                {item.status} · {item.blocks?.length || 0} блоков
              </small>
            </button>
          ))}
        </aside>
      ) : null}
      <div className="array-editor__detail">
        {!selected ? (
          <p className="hint">Выберите страницу слева или создайте новую — откроется визуальный конструктор.</p>
        ) : focusMode ? (
          <VisualPageEditor
            page={selected}
            onOpenPages={() => setCatalogOpen(true)}
            onChange={(page) => onChange(list.map((item) => (item.id === selected.id ? page : item)))}
          />
        ) : (
          <div className="pages-catalog-preview">
            <div className="admin-section-head">
              <strong>{selected.title}</strong>
              <div className="admin-actions">
                <button type="button" className="btn btn-sm" onClick={() => setCatalogOpen(false)}>
                  Открыть конструктор
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    if (!window.confirm(`Удалить страницу «${selected.title}»?`)) return;
                    const next = list.filter((item) => item.id !== selected.id);
                    onChange(next);
                    setSelectedId(next[0]?.id);
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
            <p className="hint">
              {selected.status} · {selected.blocks?.length || 0} блоков · /{selected.slug}
            </p>
            {selected.summary ? <p>{selected.summary}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}
