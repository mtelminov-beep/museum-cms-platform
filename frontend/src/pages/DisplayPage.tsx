import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCmsState } from "../api";
import type { MuseumState } from "../types";

export function DisplayPage({ state: injected }: { state?: MuseumState }) {
  const { screenId } = useParams();
  const [state, setState] = useState<MuseumState | null>(injected ?? null);

  useEffect(() => {
    if (injected) {
      setState(injected);
      return;
    }
    fetchCmsState().then(setState).catch(console.error);
  }, [injected]);

  if (!state) return <main className="loading">Загрузка display…</main>;

  const screen = screenId ? state.screens.find((item) => item.id === screenId) : state.screens[0];
  const playlist =
    state.playlists.find((item) => item.targetScreens.includes(screen?.id || "")) || state.playlists[0];

  return (
    <section className="display-stage">
      <div className="display-frame">
        <span className="display-label">{screen?.name || "Display runtime"}</span>
        <h1>{playlist?.items[0]?.title || state.museum.name}</h1>
        <p>{state.museum.tagline}</p>
        <div className="display-strip">
          {playlist?.items.map((item, index) => (
            <span key={`${item.type}-${index}`}>
              {item.type} · {item.duration}s
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
