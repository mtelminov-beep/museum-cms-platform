import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { applyKioskEnvironment } from "./device/kiosk";
import { AdminPage } from "./pages/AdminPage";
import { ContentPage } from "./pages/ContentPage";
import { DisplayPage } from "./pages/DisplayPage";
import { ExhibitPage, QrRedirectPage } from "./pages/EntityPublicPages";
import { HomePage } from "./pages/HomePage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { SectionPage } from "./pages/SectionPage";
import { ExhibitsListPage, PosterHubPage, QrScannerPage } from "./pages/SiteSectionPages";
import { StartPage } from "./pages/StartPage";
import { CatalogProvider } from "./stores/CatalogContext";
import { applyTemplateToDocument, TEMPLATE_PRESETS } from "./templates/presets";
import { useEffect } from "react";
import "./styles.css";

export default function App() {
  useEffect(() => {
    applyKioskEnvironment();
    const id = localStorage.getItem("museum-cms-template") || "shihm-cultural-route";
    const preset = TEMPLATE_PRESETS.find((p) => p.id === id) || TEMPLATE_PRESETS[0];
    applyTemplateToDocument(preset);
  }, []);

  return (
    <BrowserRouter>
      <CatalogProvider>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/museum" element={<HomePage />} />
          <Route path="/section/:id" element={<SectionPage />} />
          <Route path="/page/:id" element={<ContentPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/poster" element={<PosterHubPage />} />
          <Route path="/poster/:tab" element={<PosterHubPage />} />
          <Route path="/exhibits" element={<ExhibitsListPage />} />
          <Route path="/exhibits/:id" element={<ExhibitPage />} />
          <Route path="/qr" element={<QrScannerPage />} />
          <Route path="/q/:publicId" element={<QrRedirectPage />} />
          <Route path="/display/:screenId" element={<DisplayPage />} />
          <Route path="/display" element={<DisplayPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CatalogProvider>
    </BrowserRouter>
  );
}
