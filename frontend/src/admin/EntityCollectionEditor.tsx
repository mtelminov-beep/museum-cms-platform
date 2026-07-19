import { useEffect, useState } from "react";
import { getCmsToken } from "../api";

export type EntityCollection =
  | "halls"
  | "exhibitions"
  | "exhibits"
  | "events"
  | "persons"
  | "articles"
  | "routes"
  | "mediaAssets"
  | "qrCodes"
  | "devices";

const LABELS: Record<EntityCollection, string> = {
  halls: "Залы",
  exhibitions: "Выставки",
  exhibits: "Экспонаты",
  events: "События",
  persons: "Персоны",
  articles: "Статьи",
  routes: "Маршруты",
  mediaAssets: "Медиатека",
  qrCodes: "QR-коды",
  devices: "Устройства"
};

const FIELDS: Record<EntityCollection, Array<{ key: string; label: string; kind?: "text" | "textarea" | "status" }>> = {
  halls: [
    { key: "title", label: "Название" },
    { key: "floor", label: "Этаж / зона" },
    { key: "branchId", label: "Филиал ID" },
    { key: "status", label: "Статус", kind: "status" }
  ],
  exhibitions: [
    { key: "title", label: "Название" },
    { key: "type", label: "Тип (permanent/temporary/virtual)" },
    { key: "summary", label: "Описание", kind: "textarea" },
    { key: "coverImage", label: "Обложка URL" },
    { key: "status", label: "Статус", kind: "status" }
  ],
  exhibits: [
    { key: "title", label: "Название" },
    { key: "inventoryNumber", label: "Инв. номер" },
    { key: "summary", label: "Кратко", kind: "textarea" },
    { key: "description", label: "Полное описание (HTML)", kind: "textarea" },
    { key: "hallId", label: "Зал ID" },
    { key: "status", label: "Статус", kind: "status" }
  ],
  events: [
    { key: "title", label: "Название" },
    { key: "startsAt", label: "Дата/время ISO" },
    { key: "location", label: "Место" },
    { key: "summary", label: "Описание", kind: "textarea" },
    { key: "status", label: "Статус", kind: "status" }
  ],
  persons: [
    { key: "title", label: "ФИО" },
    { key: "role", label: "Роль" },
    { key: "summary", label: "Биография", kind: "textarea" },
    { key: "status", label: "Статус", kind: "status" }
  ],
  articles: [
    { key: "title", label: "Заголовок" },
    { key: "summary", label: "Аннотация", kind: "textarea" },
    { key: "status", label: "Статус", kind: "status" }
  ],
  routes: [
    { key: "title", label: "Название" },
    { key: "durationMin", label: "Длительность, мин" },
    { key: "audience", label: "Аудитория" },
    { key: "summary", label: "Описание", kind: "textarea" },
    { key: "status", label: "Статус", kind: "status" }
  ],
  mediaAssets: [
    { key: "title", label: "Название" },
    { key: "url", label: "URL" },
    { key: "alt", label: "Alt-текст" },
    { key: "license", label: "Права / лицензия" },
    { key: "status", label: "Статус", kind: "status" }
  ],
  qrCodes: [
    { key: "label", label: "Подпись" },
    { key: "publicId", label: "Стабильный publicId" },
    { key: "targetType", label: "Цель (exhibit/exhibition/page/route/url)" },
    { key: "targetId", label: "ID цели / URL" },
    { key: "status", label: "Статус", kind: "status" }
  ],
  devices: [
    { key: "name", label: "Имя" },
    { key: "type", label: "Тип (kiosk/tablet/tv/led)" },
    { key: "pairingCode", label: "Код регистрации" },
    { key: "route", label: "Маршрут player" },
    { key: "playlistId", label: "Плейлист ID" },
    { key: "status", label: "Статус", kind: "status" }
  ]
};

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-CMS-Token": getCmsToken(),
      "X-CMS-Role": sessionStorage.getItem("museum-cms-role") || "admin",
      "X-CMS-Actor": sessionStorage.getItem("museum-cms-actor") || "admin",
      ...(init?.headers || {})
    }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function newItem(collection: EntityCollection) {
  const base: Record<string, unknown> = {
    title: "Новая запись",
    status: "draft"
  };
  if (collection === "devices") {
    return {
      name: "Новое устройство",
      type: "kiosk",
      pairingCode: `CODE${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      route: "/display/new",
      status: "draft"
    };
  }
  if (collection === "qrCodes") {
    return {
      label: "Новый QR",
      publicId: `q${Date.now().toString(36)}`,
      targetType: "exhibit",
      targetId: "",
      status: "draft"
    };
  }
  if (collection === "mediaAssets") {
    return { title: "Медиа", url: "", alt: "", license: "", status: "draft" };
  }
  return base;
}

export function EntityCollectionEditor({ collection }: { collection: EntityCollection }) {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const data = await api(`/api/v1/entities/${collection}`);
      setItems(data.items || []);
      setSelectedId((data.items || [])[0]?.id);
      setStatus(`Загружено: ${(data.items || []).length}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, [collection]);

  const selected = items.find((item) => item.id === selectedId);

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return JSON.stringify(item).toLowerCase().includes(q);
  });

  const save = async (patch: Record<string, unknown>) => {
    if (!selected?.id) return;
    setBusy(true);
    try {
      const data = await api(`/api/v1/entities/${collection}/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch)
      });
      setItems((prev) => prev.map((item) => (item.id === selected.id ? data.item : item)));
      setStatus("Сохранено");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-stack">
      <div className="admin-section-head">
        <div>
          <strong>{LABELS[collection]}</strong>
          <p className="hint">{status}</p>
        </div>
        <div className="admin-actions">
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => void load()}>
            Обновить
          </button>
          <button
            type="button"
            className="btn btn-sm"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const data = await api(`/api/v1/entities/${collection}`, {
                  method: "POST",
                  body: JSON.stringify(newItem(collection))
                });
                setItems((prev) => [...prev, data.item]);
                setSelectedId(data.item.id);
                setStatus("Создано");
              } catch (err) {
                setStatus(err instanceof Error ? err.message : "Ошибка");
              } finally {
                setBusy(false);
              }
            }}
          >
            + Добавить
          </button>
        </div>
      </div>

      <div className="array-editor">
        <aside className="array-editor__list">
          <label className="admin-field">
            <span>Поиск</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          {filtered.map((item) => (
            <button
              key={String(item.id)}
              type="button"
              className={item.id === selectedId ? "array-editor__item active" : "array-editor__item"}
              onClick={() => setSelectedId(String(item.id))}
            >
              <strong>{String(item.title || item.name || item.label || item.id)}</strong>
              <small>
                {String(item.status || "")} · {String(item.id)}
              </small>
            </button>
          ))}
        </aside>

        <div className="array-editor__detail">
          {!selected ? (
            <p className="hint">Выберите запись</p>
          ) : (
            <>
              <div className="admin-form-grid">
                {FIELDS[collection].map((field) => {
                  const value = selected[field.key];
                  if (field.kind === "status") {
                    return (
                      <label key={field.key} className="admin-field">
                        <span>{field.label}</span>
                        <select
                          value={String(value || "draft")}
                          onChange={(e) => void save({ [field.key]: e.target.value })}
                        >
                          <option value="draft">draft</option>
                          <option value="published">published</option>
                          <option value="archived">archived</option>
                        </select>
                      </label>
                    );
                  }
                  if (field.kind === "textarea") {
                    return (
                      <label key={field.key} className="admin-field admin-field-wide">
                        <span>{field.label}</span>
                        <textarea
                          rows={4}
                          defaultValue={String(value ?? "")}
                          key={`${selected.id}-${field.key}`}
                          onBlur={(e) => void save({ [field.key]: e.target.value })}
                        />
                      </label>
                    );
                  }
                  return (
                    <label key={field.key} className="admin-field">
                      <span>{field.label}</span>
                      <input
                        defaultValue={String(value ?? "")}
                        key={`${selected.id}-${field.key}`}
                        onBlur={(e) => void save({ [field.key]: e.target.value })}
                      />
                    </label>
                  );
                })}
              </div>
              {collection === "devices" ? (
                <p className="hint">
                  Код регистрации: <strong>{String(selected.pairingCode || "—")}</strong>. Онлайн:{" "}
                  {selected.online ? "да" : "нет"}. Heartbeat: {String(selected.lastHeartbeatAt || "—")}
                </p>
              ) : null}
              {collection === "qrCodes" ? (
                <p className="hint">
                  Публичный адрес: <code>/q/{String(selected.publicId || "")}</code>
                </p>
              ) : null}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={async () => {
                  if (!window.confirm("Архивировать запись?")) return;
                  await api(`/api/v1/entities/${collection}/${selected.id}`, { method: "DELETE" });
                  await load();
                }}
              >
                Архивировать
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const ENTITY_NAV: Array<{ id: EntityCollection; label: string }> = [
  { id: "exhibitions", label: "Выставки" },
  { id: "exhibits", label: "Экспонаты" },
  { id: "halls", label: "Залы" },
  { id: "events", label: "События" },
  { id: "routes", label: "Маршруты" },
  { id: "persons", label: "Персоны" },
  { id: "articles", label: "Статьи" },
  { id: "mediaAssets", label: "Медиатека" },
  { id: "qrCodes", label: "QR-центр" },
  { id: "devices", label: "Устройства" }
];
