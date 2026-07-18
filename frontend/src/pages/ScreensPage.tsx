import { RotateCcw } from "lucide-react";
import type { MuseumState } from "../types";

export function ScreensPage({ state }: { state: MuseumState }) {
  return (
    <section className="page-grid">
      <header className="page-header">
        <h1>Управление носителями</h1>
        <p>Профили экранов задают масштаб, ориентацию, тип взаимодействия и kiosk-поведение.</p>
      </header>
      <div className="screen-list">
        {state.screens.map((screen) => (
          <article key={screen.id} className="screen-card">
            <div>
              <strong>{screen.name}</strong>
              <span>{screen.deviceType} · {screen.profile}</span>
            </div>
            <div className="screen-meta">
              <span><RotateCcw size={16} /> {screen.rotation}°</span>
              <span>{screen.kiosk ? "Kiosk" : "Managed"}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

