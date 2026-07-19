import { useEffect, useMemo, useState } from "react";
import { pagesFromSiteStructure, SITE_SECTIONS } from "../site/structure";
import type { CmsPage } from "../types";
import { TildaPageEditor } from "./TildaPageEditor";

function mergeSitePages(existing: CmsPage[]): CmsPage[] {
  const seeded = pagesFromSiteStructure() as CmsPage[];
  const byId = new Map(existing.map((p) => [p.id, p]));
  for (const page of seeded) {
    if (!byId.has(page.id)) byId.set(page.id, page);
  }
  // Keep site sections first, then custom pages
  const order = new Map(SITE_SECTIONS.map((s, i) => [s.id, i]));
  return [...byId.values()].sort((a, b) => {
    const ai = order.has(a.id) ? (order.get(a.id) as number) : 1000;
    const bi = order.has(b.id) ? (order.get(b.id) as number) : 1000;
    if (ai !== bi) return ai - bi;
    return a.title.localeCompare(b.title, "ru");
  });
}

export function SiteBuilderAdmin({
  pages,
  onChange,
  onPublish,
  busy,
  status
}: {
  pages: CmsPage[];
  onChange: (next: CmsPage[]) => void;
  onPublish: () => void;
  busy?: boolean;
  status?: string | null;
}) {
  const list = useMemo(() => mergeSitePages(Array.isArray(pages) ? pages : []), [pages]);
  const [selectedId, setSelectedId] = useState(SITE_SECTIONS[0]?.id || list[0]?.id);
  const selected = list.find((p) => p.id === selectedId) ?? list[0] ?? null;
  const sectionMeta = SITE_SECTIONS.find((s) => s.id === selected?.id);

  useEffect(() => {
    // Ensure canonical pages exist in draft once
    const merged = mergeSitePages(Array.isArray(pages) ? pages : []);
    if (merged.length !== (pages?.length || 0) || merged.some((p, i) => p.id !== pages?.[i]?.id)) {
      const same =
        merged.length === (pages?.length || 0) &&
        merged.every((p) => {
          const cur = pages?.find((x) => x.id === p.id);
          return cur != null;
        });
      if (!same) onChange(merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once when empty / missing structure
  }, []);

  useEffect(() => {
    if (!list.some((p) => p.id === selectedId) && list[0]) {
      setSelectedId(list[0].id);
    }
  }, [list, selectedId]);

  return (
    <div className="site-builder">
      <aside className="site-builder__nav">
        <div className="admin-section-head">
          <strong>Разделы сайта</strong>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              onChange(mergeSitePages(list));
              setSelectedId(SITE_SECTIONS[0]?.id || list[0]?.id);
            }}
          >
            Восстановить структуру
          </button>
        </div>
        <p className="hint site-builder__hint">
          Визуальный конструктор (как Tilda): блоки, медиа и материалы раздела.
        </p>
        {SITE_SECTIONS.map((section) => {
          const page = list.find((p) => p.id === section.id);
          return (
            <button
              key={section.id}
              type="button"
              className={selectedId === section.id ? "site-builder__item active" : "site-builder__item"}
              onClick={() => {
                if (!page) {
                  const seeded = (pagesFromSiteStructure() as CmsPage[]).find((p) => p.id === section.id);
                  if (seeded) {
                    onChange(mergeSitePages([...list, seeded]));
                  }
                }
                setSelectedId(section.id);
              }}
            >
              <strong>{section.label}</strong>
              <small>
                {page ? `${page.blocks?.length || 0} блоков` : "создать"} · {section.route}
              </small>
            </button>
          );
        })}
      </aside>

      <div className="site-builder__main">
        <header className="admin-main__head site-builder__head">
          <div>
            <h1>{selected?.title || "Визуальный редактор"}</h1>
            <p className="hint">
              {sectionMeta?.description || "Соберите страницу блоками и материалами"}
              {status ? ` · ${status}` : ""}
            </p>
          </div>
          <div className="admin-actions">
            <button type="button" className="btn" disabled={busy || !selected} onClick={onPublish}>
              Опубликовать сайт
            </button>
          </div>
        </header>

        {selected ? (
          <TildaPageEditor
            page={selected}
            onChange={(page) => onChange(list.map((item) => (item.id === selected.id ? page : item)))}
          />
        ) : (
          <p className="hint">Выберите раздел слева</p>
        )}
      </div>
    </div>
  );
}
