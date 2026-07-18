export type DeviceType = "touch-panel" | "tv-panel" | "projector" | "tablet";
export type Rotation = 0 | 90 | 180 | 270;

export interface MuseumTheme {
  accent: string;
  surface: string;
  ink: string;
}

export interface MuseumState {
  museum: {
    name: string;
    tagline: string;
    theme: MuseumTheme;
  };
  navigation: Array<{ id: string; label: string; route: string }>;
  exhibitions: Array<{
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

