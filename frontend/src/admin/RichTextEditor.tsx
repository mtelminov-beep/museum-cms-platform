import { useEffect, useRef } from "react";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toHtml(value: string): string {
  const v = value ?? "";
  if (!v) return "";
  if (/<[a-z][\s\S]*>/i.test(v)) return v;
  return `<p>${escapeHtml(v).replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>`;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const html = toHtml(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== html) el.innerHTML = html || "";
  }, [html]);

  const run = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  };

  return (
    <div className="cms-rich-text">
      <div className="cms-rich-text__toolbar">
        <button type="button" onClick={() => run("formatBlock", "h2")}>
          H2
        </button>
        <button type="button" onClick={() => run("formatBlock", "h3")}>
          H3
        </button>
        <button type="button" onClick={() => run("formatBlock", "p")}>
          P
        </button>
        <button type="button" onClick={() => run("bold")}>
          B
        </button>
        <button type="button" onClick={() => run("italic")}>
          I
        </button>
        <button type="button" onClick={() => run("underline")}>
          U
        </button>
        <button type="button" onClick={() => run("insertUnorderedList")}>
          • Список
        </button>
        <button type="button" onClick={() => run("insertOrderedList")}>
          1. Список
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Ссылка URL");
            if (url) run("createLink", url);
          }}
        >
          Ссылка
        </button>
        <button type="button" onClick={() => run("removeFormat")}>
          Очистить
        </button>
      </div>
      <div
        ref={ref}
        className="cms-rich-text__editor"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || "Введите текст…"}
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        onBlur={() => onChange(ref.current?.innerHTML ?? "")}
      />
      <p className="hint">Форматирование: заголовки, жирный, курсив, списки, ссылки.</p>
    </div>
  );
}
