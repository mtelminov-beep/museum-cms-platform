import type { MuseumState } from "./types";

export async function fetchCmsState(): Promise<MuseumState> {
  const response = await fetch("/api/cms/state");
  if (!response.ok) throw new Error("Failed to load CMS state");
  return response.json();
}

export async function patchCmsState(patch: Partial<MuseumState>): Promise<MuseumState> {
  const response = await fetch("/api/cms/state", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });
  if (!response.ok) throw new Error("Failed to save CMS state");
  return response.json();
}

