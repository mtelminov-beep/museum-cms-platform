/** Каноническая структура публичного сайта музея (RU). */

export interface SiteSectionDef {
  id: string;
  label: string;
  route: string;
  folder: string;
  description: string;
  children?: Array<{ id: string; label: string; route: string }>;
}

export const SITE_SECTIONS: SiteSectionDef[] = [
  {
    id: "about",
    label: "О музее",
    route: "/page/about",
    folder: "about",
    description: "История, миссия, команда, контакты"
  },
  {
    id: "poster",
    label: "Афиша",
    route: "/poster",
    folder: "poster",
    description: "Текущие, анонсы и архив выставок",
    children: [
      { id: "poster-current", label: "Текущие", route: "/poster/current" },
      { id: "poster-announce", label: "Анонсы", route: "/poster/announce" },
      { id: "poster-archive", label: "Архив выставок", route: "/poster/archive" }
    ]
  },
  {
    id: "map-region",
    label: "Интерактивная карта региона",
    route: "/page/map-region",
    folder: "maps",
    description: "Карта региона и точки интереса"
  },
  {
    id: "map-museum",
    label: "Интерактивная карта музея",
    route: "/page/map-museum",
    folder: "maps",
    description: "План залов и навигация по зданию"
  },
  {
    id: "games",
    label: "Игры (квизы)",
    route: "/page/games",
    folder: "games",
    description: "Интерактивные квизы и игры"
  },
  {
    id: "exhibits",
    label: "Экспонаты",
    route: "/exhibits",
    folder: "exhibits",
    description: "Каталог экспонатов"
  },
  {
    id: "news",
    label: "Новости",
    route: "/page/news",
    folder: "news",
    description: "Новости музея"
  },
  {
    id: "articles",
    label: "Статьи",
    route: "/page/articles",
    folder: "articles",
    description: "Банк статей и материалов"
  },
  {
    id: "heroes",
    label: "Герои региона",
    route: "/page/heroes",
    folder: "heroes",
    description: "«Мы гордимся» — истории людей"
  },
  {
    id: "qr",
    label: "QR-сканер",
    route: "/qr",
    folder: "uploads",
    description: "Сканирование QR и переход к контенту"
  },
  {
    id: "tickets",
    label: "Покупка билета онлайн",
    route: "/page/tickets",
    folder: "tickets",
    description: "Билеты, в т.ч. Пушкинская карта"
  },
  {
    id: "cinema",
    label: "Киносалон",
    route: "/page/cinema",
    folder: "cinema",
    description: "Видеотека и показы"
  }
];

export function navFromSiteStructure() {
  return SITE_SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    route: section.route,
    published: true
  }));
}

export function pagesFromSiteStructure() {
  return SITE_SECTIONS.filter((s) => s.route.startsWith("/page/")).map((section) => ({
    id: section.id,
    slug: section.id,
    title: section.label,
    summary: section.description,
    status: "published" as const,
    sectionFolder: section.folder,
    materials: [] as Array<{ id: string; title: string; url: string; kind: string }>,
    blocks: [
      {
        id: `hero-${section.id}`,
        type: "hero" as const,
        title: section.label,
        text: `<p>${section.description}</p>`,
        src: "",
        caption: ""
      },
      {
        id: `text-${section.id}`,
        type: "text" as const,
        title: "Содержание",
        text: "<p>Добавьте блоки и материалы в визуальном редакторе (вкладка «Страницы»).</p>",
        src: "",
        caption: ""
      }
    ],
    subsections:
      section.id === "poster"
        ? [
            {
              id: "poster-current",
              title: "Текущие выставки",
              summary: "Идут сейчас",
              enabled: true,
              image: "",
              blocks: []
            },
            {
              id: "poster-announce",
              title: "Анонсы",
              summary: "Скоро откроются",
              enabled: true,
              image: "",
              blocks: []
            },
            {
              id: "poster-archive",
              title: "Архив выставок",
              summary: "Прошедшие проекты",
              enabled: true,
              image: "",
              blocks: []
            }
          ]
        : []
  }));
}
