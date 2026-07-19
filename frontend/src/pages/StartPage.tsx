import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useCatalogs } from "../stores/CatalogContext";
import type { LayoutBox, WelcomeScreenConfig } from "../types";

function zoneStyle(box: LayoutBox): CSSProperties {
  return {
    left: `${box.x}%`,
    top: `${box.y}%`,
    width: `${box.width}%`,
    transform: `scale(${box.scale})`,
    transformOrigin: "top left"
  };
}

export function StartPage() {
  const { getCatalog, loading } = useCatalogs();
  const screen = getCatalog<WelcomeScreenConfig>("cms-welcome-v1");

  if (loading) return <main className="loading">Загрузка…</main>;

  return (
    <main
      className="start-page"
      style={
        screen.backgroundImage
          ? {
              backgroundImage: `linear-gradient(rgba(12, 20, 22, 0.45), rgba(12, 20, 22, 0.55)), url(${screen.backgroundImage})`
            }
          : undefined
      }
    >
      <div className="start-zone" style={zoneStyle(screen.layout.header)}>
        <small>{screen.kicker}</small>
        <div className="start-institution">{screen.institutionName}</div>
        <div>{screen.location}</div>
      </div>
      <div className="start-zone" style={zoneStyle(screen.layout.content)}>
        <h1>
          {screen.title} <em>{screen.titleAccent}</em>
        </h1>
        <p>{screen.lead}</p>
      </div>
      <div className="start-zone start-zone-cta" style={zoneStyle(screen.layout.button)}>
        <Link to="/museum" className="start-cta">
          {screen.buttonLabel}
        </Link>
        <small>{screen.buttonHint}</small>
      </div>
      <div className="start-zone start-footer" style={zoneStyle(screen.layout.footer)}>
        <span>{screen.footerLeft}</span>
        <span>{screen.footerRight}</span>
      </div>
    </main>
  );
}
