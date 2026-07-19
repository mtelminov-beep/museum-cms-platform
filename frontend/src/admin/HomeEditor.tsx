import type { HomeScreenConfig, HomeTile } from "../types";
import { MediaUploadField } from "./MediaUploadField";
import { PublishToggle } from "./PublishToggle";
import { RichTextEditor } from "./RichTextEditor";

function newId() {
  return `tile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function HomeEditor({
  value,
  onChange
}: {
  value: HomeScreenConfig;
  onChange: (next: HomeScreenConfig) => void;
}) {
  const set = <K extends keyof HomeScreenConfig>(key: K, v: HomeScreenConfig[K]) =>
    onChange({ ...value, [key]: v });

  const tiles = Array.isArray(value.tiles) ? value.tiles : [];

  const updateTile = (index: number, patch: Partial<HomeTile>) =>
    set(
      "tiles",
      tiles.map((tile, i) => (i === index ? { ...tile, ...patch } : tile))
    );

  return (
    <div className="admin-stack">
      <div className="admin-form-grid">
        {(
          [
            ["pageTitle", "Заголовок страницы"],
            ["pageSubtitle", "Подзаголовок"],
            ["heroBadge", "Бейдж"],
            ["heroHall", "Зал / зона"],
            ["heroTitle", "Hero заголовок"]
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="admin-field">
            <span>{label}</span>
            <input value={String(value[key] ?? "")} onChange={(e) => set(key, e.target.value)} />
          </label>
        ))}
        <div className="admin-field-wide">
          <span className="hint">Hero описание</span>
          <RichTextEditor value={value.heroDescription} onChange={(heroDescription) => set("heroDescription", heroDescription)} />
        </div>
        <div className="admin-field-wide">
          <MediaUploadField label="Hero изображение" value={value.heroImage} onChange={(heroImage) => set("heroImage", heroImage)} />
        </div>
        <label className="admin-field">
          <span>CTA primary — текст</span>
          <input
            value={value.heroPrimaryCta?.label ?? ""}
            onChange={(e) => set("heroPrimaryCta", { ...value.heroPrimaryCta, label: e.target.value })}
          />
        </label>
        <label className="admin-field">
          <span>CTA primary — route</span>
          <input
            value={value.heroPrimaryCta?.route ?? ""}
            onChange={(e) => set("heroPrimaryCta", { ...value.heroPrimaryCta, route: e.target.value })}
          />
        </label>
        <label className="admin-field">
          <span>CTA secondary — текст</span>
          <input
            value={value.heroSecondaryCta?.label ?? ""}
            onChange={(e) => set("heroSecondaryCta", { ...value.heroSecondaryCta, label: e.target.value })}
          />
        </label>
        <label className="admin-field">
          <span>CTA secondary — route</span>
          <input
            value={value.heroSecondaryCta?.route ?? ""}
            onChange={(e) => set("heroSecondaryCta", { ...value.heroSecondaryCta, route: e.target.value })}
          />
        </label>
      </div>

      <div className="admin-section-head">
        <strong>Плитки меню</strong>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() =>
            set("tiles", [
              ...tiles,
              { id: newId(), title: "Новая плитка", subtitle: "", image: "", route: "/museum", published: true }
            ])
          }
        >
          + Плитка
        </button>
      </div>

      <div className="admin-card-list">
        {tiles.map((tile, index) => (
          <article key={tile.id || index} className="admin-item-card">
            <div className="admin-item-card__head">
              <strong>Плитка {index + 1}</strong>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => set("tiles", tiles.filter((_, i) => i !== index))}
              >
                Удалить
              </button>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Заголовок</span>
                <input value={tile.title} onChange={(e) => updateTile(index, { title: e.target.value })} />
              </label>
              <label className="admin-field">
                <span>Подзаголовок</span>
                <input value={tile.subtitle ?? ""} onChange={(e) => updateTile(index, { subtitle: e.target.value })} />
              </label>
              <label className="admin-field">
                <span>Route</span>
                <input value={tile.route} onChange={(e) => updateTile(index, { route: e.target.value })} />
              </label>
              <div className="admin-field-wide">
                <PublishToggle
                  published={Boolean(tile.published)}
                  onChange={(published) => updateTile(index, { published })}
                  label={tile.title || "Плитка"}
                />
              </div>
              <div className="admin-field-wide">
                <MediaUploadField
                  label="Изображение"
                  value={tile.image ?? ""}
                  onChange={(image) => updateTile(index, { image })}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
