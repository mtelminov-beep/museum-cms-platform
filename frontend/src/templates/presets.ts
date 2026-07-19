/** Стилистические шаблоны сайта: токены + представление + меню. Разделы — только канонические. */

export type HeroStyle = "fullbleed" | "split" | "dark" | "light" | "cards";
export type MenuStyle = "dark-bar" | "light-bar" | "minimal" | "touch-tiles" | "editorial" | "split-nav";
export type TileStyle = "grid" | "large-cards" | "masonry" | "rows";

export interface TemplateTokens {
  accent: string;
  surface: string;
  ink: string;
  panel: string;
  muted: string;
  gold: string;
  fontDisplay: string;
  fontBody: string;
  /** Google Fonts family query, напр. "Literata:wght@500;700&family=Manrope:wght@400;600" */
  fontQuery: string;
  radius: string;
  heroStyle: HeroStyle;
  menuStyle: MenuStyle;
  tileStyle: TileStyle;
  headerHeight: string;
  letterSpacing: string;
}

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  tokens: TemplateTokens;
  allowedBlocks: string[];
  /** Порядок плиток на главной (подмножество канонических разделов). */
  featuredSections: string[];
}

/** Оригинальные пресеты: композиция и типографика по направлению референса, без чужих ассетов. */
export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: "shihm-cultural-route",
    name: "Культурный маршрут",
    description: "Сдержанный культурный стиль: тёмное меню, serif-заголовки, афиша и QR-гид.",
    tokens: {
      accent: "#2f6f73",
      surface: "#f3efe6",
      ink: "#1d2426",
      panel: "#203336",
      muted: "#667174",
      gold: "#d9b86f",
      fontDisplay: '"Literata", "Georgia", serif',
      fontBody: '"Manrope", "Segoe UI", sans-serif',
      fontQuery: "Literata:wght@500;700&family=Manrope:wght@400;500;600;700",
      radius: "0px",
      heroStyle: "fullbleed",
      menuStyle: "dark-bar",
      tileStyle: "grid",
      headerHeight: "64px",
      letterSpacing: "0.04em"
    },
    allowedBlocks: ["hero", "text", "image", "gallery", "cta", "exhibit-cards", "map", "qr", "ticket"],
    featuredSections: ["about", "poster", "map-museum", "exhibits", "heroes", "tickets", "qr"]
  },
  {
    id: "shihm-digital-guide",
    name: "Цифровой гид",
    description: "Mobile-first: крупные карточки, тач-меню, маршруты и быстрые QR.",
    tokens: {
      accent: "#0f766e",
      surface: "#f4f7f6",
      ink: "#134e4a",
      panel: "#0f3d3a",
      muted: "#5b7c78",
      gold: "#f0c generosa",
      fontDisplay: '"Manrope", "Segoe UI", sans-serif',
      fontBody: '"Manrope", "Segoe UI", sans-serif',
      fontQuery: "Manrope:wght@400;500;600;700;800",
      radius: "16px",
      heroStyle: "cards",
      menuStyle: "touch-tiles",
      tileStyle: "large-cards",
      headerHeight: "72px",
      letterSpacing: "0.02em"
    },
    allowedBlocks: ["hero", "text", "image", "video", "audio", "cta", "exhibit-cards", "qr"],
    featuredSections: ["about", "exhibits", "games", "qr", "map-museum", "poster"]
  },
  {
    id: "natural-discovery",
    name: "Открытия",
    description: "Энергичная палитра, крупные тематические карточки, семейные маршруты.",
    tokens: {
      accent: "#c45c26",
      surface: "#fff8f0",
      ink: "#2b2118",
      panel: "#3d2a1c",
      muted: "#8a6f5a",
      gold: "#e8a54b",
      fontDisplay: '"Fraunces", "Georgia", serif',
      fontBody: '"Source Sans 3", "Segoe UI", sans-serif',
      fontQuery: "Fraunces:opsz,wght@9..144,500;700&family=Source+Sans+3:wght@400;600;700",
      radius: "10px",
      heroStyle: "cards",
      menuStyle: "light-bar",
      tileStyle: "large-cards",
      headerHeight: "68px",
      letterSpacing: "0.06em"
    },
    allowedBlocks: ["hero", "text", "gallery", "event-cards", "cta", "map"],
    featuredSections: ["about", "poster", "news", "games", "map-region", "exhibits"]
  },
  {
    id: "heritage-dark",
    name: "Наследие",
    description: "Тёмная музейная подложка, контрастная типографика, медийные истории.",
    tokens: {
      accent: "#d4a373",
      surface: "#14181b",
      ink: "#f3efe6",
      panel: "#0c0f11",
      muted: "#9a9084",
      gold: "#d4a373",
      fontDisplay: '"Playfair Display", "Georgia", serif',
      fontBody: '"Source Serif 4", "Georgia", serif',
      fontQuery: "Playfair+Display:wght@500;700&family=Source+Serif+4:opsz,wght@8..60,400;600",
      radius: "2px",
      heroStyle: "dark",
      menuStyle: "editorial",
      tileStyle: "rows",
      headerHeight: "70px",
      letterSpacing: "0.12em"
    },
    allowedBlocks: ["hero", "text", "image", "video", "quote", "gallery", "cta"],
    featuredSections: ["about", "poster", "heroes", "cinema", "articles", "exhibits"]
  },
  {
    id: "history-story",
    name: "История в лицах",
    description: "Светлая композиция, акцентный цвет, таймлайн и истории людей.",
    tokens: {
      accent: "#b42318",
      surface: "#faf7f2",
      ink: "#1c1917",
      panel: "#1c1917",
      muted: "#78716c",
      gold: "#b42318",
      fontDisplay: '"Libre Baskerville", "Georgia", serif',
      fontBody: '"Source Sans 3", "Segoe UI", sans-serif',
      fontQuery: "Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;600;700",
      radius: "4px",
      heroStyle: "light",
      menuStyle: "light-bar",
      tileStyle: "rows",
      headerHeight: "64px",
      letterSpacing: "0.08em"
    },
    allowedBlocks: ["hero", "text", "quote", "image", "cta", "exhibit-cards"],
    featuredSections: ["about", "heroes", "articles", "news", "poster"]
  },
  {
    id: "science-split",
    name: "Наука и пространство",
    description: "Split-hero, выставки и события, карта и виджеты для экранов.",
    tokens: {
      accent: "#2563eb",
      surface: "#f1f5f9",
      ink: "#0f172a",
      panel: "#0f172a",
      muted: "#64748b",
      gold: "#38bdf8",
      fontDisplay: '"Space Grotesk", "Segoe UI", sans-serif',
      fontBody: '"IBM Plex Sans", "Segoe UI", sans-serif',
      fontQuery: "Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600",
      radius: "0px",
      heroStyle: "split",
      menuStyle: "split-nav",
      tileStyle: "grid",
      headerHeight: "60px",
      letterSpacing: "0.03em"
    },
    allowedBlocks: ["hero", "text", "columns", "gallery", "map", "event-cards", "cta"],
    featuredSections: ["about", "poster", "map-museum", "games", "cinema", "exhibits"]
  },
  {
    id: "gallery-minimal",
    name: "Галерея",
    description: "Минимализм: изображения произведений, подборки, события.",
    tokens: {
      accent: "#111827",
      surface: "#ffffff",
      ink: "#111827",
      panel: "#111827",
      muted: "#6b7280",
      gold: "#111827",
      fontDisplay: '"Cormorant Garamond", "Georgia", serif',
      fontBody: '"Outfit", "Segoe UI", sans-serif',
      fontQuery: "Cormorant+Garamond:wght@500;600;700&family=Outfit:wght@300;400;500;600",
      radius: "0px",
      heroStyle: "light",
      menuStyle: "minimal",
      tileStyle: "masonry",
      headerHeight: "56px",
      letterSpacing: "0.14em"
    },
    allowedBlocks: ["hero", "image", "gallery", "text", "exhibit-cards", "event-cards"],
    featuredSections: ["about", "exhibits", "poster", "articles", "news"]
  }
];

const FONT_LINK_ID = "museum-cms-template-fonts";

export function applyTemplateToDocument(preset: TemplatePreset) {
  const root = document.documentElement;
  const t = preset.tokens;
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--surface", t.surface);
  root.style.setProperty("--ink", t.ink);
  root.style.setProperty("--panel", t.panel);
  root.style.setProperty("--muted", t.muted);
  root.style.setProperty("--gold", t.gold);
  root.style.setProperty("--radius", t.radius);
  root.style.setProperty("--font-display", t.fontDisplay);
  root.style.setProperty("--font-body", t.fontBody);
  root.style.setProperty("--header-height", t.headerHeight);
  root.style.setProperty("--letter-spacing", t.letterSpacing);
  root.dataset.template = preset.id;
  root.dataset.heroStyle = t.heroStyle;
  root.dataset.menuStyle = t.menuStyle;
  root.dataset.tileStyle = t.tileStyle;

  ensureTemplateFonts(t.fontQuery);
}

function ensureTemplateFonts(fontQuery: string) {
  if (!fontQuery || typeof document === "undefined") return;
  const href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`;
  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    const pre1 = document.createElement("link");
    pre1.rel = "preconnect";
    pre1.href = "https://fonts.googleapis.com";
    document.head.appendChild(pre1);
    const pre2 = document.createElement("link");
    pre2.rel = "preconnect";
    pre2.href = "https://fonts.gstatic.com";
    pre2.crossOrigin = "anonymous";
    document.head.appendChild(pre2);
    link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}

export function getTemplateById(id: string | null | undefined): TemplatePreset {
  return TEMPLATE_PRESETS.find((p) => p.id === id) || TEMPLATE_PRESETS[0];
}
