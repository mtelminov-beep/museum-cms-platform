import { PublicLayout } from "../components/PublicLayout";
import { useCatalogs } from "../stores/CatalogContext";
import type { CmsMaterial } from "../types";

export function MaterialsPage() {
  const { getCatalog, loading } = useCatalogs();
  const materials = (getCatalog<CmsMaterial[]>("cms-materials-v1") || []).filter(
    (item) => item.status === "published"
  );

  if (loading) return <main className="loading">Загрузка…</main>;

  return (
    <PublicLayout>
      <main className="content-page">
        <h1>Материалы</h1>
        <div className="materials-grid">
          {materials.map((item) => (
            <article key={item.id} className="material-card">
              {item.coverImage ? <img src={item.coverImage} alt="" /> : null}
              <strong>{item.title}</strong>
              {item.category ? <small>{item.category}</small> : null}
              {item.annotation ? <p>{item.annotation}</p> : null}
              {item.fileUrl ? (
                <a href={item.fileUrl} target="_blank" rel="noreferrer">
                  Открыть файл
                </a>
              ) : null}
            </article>
          ))}
          {!materials.length ? <p className="hint">Пока нет опубликованных материалов.</p> : null}
        </div>
      </main>
    </PublicLayout>
  );
}
