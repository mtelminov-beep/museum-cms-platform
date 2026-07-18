import { Monitor, PanelsTopLeft, Projector, TabletSmartphone } from "lucide-react";
import type { MuseumState } from "../types";

interface ShellProps {
  state: MuseumState;
  activeView: string;
  onViewChange: (view: string) => void;
}

const views = [
  { id: "cms", label: "CMS", icon: PanelsTopLeft },
  { id: "screens", label: "Носители", icon: Monitor },
  { id: "display", label: "Display", icon: Projector },
  { id: "android", label: "Android", icon: TabletSmartphone }
];

export function Shell({ state, activeView, onViewChange }: ShellProps) {
  return (
    <aside className="shell">
      <div className="brand">
        <span className="brand-mark">MC</span>
        <div>
          <strong>{state.museum.name}</strong>
          <small>{state.museum.tagline}</small>
        </div>
      </div>
      <nav>
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <button key={view.id} className={activeView === view.id ? "active" : ""} onClick={() => onViewChange(view.id)}>
              <Icon size={18} />
              <span>{view.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

