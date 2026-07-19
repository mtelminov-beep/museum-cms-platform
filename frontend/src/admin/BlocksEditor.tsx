import type { ContentBlock, ContentBlockType } from "../types";
import { MediaUploadField } from "./MediaUploadField";
import { RichTextEditor } from "./RichTextEditor";

const BLOCK_TYPES: Array<{ value: ContentBlockType; label: string }> = [
  { value: "text", label: "Текст" },
  { value: "image", label: "Изображение" },
  { value: "video", label: "Видео" },
  { value: "audio", label: "Аудио" }
];

function newId() {
  return `block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function BlocksEditor({
  value,
  onChange
}: {
  value: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];

  const update = (index: number, patch: Partial<ContentBlock>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  };

  const addBlock = (type: ContentBlockType) =>
    onChange([...items, { id: newId(), type, title: "", text: "", src: "", caption: "" }]);

  return (
    <div className="blocks-editor">
      <div className="blocks-editor__head">
        <div>
          <strong>Конструктор блоков</strong>
          <p className="hint">Текст с форматированием, медиа с drag-and-drop, порядок ↑↓.</p>
        </div>
        <div className="blocks-editor__add">
          {BLOCK_TYPES.map((opt) => (
            <button key={opt.value} type="button" className="btn btn-ghost btn-sm" onClick={() => addBlock(opt.value)}>
              + {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!items.length ? <p className="hint">Пока нет блоков.</p> : null}

      <div className="blocks-editor__list">
        {items.map((item, index) => (
          <article key={item.id || index} className="blocks-card">
            <div className="blocks-card__head">
              <strong>
                {BLOCK_TYPES.find((o) => o.value === item.type)?.label ?? "Блок"} {index + 1}
              </strong>
              <div className="blocks-card__tools">
                <button type="button" className="btn btn-ghost btn-sm" disabled={index === 0} onClick={() => move(index, -1)}>
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  Удалить
                </button>
              </div>
            </div>

            <label className="admin-field">
              <span>Заголовок</span>
              <input value={item.title ?? ""} onChange={(e) => update(index, { title: e.target.value })} />
            </label>

            {item.type === "text" ? (
              <RichTextEditor value={item.text ?? ""} onChange={(text) => update(index, { text })} />
            ) : (
              <>
                <MediaUploadField
                  label={item.type === "image" ? "Изображение" : item.type === "video" ? "Видео" : "Аудио"}
                  value={item.src ?? ""}
                  onChange={(src) => update(index, { src })}
                />
                <label className="admin-field">
                  <span>Подпись</span>
                  <input value={item.caption ?? ""} onChange={(e) => update(index, { caption: e.target.value })} />
                </label>
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
