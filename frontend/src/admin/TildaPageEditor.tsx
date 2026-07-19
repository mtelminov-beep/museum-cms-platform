import { useEffect, useMemo, useState } from "react";
import type { CmsPage, ContentBlock, ContentBlockType, PageMaterial } from "../types";
import { BlockView } from "../components/ContentBlocks";
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

function blockLabel(type: ContentBlockType) {
  return BLOCK_LIBRARY.find((b) => b.value === type)?.label || type;
}

export function TildaPageEditor({
  page,
  onChange,
  onOpenPages
}: {
  page: CmsPage;
  onChange: (next: CmsPage) => void;
  onOpenPages?: () => void;
}) {
  const folder = page.sectionFolder || "uploads";
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [selectedId, setSelectedId] = useState<string | undefined>(page.blocks?.[0]?.id);
  const [leftTab, setLeftTab] = useState<"blocks" | "media" | "materials">("blocks");
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [propsOpen, setPropsOpen] = useState(true);
  const [insertAt, setInsertAt] = useState<number | null>(null);
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

  useEffect(() => {
    if (selected) setPropsOpen(true);
  }, [selectedId]);

  const commit = (next: CmsPage) => {
    setUndo((stack) => [page, ...stack].slice(0, 20));
    onChange(next);
  };

  const setBlocks = (nextBlocks: ContentBlock[]) => commit({ ...page, blocks: nextBlocks });

  const updateSelected = (patch: Partial<ContentBlock>) => {
    if (!selected) return;
    setBlocks(blocks.map((b) => (b.id === selected.id ? { ...b, ...patch } : b)));
  };

  const addBlock = (type: ContentBlockType, at?: number | null) => {
    const block = emptyBlock(type);
    const index = typeof at === "number" ? at : blocks.length;
    const next = [...blocks];
    next.splice(index, 0, block);
    setBlocks(next);
    setSelectedId(block.id);
    setInsertAt(null);
    setPropsOpen(true);
    setLibraryOpen(false);
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

  const openLibrary = (tab: "blocks" | "media" | "materials" = "blocks") => {
    setLeftTab(tab);
    setLibraryOpen(true);
    if (tab === "media") void loadLibrary();
  };

  return (
    <div className={`tilda-editor${libraryOpen ? " tilda-editor--lib" : ""}${propsOpen && selected ? " tilda-editor--props" : ""}`}>
      <header className="tilda-topbar">
        <div className="tilda-topbar__left">
          {onOpenPages ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onOpenPages}>
              ← Страницы
            </button>
          ) : null}
          <button
            type="button"
            className={`btn btn-sm${libraryOpen ? "" : " btn-ghost"}`}
            onClick={() => (libraryOpen ? setLibraryOpen(false) : openLibrary("blocks"))}
          >
            {libraryOpen ? "Скрыть блоки" : "+ Блоки"}
          </button>
          <div>
            <strong>{page.title}</strong>
            <span className="hint"> / {page.slug}</span>
          </div>
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
          <button
            type="button"
            className={`btn btn-sm${propsOpen && selected ? "" : " btn-ghost"}`}
            disabled={!selected}
            onClick={() => setPropsOpen((v) => !v)}
          >
            Свойства
          </button>
        </div>
      </header>

      <div className="tilda-stage">
        {(libraryOpen || insertAt !== null) && (
          <>
            <button type="button" className="tilda-backdrop" aria-label="Закрыть библиотеку" onClick={() => {
              setLibraryOpen(false);
              setInsertAt(null);
            }} />
            <aside className="tilda-drawer tilda-drawer--left">
              <div className="admin-section-head">
                <strong>{insertAt !== null ? "Вставить блок" : "Библиотека"}</strong>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setLibraryOpen(false);
                    setInsertAt(null);
                  }}
                >
                  Закрыть
                </button>
              </div>
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
                          <button key={item.value} type="button" onClick={() => addBlock(item.value, insertAt)}>
                            + {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                : null}

              {leftTab === "media" ? (
                <div className="tilda-media-lib">
                  <p className="hint">Папка раздела: {folder}. Клик по файлу подставит его в выбранный блок.</p>
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
                  <p className="hint">Материалы раздела — файлы для страницы (фото, видео, PDF).</p>
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
          </>
        )}

        <main
          className={`tilda-canvas tilda-canvas--${breakpoint}`}
          onClick={() => {
            setSelectedId(undefined);
            setPropsOpen(false);
          }}
        >
          <div className="tilda-page" onClick={(e) => e.stopPropagation()}>
            <header className="tilda-page__head">
              <h1>{page.title || "Страница"}</h1>
              {page.summary ? <p>{page.summary}</p> : null}
            </header>

            {!blocks.length ? (
              <div className="tilda-empty">
                <p>Страница пустая — соберите её блоками, как на сайте.</p>
                <button type="button" className="btn" onClick={() => openLibrary("blocks")}>
                  Добавить первый блок
                </button>
              </div>
            ) : null}

            <div className="tilda-page__blocks">
              <div className="tilda-insert">
                <button type="button" onClick={() => { setInsertAt(0); setLibraryOpen(true); setLeftTab("blocks"); }}>
                  + блок
                </button>
              </div>

              {blocks.map((block, index) => (
                <div key={block.id}>
                  <div
                    className={`tilda-block-wrap${selectedId === block.id ? " selected" : ""}`}
                    onClick={() => {
                      setSelectedId(block.id);
                      setPropsOpen(true);
                    }}
                  >
                    <div className="tilda-block-chrome">
                      <span className="tilda-block-chrome__type">{blockLabel(block.type)}</span>
                      <div className="tilda-block-chrome__tools">
                        <button type="button" disabled={index === 0} onClick={(e) => { e.stopPropagation(); move(index, -1); }} title="Выше">
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === blocks.length - 1}
                          onClick={(e) => { e.stopPropagation(); move(index, 1); }}
                          title="Ниже"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const copy = { ...block, id: makeId("block") };
                            const next = [...blocks];
                            next.splice(index + 1, 0, copy);
                            setBlocks(next);
                            setSelectedId(copy.id);
                          }}
                          title="Дублировать"
                        >
                          ⧉
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBlocks(blocks.filter((b) => b.id !== block.id));
                            if (selectedId === block.id) {
                              setSelectedId(undefined);
                              setPropsOpen(false);
                            }
                          }}
                          title="Удалить"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="tilda-block-preview">
                      <BlockView block={block} showEmpty />
                    </div>
                  </div>

                  <div className="tilda-insert">
                    <button
                      type="button"
                      onClick={() => {
                        setInsertAt(index + 1);
                        setLibraryOpen(true);
                        setLeftTab("blocks");
                      }}
                    >
                      + блок
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {propsOpen && selected ? (
          <>
            <button type="button" className="tilda-backdrop tilda-backdrop--props" aria-label="Закрыть свойства" onClick={() => setPropsOpen(false)} />
            <aside className="tilda-drawer tilda-drawer--right" onClick={(e) => e.stopPropagation()}>
              <div className="admin-section-head">
                <strong>Свойства · {blockLabel(selected.type)}</strong>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPropsOpen(false)}>
                  Закрыть
                </button>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setBlocks(blocks.filter((b) => b.id !== selected.id));
                  setSelectedId(undefined);
                  setPropsOpen(false);
                }}
              >
                Удалить блок
              </button>
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
              <p className="hint">Изменения сразу видны на холсте — так же, как на публичной странице.</p>
            </aside>
          </>
        ) : null}
      </div>
    </div>
  );
}
