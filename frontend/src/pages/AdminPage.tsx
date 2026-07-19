import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrayCatalogEditor,
  createMaterialItem,
  createSectionItem
} from "../admin/ArrayCatalogEditor";
import { ENTITY_NAV, EntityCollectionEditor, type EntityCollection } from "../admin/EntityCollectionEditor";
import { HomeEditor } from "../admin/HomeEditor";
import { NavigationEditor } from "../admin/NavigationEditor";
import { PagesCatalogEditor } from "../admin/VisualPageEditor";
import { WelcomeEditor } from "../admin/WelcomeEditor";
import { clearAdminSession, getAdminSession, setAdminSession } from "../adminAuth";
import {
  adminLogin,
  broadcastCatalogUpdate,
  clearCmsToken,
  fetchCatalog,
  fetchCmsState,
  probeCmsServer,
  putCatalog,
  setCmsToken
} from "../api";
import { CMS_CATALOG_KEYS, sectionLabels } from "../cmsConfig";
import { catalogDefaults } from "../data/defaults";
import { useCatalogs } from "../stores/CatalogContext";
import { AndroidPage } from "./AndroidPage";
import { DisplayPage } from "./DisplayPage";
import { ScreensPage } from "./ScreensPage";
import type {
  CmsCatalogKey,
  CmsMaterial,
  CmsPage,
  CmsSection,
  HomeScreenConfig,
  MuseumState,
  NavigationConfig,
  WelcomeScreenConfig
} from "../types";

type AdminTab = "content" | "entities" | "screens" | "display" | "android";

const DRAFT_PREFIX = "museum-cms-draft:";

function loadDraft(key: CmsCatalogKey): unknown | null {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(key: CmsCatalogKey, payload: unknown) {
  localStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(payload));
}

function AdminLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [login, setLogin] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="admin-login">
      <form
        className="admin-login__card"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const result = await adminLogin(login, password);
            setCmsToken(result.token);
            setAdminSession(result.admin.login);
            sessionStorage.setItem("museum-cms-role", result.admin.role || "admin");
            sessionStorage.setItem("museum-cms-actor", result.admin.login || "admin");
            onSuccess();
          } catch {
            setError("Неверный логин или пароль");
          } finally {
            setBusy(false);
          }
        }}
      >
        <h1>Админ-панель</h1>
        <p>Управление контентом Museum CMS. По умолчанию: admin / admin</p>
        <label className="admin-field">
          <span>Логин</span>
          <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" />
        </label>
        <label className="admin-field">
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="admin-error">{error}</p> : null}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Вход…" : "Войти"}
        </button>
        <Link className="admin-login__back" to="/">
          ← На публичный сайт
        </Link>
      </form>
    </div>
  );
}

function CatalogWorkspace({
  section,
  draft,
  setDraft
}: {
  section: CmsCatalogKey;
  draft: unknown;
  setDraft: (value: unknown) => void;
}) {
  if (section === "cms-welcome-v1") {
    return (
      <WelcomeEditor
        value={(draft as WelcomeScreenConfig) || catalogDefaults["cms-welcome-v1"]}
        onChange={setDraft}
      />
    );
  }
  if (section === "cms-home-v1") {
    return <HomeEditor value={(draft as HomeScreenConfig) || catalogDefaults["cms-home-v1"]} onChange={setDraft} />;
  }
  if (section === "cms-navigation-v1") {
    return (
      <NavigationEditor
        value={(draft as NavigationConfig) || catalogDefaults["cms-navigation-v1"]}
        onChange={setDraft}
      />
    );
  }
  if (section === "cms-sections-v1") {
    return (
      <ArrayCatalogEditor<CmsSection>
        items={(draft as CmsSection[]) || []}
        onChange={setDraft}
        createItem={createSectionItem}
        fields={[
          { key: "id", label: "ID" },
          { key: "title", label: "Название" },
          { key: "summary", label: "Описание", kind: "textarea" },
          { key: "status", label: "Статус", kind: "status" },
          { key: "pageIds", label: "ID страниц", kind: "tags" },
          { key: "image", label: "Обложка", kind: "media" }
        ]}
      />
    );
  }
  if (section === "cms-pages-v1") {
    return <PagesCatalogEditor items={(draft as CmsPage[]) || []} onChange={setDraft} />;
  }
  return (
    <ArrayCatalogEditor<CmsMaterial>
      items={(draft as CmsMaterial[]) || []}
      onChange={setDraft}
      createItem={createMaterialItem}
      fields={[
        { key: "id", label: "ID" },
        { key: "title", label: "Название" },
        { key: "annotation", label: "Аннотация", kind: "textarea" },
        { key: "category", label: "Категория" },
        { key: "status", label: "Статус", kind: "status" },
        { key: "coverImage", label: "Обложка", kind: "media" },
        { key: "fileUrl", label: "Файл", kind: "media" }
      ]}
    />
  );
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const { refresh } = useCatalogs();
  const [tab, setTab] = useState<AdminTab>("content");
  const [section, setSection] = useState<CmsCatalogKey>("cms-welcome-v1");
  const [entityCollection, setEntityCollection] = useState<EntityCollection>("exhibitions");
  const [draft, setDraft] = useState<unknown>(catalogDefaults["cms-welcome-v1"]);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [museumState, setMuseumState] = useState<MuseumState | null>(null);

  const loadSection = async (key: CmsCatalogKey, preferLocal = true) => {
    setBusy(true);
    setStatus(null);
    setJsonError(null);
    try {
      const local = preferLocal ? loadDraft(key) : null;
      if (local != null) {
        setDraft(local);
        setStatus("Загружен локальный черновик");
      } else {
        const remote = await fetchCatalog(key);
        setDraft(remote.payload ?? catalogDefaults[key]);
        setStatus(remote.updatedAt ? `С сервера: ${remote.updatedAt}` : "Значения по умолчанию");
      }
    } catch (err) {
      setDraft(catalogDefaults[key]);
      setStatus(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setBusy(false);
    }
  };

  const resetDefaults = () => {
    if (!window.confirm("Сбросить раздел к значениям по умолчанию?")) return;
    const next = catalogDefaults[section];
    setDraft(next);
    saveDraft(section, next);
    setStatus("Сброшено к defaults");
  };

  const checkServer = async () => {
    const result = await probeCmsServer();
    setServerOk(result.ok);
    setStatus(result.ok ? `Сервер OK · ${result.time ?? ""}` : `Сервер недоступен · ${result.error ?? ""}`);
  };

  const publishToServer = async () => {
    setBusy(true);
    try {
      const result = await putCatalog(section, draft);
      if (section !== "cms-navigation-v1") {
        const navDraft = loadDraft("cms-navigation-v1");
        if (navDraft != null) {
          await putCatalog("cms-navigation-v1", navDraft);
        }
      }
      localStorage.removeItem(DRAFT_PREFIX + section);
      broadcastCatalogUpdate(section);
      await refresh();
      setStatus(`Опубликовано: ${result.updatedAt}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Ошибка публикации");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void loadSection(section);
    void checkServer();
  }, [section]);

  useEffect(() => {
    setJsonText(JSON.stringify(draft, null, 2));
    setJsonError(null);
  }, [draft]);

  useEffect(() => {
    if (tab === "screens" || tab === "display") {
      fetchCmsState().then(setMuseumState).catch(console.error);
    }
  }, [tab]);

  const serverChip = useMemo(() => {
    if (serverOk == null) return "сервер…";
    return serverOk ? "сервер online" : "сервер offline";
  }, [serverOk]);

  return (
    <div className="admin-app">
      <aside className="admin-shell">
        <div className="brand">
          <div className="brand-mark">CMS</div>
          <div>
            <strong>Админ</strong>
            <small>Museum CMS Platform</small>
          </div>
        </div>

        <button type="button" className={`server-chip${serverOk ? " ok" : serverOk === false ? " bad" : ""}`} onClick={() => void checkServer()}>
          {serverChip}
        </button>

        <nav className="admin-tabs">
          {(
            [
              ["content", "Страницы"],
              ["entities", "Контент"],
              ["screens", "Носители"],
              ["display", "Display"],
              ["android", "Android"]
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === "content" ? (
          <nav className="admin-sections">
            {CMS_CATALOG_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className={section === key ? "active" : ""}
                onClick={() => setSection(key)}
              >
                {sectionLabels[key]}
              </button>
            ))}
          </nav>
        ) : null}

        {tab === "entities" ? (
          <nav className="admin-sections">
            {ENTITY_NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                className={entityCollection === item.id ? "active" : ""}
                onClick={() => setEntityCollection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        ) : null}

        <div className="admin-shell__footer">
          <Link to="/">Публичный сайт</Link>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              clearAdminSession();
              clearCmsToken();
              onLogout();
            }}
          >
            Выйти
          </button>
        </div>
      </aside>

      <div className="admin-main">
        {tab === "content" ? (
          <>
            <header className="admin-main__head">
              <div>
                <h1>{sectionLabels[section]}</h1>
                <p className="hint">{status}</p>
              </div>
              <div className="admin-actions">
                <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void loadSection(section, false)}>
                  С сервера
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    saveDraft(section, draft);
                    setStatus("Черновик сохранён локально");
                  }}
                >
                  Сохранить локально
                </button>
                <button type="button" className="btn btn-ghost" onClick={resetDefaults}>
                  Сброс
                </button>
                <button type="button" className="btn" disabled={busy} onClick={() => void publishToServer()}>
                  Опубликовать
                </button>
              </div>
            </header>

            <CatalogWorkspace
              section={section}
              draft={draft}
              setDraft={(value) => {
                setDraft(value);
                saveDraft(section, value);
              }}
            />

            <details className="admin-json">
              <summary>Расширенный JSON (редактирование)</summary>
              <textarea
                className="admin-json__editor"
                rows={16}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
              />
              {jsonError ? <p className="admin-error">{jsonError}</p> : null}
              <div className="admin-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(jsonText);
                      setDraft(parsed);
                      saveDraft(section, parsed);
                      setJsonError(null);
                      setStatus("JSON применён к черновику");
                    } catch (err) {
                      setJsonError(err instanceof Error ? err.message : "Некорректный JSON");
                    }
                  }}
                >
                  Применить JSON
                </button>
              </div>
            </details>
          </>
        ) : null}

        {tab === "entities" ? (
          <>
            <header className="admin-main__head">
              <div>
                <h1>Модель контента MuseumOS</h1>
                <p className="hint">Выставки, экспонаты, залы, QR и устройства — одна запись, несколько каналов.</p>
              </div>
            </header>
            <EntityCollectionEditor collection={entityCollection} />
          </>
        ) : null}

        {tab === "screens" && museumState ? <ScreensPage state={museumState} /> : null}
        {tab === "display" && museumState ? <DisplayPage state={museumState} /> : null}
        {tab === "android" ? <AndroidPage /> : null}
      </div>
    </div>
  );
}

export function AdminPage() {
  const [authed, setAuthed] = useState(() => Boolean(getAdminSession()));

  if (!authed) {
    return <AdminLoginForm onSuccess={() => setAuthed(true)} />;
  }

  return <AdminPanel onLogout={() => setAuthed(false)} />;
}
