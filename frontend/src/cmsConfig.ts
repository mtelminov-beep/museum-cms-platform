import type { CmsCatalogKey } from "./types";

export const ADMIN_ROUTE = "/admin";
export const ADMIN_SESSION_KEY = "museum-cms-admin-session-v1";
export const CMS_TOKEN_KEY = "museum-cms-token";

export const CMS_CATALOG_KEYS = [
  "cms-welcome-v1",
  "cms-home-v1",
  "cms-navigation-v1",
  "cms-sections-v1",
  "cms-pages-v1",
  "cms-materials-v1"
] as const satisfies readonly CmsCatalogKey[];

export const sectionLabels: Record<CmsCatalogKey, string> = {
  "cms-welcome-v1": "Стартовый экран",
  "cms-home-v1": "Главное меню",
  "cms-navigation-v1": "Навигация",
  "cms-sections-v1": "Разделы",
  "cms-pages-v1": "Страницы",
  "cms-materials-v1": "Материалы"
};

export function isCmsCatalogKey(value: string): value is CmsCatalogKey {
  return (CMS_CATALOG_KEYS as readonly string[]).includes(value);
}
