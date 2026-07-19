import { Link, useParams } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { useCatalogs } from "../stores/CatalogContext";
import type { CmsPage, CmsSection } from "../types";

export function SectionPage() {
  const { id } = useParams();
  const { getCatalog, loading } = useCatalogs();
  const sections = getCatalog<CmsSection[]>("cms-sections-v1") || [];
  const pages = getCatalog<CmsPage[]>("cms-pages-v1") || [];
  const section = sections.find((item) => item.id === id && item.status === "published");

  if (loading) return <main className="loading">Загрузка…</main>;

  if (!section) {
    return (
      <PublicLayout>
        <main className="content-page">
          <h1>Раздел не найден</h1>
          <Link to="/museum">← В меню</Link>
        </main>
      </PublicLayout>
    );
  }

  const linkedPages = (section.pageIds || [])
    .map((pageId) => pages.find((page) => (page.id === pageId || page.slug === pageId) && page.status === "published"))
    .filter(Boolean) as CmsPage[];

  return (
    <PublicLayout>
      <main className="content-page">
        {section.image ? <img className="content-cover" src={section.image} alt="" /> : null}
        <h1>{section.title}</h1>
        {section.summary ? <p className="lead">{section.summary}</p> : null}
        <div className="page-links">
          {linkedPages.map((page) => (
            <Link key={page.id} to={`/page/${page.slug || page.id}`} className="page-link-card">
              <strong>{page.title}</strong>
              {page.summary ? <span>{page.summary}</span> : null}
            </Link>
          ))}
          {!linkedPages.length ? <p className="hint">В разделе пока нет опубликованных страниц.</p> : null}
        </div>
      </main>
    </PublicLayout>
  );
}
