import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { LayoutBox, WelcomeImageElement, WelcomeScreenConfig } from "../types";
import { MediaUploadField } from "./MediaUploadField";

type ZoneId = keyof WelcomeScreenConfig["layout"];
const ZONES: ZoneId[] = ["header", "content", "button", "footer"];
const TEXT_FIELDS = [
  "institutionName",
  "location",
  "kicker",
  "title",
  "titleAccent",
  "lead",
  "buttonLabel",
  "buttonHint",
  "footerLeft",
  "footerRight"
] as const;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function boxStyle(box: LayoutBox, selected: boolean): CSSProperties {
  return {
    left: `${box.x}%`,
    top: `${box.y}%`,
    width: `${box.width}%`,
    transform: `translateY(-50%) scale(${box.scale})`,
    outline: selected ? "2px solid #d9b86f" : "1px dashed rgba(255,255,255,.35)"
  };
}

export function WelcomeEditor({
  value,
  onChange
}: {
  value: WelcomeScreenConfig;
  onChange: (next: WelcomeScreenConfig) => void;
}) {
  const screen = {
    ...value,
    layout: value.layout,
    images: value.images ?? []
  };
  const [selected, setSelected] = useState<string>("content");
  const [preview, setPreview] = useState(false);
  const [editingText, setEditingText] = useState<(typeof TEXT_FIELDS)[number] | null>(null);
  const [undoStack, setUndoStack] = useState<WelcomeScreenConfig[]>([]);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<string | null>(null);
  const resizingRef = useRef<{ id: string; startWidth: number; startScale: number } | null>(null);

  const commit = (next: WelcomeScreenConfig) => onChange(next);

  const pushUndo = () => setUndoStack((items) => [screen, ...items].slice(0, 8));

  const undo = () => {
    const [prev, ...rest] = undoStack;
    if (!prev) return;
    setUndoStack(rest);
    commit(prev);
  };

  const setField = <K extends keyof WelcomeScreenConfig>(key: K, v: WelcomeScreenConfig[K]) =>
    commit({ ...screen, [key]: v });

  const updateLayout = (id: ZoneId, patch: Partial<LayoutBox>) => {
    const current = screen.layout[id];
    commit({
      ...screen,
      layout: {
        ...screen.layout,
        [id]: {
          ...current,
          ...patch,
          x: clamp(patch.x ?? current.x, 0, 96),
          y: clamp(patch.y ?? current.y, 3, 97),
          width: clamp(patch.width ?? current.width, 12, 96),
          scale: clamp(patch.scale ?? current.scale, 0.55, 1.7)
        }
      }
    });
  };

  const updateImage = (id: string, patch: Partial<WelcomeImageElement>) => {
    commit({
      ...screen,
      images: screen.images.map((image) =>
        image.id === id
          ? {
              ...image,
              ...patch,
              x: clamp(patch.x ?? image.x, 0, 96),
              y: clamp(patch.y ?? image.y, 3, 97),
              width: clamp(patch.width ?? image.width, 4, 96),
              scale: clamp(patch.scale ?? image.scale, 0.1, 4)
            }
          : image
      )
    });
  };

  const updateBox = (id: string, patch: Partial<LayoutBox>) => {
    if (ZONES.includes(id as ZoneId)) updateLayout(id as ZoneId, patch);
    else updateImage(id, patch);
  };

  const pointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (draggingRef.current) {
      updateBox(draggingRef.current, {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100
      });
    }
    const resize = resizingRef.current;
    if (resize) {
      const current = ZONES.includes(resize.id as ZoneId)
        ? screen.layout[resize.id as ZoneId]
        : screen.images.find((image) => image.id === resize.id);
      if (!current) return;
      const leftPx = (current.x / 100) * rect.width;
      const nextWidth = clamp(((event.clientX - rect.left - leftPx) / rect.width) * 100, 4, 96);
      const ratio = resize.startWidth > 0 ? nextWidth / resize.startWidth : 1;
      updateBox(resize.id, { width: nextWidth, scale: resize.startScale * ratio });
    }
  };

  const selectedBox = ZONES.includes(selected as ZoneId)
    ? screen.layout[selected as ZoneId]
    : screen.images.find((image) => image.id === selected);

  const editable = (field: (typeof TEXT_FIELDS)[number], children: ReactNode, className?: string) => (
    <span
      className={className}
      contentEditable={!preview && editingText === field}
      suppressContentEditableWarning
      onDoubleClick={(event) => {
        if (preview) return;
        event.stopPropagation();
        setEditingText(field);
      }}
      onBlur={(event) => {
        setEditingText(null);
        setField(field, event.currentTarget.textContent ?? "");
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === "Escape") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    >
      {children}
    </span>
  );

  return (
    <div className="welcome-editor">
      <div className="welcome-toolbar">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreview((v) => !v)}>
          {preview ? "Редактор" : "Превью"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={!undoStack.length} onClick={undo}>
          Отменить
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = () => {
              const file = input.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                pushUndo();
                const id = makeId("welcome-image");
                commit({
                  ...screen,
                  images: [
                    ...screen.images,
                    { id, type: "image", src: String(reader.result ?? ""), x: 52, y: 48, width: 18, scale: 1 }
                  ]
                });
                setSelected(id);
              };
              reader.readAsDataURL(file);
            };
            input.click();
          }}
        >
          + Изображение на сцену
        </button>
        {!ZONES.includes(selected as ZoneId) ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              pushUndo();
              commit({ ...screen, images: screen.images.filter((image) => image.id !== selected) });
              setSelected("content");
            }}
          >
            Удалить изображение
          </button>
        ) : null}
      </div>

      <div
        ref={canvasRef}
        className={`welcome-stage welcome-stage--interactive${preview ? " welcome-stage--preview" : ""}`}
        style={
          screen.backgroundImage
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.45)), url(${screen.backgroundImage})`
              }
            : undefined
        }
        onPointerMove={pointerMove}
        onPointerUp={() => {
          draggingRef.current = null;
          resizingRef.current = null;
        }}
        onPointerLeave={() => {
          draggingRef.current = null;
          resizingRef.current = null;
        }}
      >
        <div
          className="welcome-zone"
          style={boxStyle(screen.layout.header, selected === "header")}
          onPointerDown={(event) => {
            if (preview) return;
            event.preventDefault();
            pushUndo();
            setSelected("header");
            draggingRef.current = "header";
          }}
        >
          {editable("kicker", screen.kicker, "muted")}
          <div>{editable("institutionName", screen.institutionName)}</div>
          <div>{editable("location", screen.location)}</div>
          {!preview ? (
            <span
              className="welcome-resize"
              onPointerDown={(event) => {
                event.stopPropagation();
                pushUndo();
                resizingRef.current = {
                  id: "header",
                  startWidth: screen.layout.header.width,
                  startScale: screen.layout.header.scale
                };
              }}
            />
          ) : null}
        </div>

        <div
          className="welcome-zone"
          style={boxStyle(screen.layout.content, selected === "content")}
          onPointerDown={(event) => {
            if (preview) return;
            event.preventDefault();
            pushUndo();
            setSelected("content");
            draggingRef.current = "content";
          }}
        >
          <h2>
            {editable("title", screen.title)} <em>{editable("titleAccent", screen.titleAccent)}</em>
          </h2>
          <p>{editable("lead", screen.lead)}</p>
          {!preview ? (
            <span
              className="welcome-resize"
              onPointerDown={(event) => {
                event.stopPropagation();
                pushUndo();
                resizingRef.current = {
                  id: "content",
                  startWidth: screen.layout.content.width,
                  startScale: screen.layout.content.scale
                };
              }}
            />
          ) : null}
        </div>

        <div
          className="welcome-zone welcome-zone-btn"
          style={boxStyle(screen.layout.button, selected === "button")}
          onPointerDown={(event) => {
            if (preview) return;
            event.preventDefault();
            pushUndo();
            setSelected("button");
            draggingRef.current = "button";
          }}
        >
          <span>{editable("buttonLabel", screen.buttonLabel)}</span>
          <small>{editable("buttonHint", screen.buttonHint)}</small>
          {!preview ? (
            <span
              className="welcome-resize"
              onPointerDown={(event) => {
                event.stopPropagation();
                pushUndo();
                resizingRef.current = {
                  id: "button",
                  startWidth: screen.layout.button.width,
                  startScale: screen.layout.button.scale
                };
              }}
            />
          ) : null}
        </div>

        <div
          className="welcome-zone"
          style={boxStyle(screen.layout.footer, selected === "footer")}
          onPointerDown={(event) => {
            if (preview) return;
            event.preventDefault();
            pushUndo();
            setSelected("footer");
            draggingRef.current = "footer";
          }}
        >
          <span>{editable("footerLeft", screen.footerLeft)}</span>
          <span>{editable("footerRight", screen.footerRight)}</span>
          {!preview ? (
            <span
              className="welcome-resize"
              onPointerDown={(event) => {
                event.stopPropagation();
                pushUndo();
                resizingRef.current = {
                  id: "footer",
                  startWidth: screen.layout.footer.width,
                  startScale: screen.layout.footer.scale
                };
              }}
            />
          ) : null}
        </div>

        {screen.images.map((image) => (
          <div
            key={image.id}
            className="welcome-zone welcome-zone-image"
            style={boxStyle(image, selected === image.id)}
            onPointerDown={(event) => {
              if (preview) return;
              event.preventDefault();
              pushUndo();
              setSelected(image.id);
              draggingRef.current = image.id;
            }}
          >
            <img src={image.src} alt="" draggable={false} />
            {!preview ? (
              <span
                className="welcome-resize"
                onPointerDown={(event) => {
                  event.stopPropagation();
                  pushUndo();
                  resizingRef.current = {
                    id: image.id,
                    startWidth: image.width,
                    startScale: image.scale
                  };
                }}
              />
            ) : null}
          </div>
        ))}
      </div>

      <p className="hint">
        Перетаскивайте зоны мышью, тяните угол для масштаба, двойной клик — правка текста. Delete — удалить
        выбранное изображение.
      </p>

      {selectedBox ? (
        <div className="welcome-layout-fields">
          {(["x", "y", "width", "scale"] as const).map((prop) => (
            <label key={prop} className="admin-field">
              <span>
                {selected} · {prop}
              </span>
              <input
                type="number"
                step={prop === "scale" ? 0.05 : 1}
                value={selectedBox[prop]}
                onChange={(e) => {
                  pushUndo();
                  updateBox(selected, { [prop]: Number(e.target.value) });
                }}
              />
            </label>
          ))}
        </div>
      ) : null}

      <div className="admin-form-grid">
        <div className="admin-field-wide">
          <MediaUploadField
            label="Фоновое изображение"
            value={screen.backgroundImage}
            onChange={(backgroundImage) => setField("backgroundImage", backgroundImage)}
          />
        </div>
      </div>
    </div>
  );
}
