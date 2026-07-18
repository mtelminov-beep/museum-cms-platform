import type { MuseumState } from "../types";

export function DisplayPage({ state }: { state: MuseumState }) {
  const playlist = state.playlists[0];
  const exhibition = state.exhibitions[0];

  return (
    <section className="display-stage">
      <div className="display-frame">
        <span className="display-label">Display runtime</span>
        <h1>{playlist?.items[0]?.title || state.museum.name}</h1>
        <p>{exhibition?.summary}</p>
        <div className="display-strip">
          {playlist?.items.map((item, index) => (
            <span key={`${item.type}-${index}`}>{item.type} · {item.duration}s</span>
          ))}
        </div>
      </div>
    </section>
  );
}

