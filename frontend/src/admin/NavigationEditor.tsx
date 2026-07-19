import type { NavigationConfig, NavItem } from "../types";
import { PublishToggle } from "./PublishToggle";

function newId() {
  return `nav-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function NavigationEditor({
  value,
  onChange
}: {
  value: NavigationConfig;
  onChange: (next: NavigationConfig) => void;
}) {
  const items = Array.isArray(value.items) ? value.items : [];

  const update = (index: number, patch: Partial<NavItem>) =>
    onChange({
      items: items.map((item, i) => (i === index ? { ...item, ...patch } : item))
    });

  const setAll = (published: boolean) =>
    onChange({ items: items.map((item) => ({ ...item, published })) });

  return (
    <div className="admin-stack">
      <div className="admin-section-head">
        <div>
          <strong>Пункты меню</strong>
          <p className="hint">Видимость на публичном сайте, маршруты и подписи.</p>
        </div>
        <div className="admin-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAll(true)}>
            Показать все
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAll(false)}>
            Скрыть все
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() =>
              onChange({
                items: [...items, { id: newId(), label: "Новый пункт", route: "/museum", published: true }]
              })
            }
          >
            + Пункт
          </button>
        </div>
      </div>

      <div className="admin-card-list">
        {items.map((item, index) => (
          <article key={item.id || index} className="admin-item-card">
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Подпись</span>
                <input value={item.label} onChange={(e) => update(index, { label: e.target.value })} />
              </label>
              <label className="admin-field">
                <span>Route</span>
                <input value={item.route} onChange={(e) => update(index, { route: e.target.value })} />
              </label>
              <div className="admin-field-wide">
                <PublishToggle
                  published={Boolean(item.published)}
                  onChange={(published) => update(index, { published })}
                  label={item.label || item.id}
                />
              </div>
              <div className="admin-field">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    if (!window.confirm(`Удалить пункт «${item.label}»?`)) return;
                    onChange({ items: items.filter((_, i) => i !== index) });
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
