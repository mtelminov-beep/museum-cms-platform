import { useCallback, useRef, useState } from "react";
import { uploadMedia } from "../api";

function isImage(url: string) {
  return /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url) || url.startsWith("data:image");
}
function isVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.startsWith("data:video");
}
function isAudio(url: string) {
  return /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(url) || url.startsWith("data:audio");
}

export function MediaUploadField({
  label,
  value,
  onChange,
  hint
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const file = [...files][0];
      if (!file) return;
      setBusy(true);
      setError(null);
      try {
        const result = await uploadMedia(file);
        onChange(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки");
      } finally {
        setBusy(false);
      }
    },
    [onChange]
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
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/... или URL"
          />
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "…" : "Файл"}
          </button>
        </div>
      </label>

      <input
        ref={inputRef}
        type="file"
        hidden
        accept="image/*,video/*,audio/*,.pdf"
        onChange={(e) => {
          if (e.target.files?.length) void uploadFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {value ? (
        <div
          className={`cms-media__current${dragOver ? " cms-media__current--active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <span className="hint">Текущий файл — перетащите новый, чтобы заменить</span>
          <div className="cms-media__preview">
            {isImage(value) ? <img src={value} alt="" /> : null}
            {isVideo(value) ? <video src={value} controls preload="metadata" /> : null}
            {isAudio(value) ? <audio src={value} controls preload="none" /> : null}
            {!isImage(value) && !isVideo(value) && !isAudio(value) ? (
              <a href={value} target="_blank" rel="noreferrer">
                Открыть файл
              </a>
            ) : null}
          </div>
          <div className="admin-actions">
            <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => inputRef.current?.click()}>
              Заменить
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange("")}>
              Удалить
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`cms-media__drop${dragOver ? " cms-media__drop--active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <p>{busy ? "Загрузка…" : "Перетащите файл сюда или выберите на компьютере"}</p>
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            Выбрать файл
          </button>
        </div>
      )}

      {error ? <small className="admin-error">{error}</small> : null}
    </div>
  );
}
