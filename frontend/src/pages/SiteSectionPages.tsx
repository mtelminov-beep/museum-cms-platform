import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ContentBlocks } from "../components/ContentBlocks";
import { PublicLayout } from "../components/PublicLayout";
import { useCatalogs } from "../stores/CatalogContext";
import type { CmsPage } from "../types";

export function PosterHubPage() {
  const { getCatalog } = useCatalogs();
  const page = (getCatalog<CmsPage[]>("cms-pages-v1") || []).find((p) => p.id === "poster" || p.slug === "poster");
  const tab = useParams().tab;
  const sub = page?.subsections?.find((s) => s.id === `poster-${tab}`) || null;

  return (
    <PublicLayout>
      <main className="content-page">
        <h1>Афиша</h1>
        <nav className="poster-tabs">
          <Link to="/poster/current">Текущие</Link>
          <Link to="/poster/announce">Анонсы</Link>
          <Link to="/poster/archive">Архив выставок</Link>
        </nav>
        {sub ? (
          <>
            <h2>{sub.title}</h2>
            {sub.summary ? <p className="lead">{sub.summary}</p> : null}
            <ContentBlocks blocks={sub.blocks} />
          </>
        ) : (
          <>
            {page?.summary ? <p className="lead">{page.summary}</p> : null}
            <ContentBlocks blocks={page?.blocks} />
            <div className="page-links">
              {(page?.subsections || [])
                .filter((s) => s.enabled)
                .map((s) => (
                  <Link key={s.id} className="page-link-card" to={`/poster/${s.id.replace("poster-", "")}`}>
                    <strong>{s.title}</strong>
                    {s.summary ? <span>{s.summary}</span> : null}
                  </Link>
                ))}
            </div>
          </>
        )}
      </main>
    </PublicLayout>
  );
}

export function ExhibitsListPage() {
  const { getCatalog } = useCatalogs();
  const page = (getCatalog<CmsPage[]>("cms-pages-v1") || []).find((p) => p.id === "exhibits" || p.slug === "exhibits");
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetch("/api/v1/entities/exhibits")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(console.error);
  }, []);

  return (
    <PublicLayout>
      <main className="content-page">
        <h1>{page?.title || "Экспонаты"}</h1>
        {page?.summary ? <p className="lead">{page.summary}</p> : null}
        <ContentBlocks blocks={page?.blocks} />
        <div className="page-links">
          {items.map((item) => (
            <Link key={String(item.id)} className="page-link-card" to={`/exhibits/${item.id}`}>
              <strong>{String(item.title || item.id)}</strong>
              {item.summary ? <span>{String(item.summary)}</span> : null}
            </Link>
          ))}
        </div>
      </main>
    </PublicLayout>
  );
}

export function QrScannerPage() {
  const { getCatalog } = useCatalogs();
  const page = (getCatalog<CmsPage[]>("cms-pages-v1") || []).find((p) => p.id === "qr" || p.slug === "qr");
  const [code, setCode] = useState("");
  return (
    <PublicLayout>
      <main className="content-page">
        <h1>{page?.title || "QR-сканер"}</h1>
        {page?.summary ? <p className="lead">{page.summary}</p> : <p className="lead">Введите код с этикетки или откройте ссылку вида /q/…</p>}
        <ContentBlocks blocks={page?.blocks} />
        <label className="admin-field">
          <span>Код / publicId</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="qdemo01" />
        </label>
        <Link className="btn" to={code ? `/q/${code.trim()}` : "/q/qdemo01"}>
          Открыть
        </Link>
      </main>
    </PublicLayout>
  );
}
