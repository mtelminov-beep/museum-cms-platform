import { useMemo, useState } from "react";
import type { CmsPage, ContentBlock, ContentBlockType, PageMaterial } from "../types";
import { listMediaFolder, uploadMedia } from "../api";
import { MediaUploadField } from "./MediaUploadField";
import { RichTextEditor } from "./RichTextEditor";

const BLOCK_LIBRARY: Array<{ value: ContentBlockType; label: string; group: string }> = [
  { value: "hero", label: "Hero", group: "Основные" },
  { value: "heading", label: "Заголовок", group: "Основные" },
  { value: "text", label: "Текст", group: "Основные" },
  { value: "quote", label: "Цитата", group: "Основные" },
  { value: "divider", label: "Разделитель", group: "Основные" },
  { value: "image", label: "Изображение", group: "Медиа" },
  { value: "gallery", label: "Галерея", group: "Медиа" },
  { value: "video", label: "Видео", group: "Медиа" },
  { value: "audio", label: "Аудио", group: "Медиа" },
  { value: "columns", label: "Колонки", group: "Макет" },
  { value: "cta", label: "CTA-кнопка", group: "Действия" },
  { value: "exhibit-cards", label: "Карточки экспонатов", group: "Данные" },
  { value: "event-cards", label: "Карточки событий", group: "Данные" },
  { value: "map", label: "Карта", group: "Данные" },
  { value: "ticket", label: "Билеты / Пушкинская карта", group: "Действия" },
  { value: "qr", label: "QR-блок", group: "Действия" }
];

type Breakpoint = "desktop" | "tablet" | "mobile";

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function emptyBlock(type: ContentBlockType): ContentBlock {
  const base: ContentBlock = {
    id: makeId("block"),
    type,
    title: "",
    text: "",
    src: "",
    caption: "",
    items: [],
    align: "left",
    paddingY: 24
  };
  if (type === "hero") {
    base.title = "Заголовок секции";
    base.text = "<p>Короткое описание для посетителя</p>";
    base.buttonLabel = "Подробнее";
    base.href = "/museum";
  }
  if (type === "cta" || type === "ticket") {
    base.buttonLabel = type === "ticket" ? "Купить билет" : "Перейти";
    base.href = type === "ticket" ? "/page/tickets" : "/museum";
    base.text = type === "ticket" ? "<p>Онлайн-билет и Пушкинская карта</p>" : "";
  }
  if (type === "qr") {
    base.title = "Отсканируйте QR";
    base.href = "/qr";
    base.buttonLabel = "Открыть сканер";
  }
  if (type === "map") {
    base.title = "Карта";
    base.text = "<p>Добавьте схему или ссылку на карту</p>";
  }
  return base;
}

function CanvasBlock({
  block,
  selected,
  onSelect
}: {
  block: ContentBlock;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" className={`tilda-block${selected ? " selected" : ""}`} onClick={onSelect}>
      <span className="tilda-block__type">{BLOCK_LIBRARY.find((b) => b.value === block.type)?.label}</span>
      {block.type === "hero" ? (
        <div className="tilda-hero" style={block.src ? { backgroundImage: `url(${block.src})` } : undefined}>
          <h2>{block.title || "Hero"}</h2>
          <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text || "" }} />
          {block.buttonLabel ? <span className="btn">{block.buttonLabel}</span> : null}
        </div>
      ) : null}
      {block.type === "heading" ? <h2>{block.title || "Заголовок"}</h2> : null}
      {block.type === "text" || block.type === "quote" ? (
        <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text || "<p>Текст</p>" }} />
      ) : null}
      {block.type === "divider" ? <hr /> : null}
      {block.type === "image" && block.src ? <img src={block.src} alt={block.caption || ""} /> : null}
      {block.type === "gallery" ? (
        <div className="tilda-gallery">
          {(block.items || []).map((src) => (
            <img key={src} src={src} alt="" />
          ))}
          {!block.items?.length ? <span className="hint">Галерея пуста</span> : null}
        </div>
      ) : null}
      {block.type === "video" && block.src ? <video src={block.src} controls /> : null}
      {block.type === "audio" && block.src ? <audio src={block.src} controls /> : null}
      {block.type === "cta" || block.type === "ticket" || block.type === "qr" ? (
        <div className="tilda-cta">
          <strong>{block.title}</strong>
          <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text || "" }} />
          <span className="btn">{block.buttonLabel || "Кнопка"}</span>
        </div>
      ) : null}
      {block.type === "exhibit-cards" || block.type === "event-cards" ? (
        <div className="tilda-cards-placeholder">{block.title || "Карточки из данных CMS"}</div>
      ) : null}
      {block.type === "map" || block.type === "columns" ? (
        <div className="tilda-map-placeholder">
          <strong>{block.title || block.type}</strong>
          <div className="rich-html" dangerouslySetInnerHTML={{ __html: block.text || "" }} />
        </div>
      ) : null}
    </button>
  );
}

export function TildaPageEditor({
  page,
  onChange
}: {
  page: CmsPage;
  onChange: (next: CmsPage) => void;
}) {
  const folder = page.sectionFolder || "uploads";
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [selectedId, setSelectedId] = useState<string | undefined>(page.blocks?.[0]?.id);
  const [leftTab, setLeftTab] = useState<"blocks" | "media" | "materials">("blocks");
  const [library, setLibrary] = useState<Array<{ url: string; fileName: string }>>([]);
  const [undo, setUndo] = useState<CmsPage[]>([]);

  const blocks = page.blocks || [];
  const selected = blocks.find((b) => b.id === selectedId);
  const groups = useMemo(() => {
    const map = new Map<string, typeof BLOCK_LIBRARY>();
    for (const item of BLOCK_LIBRARY) {
      const list = map.get(item.group) || [];
      list.push(item);
      map.set(item.group, list);
    }
    return [...map.entries()];
  }, []);

  const commit = (next: CmsPage) => {
    setUndo((stack) => [page, ...stack].slice(0, 20));
    onChange(next);
  };

  const setBlocks = (nextBlocks: ContentBlock[]) => commit({ ...page, blocks: nextBlocks });

  const updateSelected = (patch: Partial<ContentBlock>) => {
    if (!selected) return;
    setBlocks(blocks.map((b) => (b.id === selected.id ? { ...b, ...patch } : b)));
  };

  const addBlock = (type: ContentBlockType) => {
    const block = emptyBlock(type);
    setBlocks([...blocks, block]);
    setSelectedId(block.id);
  };

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[j]] = [next[j], next[index]];
    setBlocks(next);
  };

  const loadLibrary = async () => {
    const data = await listMediaFolder(folder);
    setLibrary(data.items || []);
  };

  const addMaterial = async (file: File) => {
    const uploaded = await uploadMedia(file, folder);
    const kind: PageMaterial["kind"] = /\.pdf$/i.test(file.name)
      ? "pdf"
      : /^image\//.test(file.type)
        ? "image"
        : /^video\//.test(file.type)
          ? "video"
          : /^audio\//.test(file.type)
            ? "audio"
            : "other";
    const material: PageMaterial = {
      id: makeId("mat"),
      title: file.name,
      url: uploaded.url,
      kind
    };
    commit({ ...page, materials: [...(page.materials || []), material] });
    await loadLibrary();
  };

  return (
    <div className="tilda-editor">
      <header className="tilda-topbar">
        <div>
          <strong>{page.title}</strong>
          <span className="hint"> / {page.slug}</span>
        </div>
        <div className="tilda-breakpoints">
          {(["desktop", "tablet", "mobile"] as Breakpoint[]).map((bp) => (
            <button key={bp} type="button" className={breakpoint === bp ? "active" : ""} onClick={() => setBreakpoint(bp)}>
              {bp === "desktop" ? "Desktop" : bp === "tablet" ? "Tablet" : "Mobile"}
            </button>
          ))}
        </div>
        <div className="admin-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={!undo.length}
            onClick={() => {
              const [prev, ...rest] = undo;
              if (!prev) return;
              setUndo(rest);
              onChange(prev);
            }}
          >
            Отменить
          </button>
        </div>
      </header>

      <div className="tilda-layout">
        <aside className="tilda-left">
          <div className="vpe-modes">
            <button type="button" className={leftTab === "blocks" ? "active" : ""} onClick={() => setLeftTab("blocks")}>
              Блоки
            </button>
            <button
              type="button"
              className={leftTab === "media" ? "active" : ""}
              onClick={() => {
                setLeftTab("media");
                void loadLibrary();
              }}
            >
              Медиа
            </button>
            <button type="button" className={leftTab === "materials" ? "active" : ""} onClick={() => setLeftTab("materials")}>
              Материалы
            </button>
          </div>

          {leftTab === "blocks"
            ? groups.map(([group, items]) => (
                <div key={group} className="tilda-lib-group">
                  <strong>{group}</strong>
                  <div className="tilda-lib-grid">
                    {items.map((item) => (
                      <button key={item.value} type="button" onClick={() => addBlock(item.value)}>
                        + {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            : null}

          {leftTab === "media" ? (
            <div className="tilda-media-lib">
              <p className="hint">Папка раздела: {folder}</p>
              <label className="btn btn-ghost btn-sm">
                Загрузить в раздел
                <input
                  type="file"
                  hidden
                  accept="image/*,video/*,audio/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void addMaterial(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <div className="tilda-media-grid">
                {library.map((item) => (
                  <button
                    key={item.url}
                    type="button"
                    title={item.fileName}
                    onClick={() => {
                      if (!selected) return;
                      if (selected.type === "gallery") {
                        updateSelected({ items: [...(selected.items || []), item.url] });
                      } else {
                        updateSelected({ src: item.url });
                      }
                    }}
                  >
                    {/\.(png|jpe?g|gif|webp|svg)$/i.test(item.url) ? (
                      <img src={item.url} alt="" />
                    ) : (
                      <span>{item.fileName}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {leftTab === "materials" ? (
            <div className="tilda-materials">
              <p className="hint">Материалы раздела — файлы для страницы (как в SHIHM: фото, видео, PDF).</p>
              <label className="btn btn-sm">
                + Материал
                <input
                  type="file"
                  hidden
                  accept="image/*,video/*,audio/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void addMaterial(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <ul>
                {(page.materials || []).map((mat) => (
                  <li key={mat.id}>
                    <strong>{mat.title}</strong>
                    <small>
                      {mat.kind} · {mat.url}
                    </small>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        commit({
                          ...page,
                          materials: (page.materials || []).filter((m) => m.id !== mat.id)
                        })
                      }
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>

        <main className={`tilda-canvas tilda-canvas--${breakpoint}`}>
          {!blocks.length ? <p className="hint">Добавьте блоки слева — холст как у посетителя.</p> : null}
          {blocks.map((block, index) => (
            <div key={block.id} className="tilda-canvas__row">
              <div className="vpe-canvas__tools">
                <button type="button" className="btn btn-ghost btn-sm" disabled={index === 0} onClick={() => move(index, -1)}>
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={index === blocks.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    const copy = { ...block, id: makeId("block") };
                    const next = [...blocks];
                    next.splice(index + 1, 0, copy);
                    setBlocks(next);
                    setSelectedId(copy.id);
                  }}
                >
                  Дублировать
                </button>
              </div>
              <CanvasBlock block={block} selected={selectedId === block.id} onSelect={() => setSelectedId(block.id)} />
            </div>
          ))}
        </main>

        <aside className="tilda-right">
          {!selected ? (
            <p className="hint">Выберите блок на холсте</p>
          ) : (
            <>
              <div className="admin-section-head">
                <strong>Свойства</strong>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setBlocks(blocks.filter((b) => b.id !== selected.id));
                    setSelectedId(undefined);
                  }}
                >
                  Удалить блок
                </button>
              </div>
              <label className="admin-field">
                <span>Заголовок</span>
                <input value={selected.title || ""} onChange={(e) => updateSelected({ title: e.target.value })} />
              </label>
              {["text", "hero", "quote", "cta", "ticket", "map", "columns"].includes(selected.type) ? (
                <RichTextEditor value={selected.text || ""} onChange={(text) => updateSelected({ text })} />
              ) : null}
              {["image", "video", "audio", "hero"].includes(selected.type) ? (
                <MediaUploadField
                  label="Медиа"
                  folder={folder}
                  value={selected.src || ""}
                  onChange={(src) => updateSelected({ src: String(src) })}
                />
              ) : null}
              {selected.type === "gallery" ? (
                <MediaUploadField
                  label="Галерея"
                  folder={folder}
                  multiple
                  value={selected.items || []}
                  onChangeMultiple={(items) => updateSelected({ items })}
                />
              ) : null}
              {["cta", "ticket", "qr", "hero"].includes(selected.type) ? (
                <>
                  <label className="admin-field">
                    <span>Текст кнопки</span>
                    <input
                      value={selected.buttonLabel || ""}
                      onChange={(e) => updateSelected({ buttonLabel: e.target.value })}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Ссылка</span>
                    <input value={selected.href || ""} onChange={(e) => updateSelected({ href: e.target.value })} />
                  </label>
                </>
              ) : null}
              <label className="admin-field">
                <span>Выравнивание</span>
                <select
                  value={selected.align || "left"}
                  onChange={(e) => updateSelected({ align: e.target.value as ContentBlock["align"] })}
                >
                  <option value="left">Слева</option>
                  <option value="center">По центру</option>
                  <option value="right">Справа</option>
                </select>
              </label>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
