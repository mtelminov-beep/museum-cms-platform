import { useEffect, useState } from "react";
import { fetchCmsState } from "./api";
import { Shell } from "./components/Shell";
import { applyKioskEnvironment } from "./device/kiosk";
import { AndroidPage } from "./pages/AndroidPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DisplayPage } from "./pages/DisplayPage";
import { ScreensPage } from "./pages/ScreensPage";
import type { MuseumState } from "./types";
import "./styles.css";

export default function App() {
  const [state, setState] = useState<MuseumState | null>(null);
  const [activeView, setActiveView] = useState("cms");

  useEffect(() => {
    applyKioskEnvironment();
    fetchCmsState().then(setState).catch(console.error);
  }, []);

  if (!state) {
    return <main className="loading">Загрузка CMS...</main>;
  }

  return (
    <main className="app-shell">
      <Shell state={state} activeView={activeView} onViewChange={setActiveView} />
      <div className="content">
        {activeView === "cms" && <DashboardPage state={state} />}
        {activeView === "screens" && <ScreensPage state={state} />}
        {activeView === "display" && <DisplayPage state={state} />}
        {activeView === "android" && <AndroidPage />}
      </div>
    </main>
  );
}

