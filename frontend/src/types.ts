export type DeviceType = "touch-panel" | "tv-panel" | "projector" | "tablet";
export type Rotation = 0 | 90 | 180 | 270;
export type ContentStatus = "draft" | "published" | "archived";
export type ContentBlockType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "hero"
  | "heading"
  | "quote"
  | "divider"
  | "gallery"
  | "cta"
  | "columns"
  | "exhibit-cards"
  | "event-cards"
  | "map"
  | "ticket"
  | "qr";

export type CmsCatalogKey =
  | "cms-welcome-v1"
  | "cms-home-v1"
  | "cms-navigation-v1"
  | "cms-sections-v1"
  | "cms-pages-v1"
  | "cms-materials-v1";

export interface MuseumTheme {
  accent: string;
  surface: string;
  ink: string;
  panel?: string;
  muted?: string;
  gold?: string;
  fontDisplay?: string;
  fontBody?: string;
  radius?: string;
  heroStyle?: string;
  menuStyle?: string;
  tileStyle?: string;
}

export interface LayoutBox {
  x: number;
  y: number;
  width: number;
  scale: number;
}

export interface WelcomeImageElement extends LayoutBox {
  id: string;
  type: "image";
  src: string;
}

export interface WelcomeScreenConfig {
  institutionName: string;
  location: string;
  kicker: string;
  title: string;
  titleAccent: string;
  lead: string;
  backgroundImage: string;
  buttonLabel: string;
  buttonHint: string;
  footerLeft: string;
  footerRight: string;
  layout: {
    header: LayoutBox;
    content: LayoutBox;
    button: LayoutBox;
    footer: LayoutBox;
  };
  images?: WelcomeImageElement[];
}

export interface HomeTile {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  route: string;
  published: boolean;
}

export interface HomeScreenConfig {
  pageTitle: string;
  pageSubtitle?: string;
  heroBadge: string;
  heroHall: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  heroPrimaryCta: { label: string; route: string };
  heroSecondaryCta: { label: string; route: string };
  tiles: HomeTile[];
}

export interface NavItem {
  id: string;
  label: string;
  route: string;
  published: boolean;
}

export interface NavigationConfig {
  items: NavItem[];
}

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  title?: string;
  text?: string;
  src?: string;
  caption?: string;
  /** Доп. URL для галереи / колонок */
  items?: string[];
  href?: string;
  buttonLabel?: string;
  paddingY?: number;
  align?: "left" | "center" | "right";
}

export interface PageMaterial {
  id: string;
  title: string;
  url: string;
  kind: "image" | "video" | "audio" | "pdf" | "other";
  caption?: string;
}

export interface PageSubsection {
  id: string;
  title: string;
  summary?: string;
  image?: string;
  enabled: boolean;
  blocks: ContentBlock[];
}

export interface CmsSection {
  id: string;
  title: string;
  summary?: string;
  image?: string;
  status: ContentStatus;
  pageIds: string[];
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  status: ContentStatus;
  sectionFolder?: string;
  blocks: ContentBlock[];
  materials?: PageMaterial[];
  subsections?: PageSubsection[];
}

export interface TemplateSelection {
  activeTemplateId: string;
  updatedAt?: string;
}

export interface CmsMaterial {
  id: string;
  title: string;
  annotation?: string;
  status: ContentStatus;
  category?: string;
  fileUrl?: string;
  coverImage?: string;
}

export interface CatalogEntry<T = unknown> {
  key: string;
  payload: T | null;
  updatedAt: string | null;
}

export interface MuseumState {
  museum: {
    name: string;
    tagline: string;
    theme: MuseumTheme;
  };
  settings?: {
    defaultLocale?: string;
    kioskMode?: boolean;
    activeTemplateId?: string;
  };
  kioskCatalogs?: Record<string, { payload: unknown; updatedAt?: string; updated_at?: string }>;
  navigation?: Array<{ id: string; label: string; route: string }>;
  exhibitions?: Array<{
    id: string;
    title: string;
    summary: string;
    status: "draft" | "published";
    zones: string[];
  }>;
  screens: DisplayScreen[];
  playlists: Playlist[];
  updatedAt?: string;
}

export interface DisplayScreen {
  id: string;
  name: string;
  deviceType: DeviceType;
  profile: string;
  route: string;
  rotation: Rotation;
  kiosk: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  targetScreens: string[];
  items: Array<{
    type: "headline" | "exhibition-card" | "media";
    title?: string;
    exhibitionId?: string;
    duration: number;
  }>;
}
