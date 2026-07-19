import { CMS_TOKEN_KEY } from "./cmsConfig";
import type { CatalogEntry, CmsCatalogKey, MuseumState } from "./types";

export function getCmsToken(): string {
  return localStorage.getItem(CMS_TOKEN_KEY) || "";
}

export function setCmsToken(token: string) {
  localStorage.setItem(CMS_TOKEN_KEY, token);
}

export function clearCmsToken() {
  localStorage.removeItem(CMS_TOKEN_KEY);
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchCmsState(): Promise<MuseumState> {
  const res = await fetch("/api/cms/state");
  return parseJson<MuseumState>(res);
}

export async function patchCmsState(patch: Partial<MuseumState>): Promise<MuseumState> {
  const res = await fetch("/api/cms/state", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-CMS-Token": getCmsToken()
    },
    body: JSON.stringify(patch)
  });
  return parseJson<MuseumState>(res);
}

export async function adminLogin(login: string, password: string) {
  const res = await fetch("/api/auth/admin-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password })
  });
  return parseJson<{
    ok: boolean;
    token: string;
    admin: { login: string; role?: string; id?: string; displayName?: string };
    permissions?: string[];
  }>(res);
}

export async function fetchCatalog<T = unknown>(key: CmsCatalogKey): Promise<CatalogEntry<T>> {
  const res = await fetch(`/api/cms/catalogs/${key}`);
  return parseJson<CatalogEntry<T>>(res);
}

export async function putCatalog(key: CmsCatalogKey, payload: unknown) {
  const res = await fetch(`/api/cms/catalogs/${key}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CMS-Token": getCmsToken()
    },
    body: JSON.stringify({ payload })
  });
  return parseJson<{ key: string; updatedAt: string }>(res);
}

export async function uploadMedia(file: File) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/cms/media", {
    method: "POST",
    headers: { "X-CMS-Token": getCmsToken() },
    body
  });
  return parseJson<{ id: string; url: string; originalName: string }>(res);
}

export async function probeCmsServer(): Promise<{ ok: boolean; time?: string; error?: string }> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = (await res.json()) as { ok?: boolean; time?: string };
    return { ok: Boolean(data.ok), time: data.time };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "offline" };
  }
}

const NAV_CHANNEL = "museum-cms-navigation-v1";

export function broadcastCatalogUpdate(key?: string) {
  try {
    const channel = new BroadcastChannel(NAV_CHANNEL);
    channel.postMessage({ type: "catalog-updated", key, at: new Date().toISOString() });
    channel.close();
  } catch {
    // BroadcastChannel may be unavailable
  }
  window.dispatchEvent(new CustomEvent("museum-cms-catalog-updated", { detail: { key } }));
}

export function subscribeCatalogUpdates(handler: () => void) {
  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(NAV_CHANNEL);
    channel.onmessage = () => handler();
  } catch {
    channel = null;
  }
  const onCustom = () => handler();
  window.addEventListener("museum-cms-catalog-updated", onCustom);
  return () => {
    window.removeEventListener("museum-cms-catalog-updated", onCustom);
    channel?.close();
  };
}
