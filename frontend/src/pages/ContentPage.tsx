import { Link, useParams, useSearchParams } from "react-router-dom";
import { ContentBlocks } from "../components/ContentBlocks";
import { PublicLayout } from "../components/PublicLayout";
import { useCatalogs } from "../stores/CatalogContext";
import type { CmsPage } from "../types";

export function ContentPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { getCatalog, loading } = useCatalogs();
  const pages = getCatalog<CmsPage[]>("cms-pages-v1") || [];
  const page = pages.find((item) => (item.id === id || item.slug === id) && item.status === "published");
  const subId = params.get("sub");

  if (loading) return <main className="loading">Загрузка…</main>;

  if (!page) {
    return (
      <PublicLayout>
        <main className="content-page">
          <h1>Страница не найдена</h1>
          <Link to="/museum">← В меню</Link>
        </main>
      </PublicLayout>
    );
  }

  const subsections = (page.subsections || []).filter((item) => item.enabled);
  const activeSub = subsections.find((item) => item.id === subId) || null;

  return (
    <PublicLayout>
      <main className="content-page">
        <h1>{activeSub ? activeSub.title : page.title}</h1>
        {!activeSub && page.summary ? <p className="lead">{page.summary}</p> : null}
        {activeSub?.summary ? <p className="lead">{activeSub.summary}</p> : null}

        {!activeSub && subsections.length ? (
          <div className="page-links">
            {subsections.map((sub) => (
              <Link key={sub.id} to={`/page/${page.slug || page.id}?sub=${sub.id}`} className="page-link-card">
                {sub.image ? (
                  <img src={sub.image} alt="" style={{ width: "100%", maxHeight: 120, objectFit: "cover" }} />
                ) : null}
                <strong>{sub.title}</strong>
                {sub.summary ? <span>{sub.summary}</span> : null}
              </Link>
            ))}
          </div>
        ) : null}

        {activeSub ? (
          <>
            <p>
              <Link to={`/page/${page.slug || page.id}`}>← К странице</Link>
            </p>
            <ContentBlocks blocks={activeSub.blocks} />
          </>
        ) : (
          <ContentBlocks blocks={page.blocks} />
        )}
      </main>
    </PublicLayout>
  );
}
