import { useCallback, useRef, useState } from "react";
import { uploadMedia } from "../api";

function isImage(url: string) {
  return /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url) || url.startsWith("data:image");
}
function isVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url) || /youtube|youtu\.be|vk\.com|rutube/i.test(url);
}
function isAudio(url: string) {
  return /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(url);
}

export function MediaUploadField({
  label,
  value,
  onChange,
  hint,
  folder = "uploads",
  multiple = false
}: {
  label: string;
  value: string | string[];
  onChange: (url: string | string[]) => void;
  hint?: string;
  folder?: string;
  multiple?: boolean;
}) {
  const urls = multiple ? (Array.isArray(value) ? value : []) : [];
  const single = multiple ? "" : String(value ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = [...files];
      if (!list.length) return;
      setBusy(true);
      setError(null);
      try {
        const uploaded: string[] = [];
        for (const file of list) {
          const result = await uploadMedia(file, folder);
          uploaded.push(result.url);
        }
        if (multiple) onChange([...urls, ...uploaded]);
        else onChange(uploaded[0] ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки");
      } finally {
        setBusy(false);
      }
    },
    [folder, multiple, onChange, urls]
  );

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    void uploadFiles(event.dataTransfer.files);
  };

  return (
    <div className="cms-media">
      <label className="admin-field">
        <span>{label}</span>
        {hint ? <p className="hint">{hint}</p> : null}
        <div className="admin-media-row">
          <input
            type="text"
            value={multiple ? "" : single}
            placeholder={multiple ? "URL добавляется загрузкой" : "/exhibits/... или внешний URL"}
            onChange={(e) => (!multiple ? onChange(e.target.value) : undefined)}
            disabled={multiple}
          />
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "…" : "Файл"}
          </button>
        </div>
        <small className="hint">Папка: {folder}</small>
      </label>

      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        accept="image/*,video/*,audio/*,.pdf"
        onChange={(e) => {
          if (e.target.files?.length) void uploadFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        className={`cms-media__drop${dragOver ? " cms-media__drop--active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <p>{busy ? "Загрузка…" : "Перетащите файлы сюда (изображение, видео, аудио, PDF)"}</p>
      </div>

      {!multiple && single ? (
        <div className="cms-media__preview">
          {isImage(single) ? <img src={single} alt="" /> : null}
          {isVideo(single) && !/youtube|vk\.com|rutube/i.test(single) ? (
            <video src={single} controls preload="metadata" />
          ) : null}
          {isAudio(single) ? <audio src={single} controls /> : null}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange("")}>
            Удалить
          </button>
        </div>
      ) : null}

      {multiple && urls.length ? (
        <ul className="cms-media__list">
          {urls.map((url, index) => (
            <li key={`${url}-${index}`}>
              {isImage(url) ? <img src={url} alt="" /> : <a href={url}>{url}</a>}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onChange(urls.filter((_, i) => i !== index))}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <small className="admin-error">{error}</small> : null}
    </div>
  );
}
