import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CMS_CATALOG_KEYS } from "./catalogKeys.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../data");
const SEED_PATH = path.join(DATA_DIR, "cms-state.seed.json");
const STATE_PATH = path.join(DATA_DIR, "runtime-state.json");

async function loadSeed() {
  const raw = await fs.readFile(SEED_PATH, "utf8");
  return JSON.parse(raw);
}

function normalizeState(state, seed) {
  const next = {
    ...seed,
    ...state,
    museum: { ...seed.museum, ...(state.museum || {}) },
    settings: { ...seed.settings, ...(state.settings || {}) },
    kioskCatalogs: { ...(seed.kioskCatalogs || {}), ...(state.kioskCatalogs || {}) },
    screens: Array.isArray(state.screens) ? state.screens : seed.screens,
    playlists: Array.isArray(state.playlists) ? state.playlists : seed.playlists
  };

  for (const key of CMS_CATALOG_KEYS) {
    if (!next.kioskCatalogs[key] && seed.kioskCatalogs?.[key]) {
      next.kioskCatalogs[key] = seed.kioskCatalogs[key];
    }
  }

  return next;
}

async function ensureStateFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STATE_PATH);
  } catch {
    const seed = await fs.readFile(SEED_PATH, "utf8");
    await fs.writeFile(STATE_PATH, seed);
  }
}

export async function readState() {
  await ensureStateFile();
  const seed = await loadSeed();
  const raw = await fs.readFile(STATE_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return normalizeState(parsed, seed);
}

export async function writeState(nextState) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const seed = await loadSeed();
  const normalized = normalizeState(nextState, seed);
  await fs.writeFile(STATE_PATH, `${JSON.stringify(normalized, null, 2)}\n`);
  return normalized;
}

export async function patchState(patch) {
  const current = await readState();
  return writeState({
    ...current,
    ...patch,
    updatedAt: new Date().toISOString()
  });
}

export async function getCatalog(key) {
  const state = await readState();
  const entry = state.kioskCatalogs?.[key];
  if (!entry) {
    return { key, payload: null, updatedAt: null };
  }
  return {
    key,
    payload: entry.payload ?? null,
    updatedAt: entry.updatedAt || entry.updated_at || null
  };
}

export async function putCatalog(key, payload) {
  const state = await readState();
  const updatedAt = new Date().toISOString();
  const kioskCatalogs = {
    ...(state.kioskCatalogs || {}),
    [key]: { payload, updatedAt }
  };
  await writeState({ ...state, kioskCatalogs, updatedAt });
  return { key, updatedAt };
}

export async function listCatalogs() {
  const state = await readState();
  const catalogs = state.kioskCatalogs || {};
  return CMS_CATALOG_KEYS.map((key) => {
    const entry = catalogs[key];
    return {
      key,
      updatedAt: entry?.updatedAt || entry?.updated_at || null,
      bytes: entry ? JSON.stringify(entry.payload ?? null).length : 0
    };
  });
}
