import { readState, writeState } from "./store.js";

export const ENTITY_COLLECTIONS = [
  "branches",
  "halls",
  "exhibitions",
  "exhibits",
  "persons",
  "events",
  "articles",
  "routes",
  "mediaAssets",
  "qrCodes",
  "devices",
  "playlists",
  "scenes",
  "assignments"
];

function iso() {
  return new Date().toISOString();
}

function ensureCollections(state) {
  const entities = { ...(state.entities || {}) };
  for (const key of ENTITY_COLLECTIONS) {
    if (!Array.isArray(entities[key])) entities[key] = [];
  }
  // playlists also exist at top-level historically — keep both in sync for devices MVP
  if (!Array.isArray(state.playlists)) state.playlists = entities.playlists || [];
  return { ...state, entities };
}

export async function listEntities(collection, { status, q, tenantId } = {}) {
  const state = ensureCollections(await readState());
  let items = state.entities[collection] || [];
  if (tenantId) items = items.filter((item) => !item.tenantId || item.tenantId === tenantId);
  if (status) items = items.filter((item) => item.status === status);
  if (q) {
    const needle = String(q).toLowerCase();
    items = items.filter((item) => JSON.stringify(item).toLowerCase().includes(needle));
  }
  return items;
}

export async function getEntity(collection, id) {
  const items = await listEntities(collection);
  return items.find((item) => item.id === id) || null;
}

export async function createEntity(collection, payload, { tenantId, actor } = {}) {
  const state = ensureCollections(await readState());
  const now = iso();
  const item = {
    ...payload,
    id: payload.id || `${collection.slice(0, 3)}-${Date.now().toString(36)}`,
    tenantId: payload.tenantId || tenantId || state.tenant?.id || "default",
    status: payload.status || "draft",
    createdAt: now,
    updatedAt: now,
    createdBy: actor || null
  };
  state.entities[collection] = [...(state.entities[collection] || []), item];
  if (collection === "playlists") state.playlists = state.entities.playlists;
  await writeState(state);
  return item;
}

export async function updateEntity(collection, id, patch, { actor } = {}) {
  const state = ensureCollections(await readState());
  const list = state.entities[collection] || [];
  const index = list.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const next = {
    ...list[index],
    ...patch,
    id,
    updatedAt: iso(),
    updatedBy: actor || list[index].updatedBy || null
  };
  list[index] = next;
  state.entities[collection] = list;
  if (collection === "playlists") state.playlists = list;
  await writeState(state);
  return next;
}

export async function deleteEntity(collection, id, { soft = true } = {}) {
  const state = ensureCollections(await readState());
  const list = state.entities[collection] || [];
  const index = list.findIndex((item) => item.id === id);
  if (index < 0) return null;
  if (soft) {
    list[index] = { ...list[index], status: "archived", updatedAt: iso() };
    state.entities[collection] = list;
  } else {
    state.entities[collection] = list.filter((item) => item.id !== id);
  }
  if (collection === "playlists") state.playlists = state.entities.playlists;
  await writeState(state);
  return true;
}

export async function appendAudit(entry) {
  const state = await readState();
  const auditLog = Array.isArray(state.auditLog) ? state.auditLog : [];
  auditLog.unshift({
    id: `audit-${Date.now().toString(36)}`,
    at: iso(),
    ...entry
  });
  await writeState({ ...state, auditLog: auditLog.slice(0, 2000) });
}

export async function savePageRevision(pageId, snapshot, { actor, note } = {}) {
  const state = await readState();
  const pageRevisions = { ...(state.pageRevisions || {}) };
  const list = Array.isArray(pageRevisions[pageId]) ? pageRevisions[pageId] : [];
  const revision = {
    id: `rev-${Date.now().toString(36)}`,
    pageId,
    at: iso(),
    actor: actor || null,
    note: note || "",
    snapshot
  };
  pageRevisions[pageId] = [revision, ...list].slice(0, 50);
  await writeState({ ...state, pageRevisions });
  return revision;
}

export async function listPageRevisions(pageId) {
  const state = await readState();
  return (state.pageRevisions && state.pageRevisions[pageId]) || [];
}
