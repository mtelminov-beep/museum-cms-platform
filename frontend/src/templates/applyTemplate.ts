import { broadcastCatalogUpdate, fetchCatalog, fetchCmsState, patchCmsState, putCatalog } from "../api";
import { catalogDefaults } from "../data/defaults";
import { navFromSiteStructure, pagesFromSiteStructure, SITE_SECTIONS } from "../site/structure";
import type { CmsPage, HomeScreenConfig, NavigationConfig, WelcomeScreenConfig } from "../types";
import { applyTemplateToDocument, type TemplatePreset } from "./presets";

function pageHasRealContent(page: CmsPage | undefined): boolean {
  if (!page) return false;
  const blocks = page.blocks || [];
  if (blocks.some((b) => (b.src && b.src.trim()) || (b.text && !b.text.includes("Добавьте блоки")))) {
    return true;
  }
  if ((page.materials || []).length > 0) return true;
  if ((page.subsections || []).some((s) => (s.blocks || []).length > 0 || Boolean(s.image))) return true;
  return false;
}

/** Меню — только канонические разделы сайта. */
export function buildTemplateNavigation(): NavigationConfig {
  return {
    items: [{ id: "home", label: "Главная", route: "/museum", published: true }, ...navFromSiteStructure()]
  };
}

export function mergeTemplatePages(existing: CmsPage[] | null | undefined): CmsPage[] {
  const skeletons = pagesFromSiteStructure() as CmsPage[];
  const byId = new Map((existing || []).map((p) => [p.id, p]));
  const merged: CmsPage[] = skeletons.map((skeleton) => {
    const prev = byId.get(skeleton.id);
    if (!prev) return skeleton;
    if (pageHasRealContent(prev)) {
      return {
        ...skeleton,
        ...prev,
        title: prev.title || skeleton.title,
        summary: prev.summary || skeleton.summary,
        sectionFolder: prev.sectionFolder || skeleton.sectionFolder,
        status: prev.status || skeleton.status,
        subsections: prev.subsections?.length ? prev.subsections : skeleton.subsections
      };
    }
    return skeleton;
  });
  const skeletonIds = new Set(skeletons.map((p) => p.id));
  for (const page of existing || []) {
    if (!skeletonIds.has(page.id)) merged.push(page);
  }
  return merged;
}

export function buildTemplateHome(preset: TemplatePreset, existing?: HomeScreenConfig | null): HomeScreenConfig {
  const base = catalogDefaults["cms-home-v1"];
  const sectionById = new Map(SITE_SECTIONS.map((s) => [s.id, s]));
  const featured = preset.featuredSections
    .map((id) => sectionById.get(id))
    .filter((s): s is (typeof SITE_SECTIONS)[number] => Boolean(s));
  const rest = SITE_SECTIONS.filter((s) => !preset.featuredSections.includes(s.id));
  const ordered = [...featured, ...rest];
  const prevTiles = new Map((existing?.tiles || []).map((t) => [t.route, t]));

  return {
    ...base,
    ...existing,
    pageTitle: existing?.pageTitle || base.pageTitle,
    pageSubtitle: existing?.pageSubtitle || base.pageSubtitle,
    heroBadge: existing?.heroBadge || preset.name,
    heroHall: existing?.heroHall || base.heroHall,
    heroTitle: existing?.heroTitle || base.heroTitle,
    heroDescription: existing?.heroDescription || base.heroDescription,
    heroImage: existing?.heroImage || "",
    heroPrimaryCta: existing?.heroPrimaryCta || { label: "Афиша", route: "/poster" },
    heroSecondaryCta: existing?.heroSecondaryCta || { label: "О музее", route: "/page/about" },
    tiles: ordered.map((section) => {
      const prev = prevTiles.get(section.route);
      return {
        id: prev?.id || `tile-${section.id}`,
        title: prev?.title || section.label,
        subtitle: prev?.subtitle || section.description,
        image: prev?.image || "",
        route: section.route,
        published: prev?.published ?? true
      };
    })
  };
}

export function buildTemplateWelcome(
  preset: TemplatePreset,
  existing?: WelcomeScreenConfig | null
): WelcomeScreenConfig {
  const base = catalogDefaults["cms-welcome-v1"];
  return {
    ...base,
    ...existing,
    kicker: existing?.kicker || preset.name,
    title: existing?.title || base.title,
    titleAccent: existing?.titleAccent || base.titleAccent,
    lead: existing?.lead || base.lead,
    institutionName: existing?.institutionName || base.institutionName
  };
}

export async function applyTemplateFully(preset: TemplatePreset) {
  applyTemplateToDocument(preset);
  localStorage.setItem("museum-cms-template", preset.id);

  const [pagesEntry, homeEntry, welcomeEntry, state] = await Promise.all([
    fetchCatalog<CmsPage[]>("cms-pages-v1"),
    fetchCatalog<HomeScreenConfig>("cms-home-v1"),
    fetchCatalog<WelcomeScreenConfig>("cms-welcome-v1"),
    fetchCmsState()
  ]);

  const navigation = buildTemplateNavigation();
  const pages = mergeTemplatePages(pagesEntry.payload);
  const home = buildTemplateHome(preset, homeEntry.payload);
  const welcome = buildTemplateWelcome(preset, welcomeEntry.payload);

  await putCatalog("cms-navigation-v1", navigation);
  await putCatalog("cms-pages-v1", pages);
  await putCatalog("cms-home-v1", home);
  await putCatalog("cms-welcome-v1", welcome);

  await patchCmsState({
    museum: {
      ...state.museum,
      theme: {
        accent: preset.tokens.accent,
        surface: preset.tokens.surface,
        ink: preset.tokens.ink,
        panel: preset.tokens.panel,
        muted: preset.tokens.muted,
        gold: preset.tokens.gold,
        fontDisplay: preset.tokens.fontDisplay,
        fontBody: preset.tokens.fontBody,
        radius: preset.tokens.radius,
        heroStyle: preset.tokens.heroStyle,
        menuStyle: preset.tokens.menuStyle,
        tileStyle: preset.tokens.tileStyle
      }
    },
    settings: {
      ...state.settings,
      activeTemplateId: preset.id
    }
  });

  broadcastCatalogUpdate();
  return { navigation, pages, home, welcome };
}
