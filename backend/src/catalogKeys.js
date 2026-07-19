export const CMS_CATALOG_KEYS = [
  "cms-welcome-v1",
  "cms-home-v1",
  "cms-navigation-v1",
  "cms-sections-v1",
  "cms-pages-v1",
  "cms-materials-v1"
];

export function isCmsCatalogKey(value) {
  return CMS_CATALOG_KEYS.includes(value);
}
