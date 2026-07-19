export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  tokens: {
    accent: string;
    surface: string;
    ink: string;
    fontDisplay: string;
    fontBody: string;
    radius: string;
    heroStyle: "fullbleed" | "split" | "dark" | "light" | "cards";
  };
  allowedBlocks: string[];
  pagePresets: string[];
}

/** Оригинальные пресеты (вдохновение композицией, без копирования чужих ассетов). */
export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: "shihm-cultural-route",
    name: "Культурный маршрут",
    description: "Сдержанный культурный стиль: разделы музея, афиша, карты, QR-гид.",
    tokens: {
      accent: "#2f6f73",
      surface: "#f3efe6",
      ink: "#1d2426",
      fontDisplay: '"Segoe UI", sans-serif',
      fontBody: '"Segoe UI", sans-serif',
      radius: "0px",
      heroStyle: "fullbleed"
    },
    allowedBlocks: ["hero", "text", "image", "gallery", "cta", "exhibit-cards", "map", "qr", "ticket"],
    pagePresets: ["about", "poster", "map-museum", "exhibits", "heroes", "tickets"]
  },
  {
    id: "shihm-digital-guide",
    name: "Цифровой гид",
    description: "Mobile-first: крупные карточки, маршруты, аудио, быстрые QR.",
    tokens: {
      accent: "#0f766e",
      surface: "#f8faf9",
      ink: "#134e4a",
      fontDisplay: "Georgia, serif",
      fontBody: '"Segoe UI", sans-serif',
      radius: "12px",
      heroStyle: "cards"
    },
    allowedBlocks: ["hero", "text", "image", "video", "audio", "cta", "exhibit-cards", "qr"],
    pagePresets: ["about", "exhibits", "games", "qr", "map-museum"]
  },
  {
    id: "natural-discovery",
    name: "Открытия",
    description: "Энергичная палитра, тематические карточки, семейные маршруты.",
    tokens: {
      accent: "#c45c26",
      surface: "#fff8f0",
      ink: "#2b2118",
      fontDisplay: "Georgia, serif",
      fontBody: '"Segoe UI", sans-serif',
      radius: "8px",
      heroStyle: "cards"
    },
    allowedBlocks: ["hero", "text", "gallery", "event-cards", "cta", "map"],
    pagePresets: ["about", "poster", "news", "games", "map-region"]
  },
  {
    id: "heritage-dark",
    name: "Наследие",
    description: "Тёмная музейная подложка, контрастная типографика, медийные истории.",
    tokens: {
      accent: "#d4a373",
      surface: "#14181b",
      ink: "#f3efe6",
      fontDisplay: "Georgia, serif",
      fontBody: '"Segoe UI", sans-serif',
      radius: "2px",
      heroStyle: "dark"
    },
    allowedBlocks: ["hero", "text", "image", "video", "quote", "gallery", "cta"],
    pagePresets: ["about", "exhibitions", "heroes", "cinema", "articles"]
  },
  {
    id: "history-story",
    name: "История в лицах",
    description: "Светлая композиция, акцент, таймлайн и истории людей.",
    tokens: {
      accent: "#b42318",
      surface: "#faf7f2",
      ink: "#1c1917",
      fontDisplay: "Georgia, serif",
      fontBody: '"Segoe UI", sans-serif',
      radius: "4px",
      heroStyle: "light"
    },
    allowedBlocks: ["hero", "text", "quote", "image", "cta", "exhibit-cards"],
    pagePresets: ["about", "heroes", "articles", "news"]
  },
  {
    id: "science-split",
    name: "Наука и пространство",
    description: "Split-hero, выставки/события, карта и виджеты для экранов.",
    tokens: {
      accent: "#2563eb",
      surface: "#f1f5f9",
      ink: "#0f172a",
      fontDisplay: '"Segoe UI", sans-serif',
      fontBody: '"Segoe UI", sans-serif',
      radius: "0px",
      heroStyle: "split"
    },
    allowedBlocks: ["hero", "text", "columns", "gallery", "map", "event-cards", "cta"],
    pagePresets: ["about", "poster", "map-museum", "games", "cinema"]
  },
  {
    id: "gallery-minimal",
    name: "Галерея",
    description: "Минимализм: изображения произведений, подборки, события.",
    tokens: {
      accent: "#111827",
      surface: "#ffffff",
      ink: "#111827",
      fontDisplay: '"Segoe UI", sans-serif',
      fontBody: '"Segoe UI", sans-serif',
      radius: "0px",
      heroStyle: "light"
    },
    allowedBlocks: ["hero", "image", "gallery", "text", "exhibit-cards", "event-cards"],
    pagePresets: ["about", "exhibits", "poster", "articles"]
  }
];

export function applyTemplateToDocument(preset: TemplatePreset) {
  const root = document.documentElement;
  root.style.setProperty("--accent", preset.tokens.accent);
  root.style.setProperty("--surface", preset.tokens.surface);
  root.style.setProperty("--ink", preset.tokens.ink);
  root.style.setProperty("--radius", preset.tokens.radius);
  root.dataset.template = preset.id;
  root.dataset.heroStyle = preset.tokens.heroStyle;
}
