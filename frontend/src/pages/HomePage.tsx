import { Link } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { useCatalogs } from "../stores/CatalogContext";
import type { HomeScreenConfig } from "../types";

export function HomePage() {
  const { getCatalog, loading } = useCatalogs();
  const home = getCatalog<HomeScreenConfig>("cms-home-v1");
  const tiles = (home.tiles || []).filter((tile) => tile.published);

  if (loading) return <main className="loading">Загрузка…</main>;

  return (
    <PublicLayout>
      <main className="home-page">
        <section
          className="home-hero"
          style={home.heroImage ? { backgroundImage: `linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.5)), url(${home.heroImage})` } : undefined}
        >
          <div className="home-hero__inner">
            <span className="eyebrow">{home.heroBadge}</span>
            <small>{home.heroHall}</small>
            <h1>{home.heroTitle}</h1>
            <div className="rich-html" dangerouslySetInnerHTML={{ __html: home.heroDescription || "" }} />
            <div className="home-hero__actions">
              <Link className="btn" to={home.heroPrimaryCta?.route || "/museum"}>
                {home.heroPrimaryCta?.label || "Далее"}
              </Link>
              <Link className="btn btn-ghost" to={home.heroSecondaryCta?.route || "/"}>
                {home.heroSecondaryCta?.label || "Назад"}
              </Link>
            </div>
          </div>
        </section>

        <section className="home-menu">
          <header>
            <h2>{home.pageTitle}</h2>
            {home.pageSubtitle ? <p>{home.pageSubtitle}</p> : null}
          </header>
          <div className="home-tiles">
            {tiles.map((tile) => (
              <Link key={tile.id} to={tile.route} className="home-tile">
                {tile.image ? <img src={tile.image} alt="" /> : <div className="home-tile__placeholder" />}
                <div>
                  <strong>{tile.title}</strong>
                  {tile.subtitle ? <span>{tile.subtitle}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
