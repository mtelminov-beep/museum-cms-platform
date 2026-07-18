import type { DeviceType, Rotation } from "../types";

export interface DeviceProfile {
  id: string;
  label: string;
  type: DeviceType;
  width: number;
  height: number;
  defaultRotation: Rotation;
  density: "touch" | "distant" | "presentation";
}

export const deviceProfiles: DeviceProfile[] = [
  { id: "touch-55-landscape", label: "Touch 55 landscape", type: "touch-panel", width: 3840, height: 2160, defaultRotation: 0, density: "touch" },
  { id: "touch-65-portrait", label: "Touch 65 portrait", type: "touch-panel", width: 2160, height: 3840, defaultRotation: 90, density: "touch" },
  { id: "tv-16x9", label: "TV panel 16:9", type: "tv-panel", width: 3840, height: 2160, defaultRotation: 0, density: "distant" },
  { id: "projection-16x9", label: "Projector 16:9", type: "projector", width: 1920, height: 1080, defaultRotation: 0, density: "presentation" },
  { id: "tablet-guide", label: "Tablet guide", type: "tablet", width: 1366, height: 1024, defaultRotation: 0, density: "touch" }
];

