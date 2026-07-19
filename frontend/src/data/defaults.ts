import type {
  CmsMaterial,
  CmsPage,
  CmsSection,
  HomeScreenConfig,
  NavigationConfig,
  WelcomeScreenConfig
} from "../types";

const defaultLayout = {
  header: { x: 8, y: 8, width: 84, scale: 1 },
  content: { x: 8, y: 28, width: 70, scale: 1 },
  button: { x: 8, y: 68, width: 40, scale: 1 },
  footer: { x: 8, y: 88, width: 84, scale: 1 }
};

export const catalogDefaults = {
  "cms-welcome-v1": {
    institutionName: "Museum CMS",
    location: "Ваш город",
    kicker: "Цифровой гид",
    title: "Добро пожаловать",
    titleAccent: "в музей",
    lead: "Коснитесь экрана, чтобы начать.",
    backgroundImage: "",
    buttonLabel: "Начать",
    buttonHint: "Открыть меню",
    footerLeft: "Museum CMS Platform",
    footerRight: "",
    layout: defaultLayout,
    images: []
  } satisfies WelcomeScreenConfig,
  "cms-home-v1": {
    pageTitle: "Главное меню",
    pageSubtitle: "Выберите раздел",
    heroBadge: "Музей",
    heroHall: "Входная зона",
    heroTitle: "Исследуйте коллекции",
    heroDescription: "Разделы и страницы управляются из админ-панели.",
    heroImage: "",
    heroPrimaryCta: { label: "Разделы", route: "/museum" },
    heroSecondaryCta: { label: "О музее", route: "/page/about" },
    tiles: []
  } satisfies HomeScreenConfig,
  "cms-navigation-v1": {
    items: [
      { id: "home", label: "Главная", route: "/museum", published: true },
      { id: "about", label: "О музее", route: "/page/about", published: true }
    ]
  } satisfies NavigationConfig,
  "cms-sections-v1": [] as CmsSection[],
  "cms-pages-v1": [] as CmsPage[],
  "cms-materials-v1": [] as CmsMaterial[]
};
