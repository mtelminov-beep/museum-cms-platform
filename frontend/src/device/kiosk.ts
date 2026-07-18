import type { Rotation } from "../types";

const KIOSK_STORAGE_KEY = "museum-cms:kiosk-enabled";
const ROTATION_STORAGE_KEY = "museum-cms:display-rotation";

export function getKioskEnabled(): boolean {
  return localStorage.getItem(KIOSK_STORAGE_KEY) === "true";
}

export function setKioskEnabled(enabled: boolean): void {
  localStorage.setItem(KIOSK_STORAGE_KEY, enabled ? "true" : "false");
  document.documentElement.dataset.kiosk = enabled ? "true" : "false";
}

export function getRotation(): Rotation {
  const value = Number(localStorage.getItem(ROTATION_STORAGE_KEY));
  return value === 90 || value === 180 || value === 270 ? value : 0;
}

export function setRotation(rotation: Rotation): void {
  localStorage.setItem(ROTATION_STORAGE_KEY, String(rotation));
  document.documentElement.dataset.rotation = String(rotation);
}

export function applyKioskEnvironment(): void {
  document.documentElement.dataset.kiosk = getKioskEnabled() ? "true" : "false";
  document.documentElement.dataset.rotation = String(getRotation());
}

