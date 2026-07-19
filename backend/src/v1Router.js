import { Router } from "express";
import {
  ENTITY_COLLECTIONS,
  appendAudit,
  createEntity,
  deleteEntity,
  getEntity,
  listEntities,
  listPageRevisions,
  savePageRevision,
  updateEntity
} from "./entities.js";
import { cmsGate, getCmsToken } from "./cmsSecurity.js";
import { permissionsForRole, roleCan } from "./rbac.js";
import { getCatalog, putCatalog, readState, writeState } from "./store.js";
import { isCmsCatalogKey } from "./catalogKeys.js";

function actorFromReq(req) {
  return req.get("X-CMS-Actor") || req.cmsUser || "admin";
}

function attachRole(req, _res, next) {
  req.cmsRole = req.get("X-CMS-Role") || "admin";
  req.cmsUser = actorFromReq(req);
  next();
}

function requirePerm(permission) {
  return (req, res, next) => {
    if (!roleCan(req.cmsRole || "admin", permission)) {
      res.status(403).json({ error: "Forbidden", permission });
      return;
    }
    next();
  };
}

export function createV1Router() {
  const router = Router();
  router.use(attachRole);

  router.get("/health", (_req, res) => {
    res.json({ ok: true, api: "v1", time: new Date().toISOString() });
  });

  router.get("/me", cmsGate, (req, res) => {
    const role = req.cmsRole || "admin";
    res.json({
      user: req.cmsUser,
      role,
      permissions: permissionsForRole(role),
      tokenHint: getCmsToken() ? "configured" : "default"
    });
  });

  router.get("/tenant", async (_req, res, next) => {
    try {
      const state = await readState();
      res.json({ tenant: state.tenant, museum: state.museum, settings: state.settings });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/tenant", cmsGate, requirePerm("tenant.settings"), async (req, res, next) => {
    try {
      const state = await readState();
      const nextState = {
        ...state,
        tenant: { ...state.tenant, ...(req.body.tenant || {}) },
        museum: { ...state.museum, ...(req.body.museum || {}) },
        settings: { ...state.settings, ...(req.body.settings || {}) },
        updatedAt: new Date().toISOString()
      };
      await writeState(nextState);
      await appendAudit({
        action: "tenant.update",
        actor: actorFromReq(req),
        entity: "tenant",
        after: { tenant: nextState.tenant }
      });
      res.json({ tenant: nextState.tenant, museum: nextState.museum, settings: nextState.settings });
    } catch (error) {
      next(error);
    }
  });

  router.get("/entities/:collection", async (req, res, next) => {
    try {
      const { collection } = req.params;
      if (!ENTITY_COLLECTIONS.includes(collection)) {
        res.status(404).json({ error: "Unknown collection" });
        return;
      }
      const state = await readState();
      const items = await listEntities(collection, {
        status: req.query.status,
        q: req.query.q,
        tenantId: state.tenant?.id
      });
      // public: only published unless authenticated write token present
      const token = req.get("X-CMS-Token");
      const authed = Boolean(token);
      const visible = authed ? items : items.filter((item) => item.status === "published");
      res.json({ collection, items: visible });
    } catch (error) {
      next(error);
    }
  });

  router.get("/entities/:collection/:id", async (req, res, next) => {
    try {
      const item = await getEntity(req.params.collection, req.params.id);
      if (!item) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const token = req.get("X-CMS-Token");
      if (!token && item.status !== "published") {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json({ item });
    } catch (error) {
      next(error);
    }
  });

  router.post("/entities/:collection", cmsGate, requirePerm("content.write"), async (req, res, next) => {
    try {
      const { collection } = req.params;
      if (!ENTITY_COLLECTIONS.includes(collection)) {
        res.status(404).json({ error: "Unknown collection" });
        return;
      }
      const state = await readState();
      const item = await createEntity(collection, req.body || {}, {
        tenantId: state.tenant?.id,
        actor: actorFromReq(req)
      });
      await appendAudit({
        action: "entity.create",
        actor: actorFromReq(req),
        entity: collection,
        entityId: item.id,
        after: item
      });
      res.status(201).json({ item });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/entities/:collection/:id", cmsGate, requirePerm("content.write"), async (req, res, next) => {
    try {
      const before = await getEntity(req.params.collection, req.params.id);
      const item = await updateEntity(req.params.collection, req.params.id, req.body || {}, {
        actor: actorFromReq(req)
      });
      if (!item) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      await appendAudit({
        action: "entity.update",
        actor: actorFromReq(req),
        entity: req.params.collection,
        entityId: item.id,
        before,
        after: item
      });
      res.json({ item });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/entities/:collection/:id", cmsGate, requirePerm("content.write"), async (req, res, next) => {
    try {
      const ok = await deleteEntity(req.params.collection, req.params.id, { soft: req.query.hard !== "1" });
      if (!ok) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      await appendAudit({
        action: "entity.delete",
        actor: actorFromReq(req),
        entity: req.params.collection,
        entityId: req.params.id
      });
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/pages/:pageId/revisions",
    cmsGate,
    requirePerm("content.publish"),
    async (req, res, next) => {
      try {
        const pageId = req.params.pageId;
        const snapshot = req.body?.snapshot;
        if (!snapshot) {
          res.status(400).json({ error: "snapshot required" });
          return;
        }
        const revision = await savePageRevision(pageId, snapshot, {
          actor: actorFromReq(req),
          note: req.body?.note
        });
        res.status(201).json({ revision });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/pages/:pageId/revisions", cmsGate, requirePerm("content.read"), async (req, res, next) => {
    try {
      res.json({ items: await listPageRevisions(req.params.pageId) });
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/pages/:pageId/publish",
    cmsGate,
    requirePerm("content.publish"),
    async (req, res, next) => {
      try {
        const pageId = req.params.pageId;
        const catalog = await getCatalog("cms-pages-v1");
        const pages = Array.isArray(catalog.payload) ? catalog.payload : [];
        const index = pages.findIndex((p) => p.id === pageId || p.slug === pageId);
        if (index < 0) {
          res.status(404).json({ error: "Page not found in cms-pages-v1" });
          return;
        }
        const published = {
          ...pages[index],
          ...(req.body?.page || {}),
          status: "published",
          publishedAt: new Date().toISOString()
        };
        const nextPages = pages.map((p, i) => (i === index ? published : p));
        await savePageRevision(published.id, published, {
          actor: actorFromReq(req),
          note: "publish"
        });
        const result = await putCatalog("cms-pages-v1", nextPages);
        await appendAudit({
          action: "page.publish",
          actor: actorFromReq(req),
          entity: "page",
          entityId: published.id
        });
        res.json({ page: published, catalog: result });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/audit", cmsGate, requirePerm("analytics.read"), async (_req, res, next) => {
    try {
      const state = await readState();
      res.json({ items: state.auditLog || [] });
    } catch (error) {
      next(error);
    }
  });

  // Device protocol (MVP JSON)
  router.post("/devices/register", async (req, res, next) => {
    try {
      const code = String(req.body?.code || "").trim().toUpperCase();
      const state = await readState();
      const devices = state.entities?.devices || [];
      const device = devices.find((d) => String(d.pairingCode || "").toUpperCase() === code && d.status !== "archived");
      if (!device) {
        res.status(404).json({ error: "Invalid pairing code" });
        return;
      }
      const token = `dev_${device.id}_${Date.now().toString(36)}`;
      const updated = await updateEntity("devices", device.id, {
        deviceToken: token,
        pairedAt: new Date().toISOString(),
        online: true,
        lastHeartbeatAt: new Date().toISOString()
      });
      res.json({ device: updated, token });
    } catch (error) {
      next(error);
    }
  });

  router.post("/devices/:id/heartbeat", async (req, res, next) => {
    try {
      const device = await getEntity("devices", req.params.id);
      if (!device) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const token = req.get("X-Device-Token");
      if (device.deviceToken && token !== device.deviceToken) {
        res.status(401).json({ error: "Invalid device token" });
        return;
      }
      const updated = await updateEntity("devices", device.id, {
        online: true,
        lastHeartbeatAt: new Date().toISOString(),
        playerVersion: req.body?.playerVersion || device.playerVersion,
        contentVersion: req.body?.contentVersion || device.contentVersion,
        lastError: req.body?.lastError || null,
        resolution: req.body?.resolution || device.resolution
      });
      res.json({ ok: true, device: updated });
    } catch (error) {
      next(error);
    }
  });

  router.get("/devices/:id/manifest", async (req, res, next) => {
    try {
      const device = await getEntity("devices", req.params.id);
      if (!device) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const state = await readState();
      const assignments = (state.entities?.assignments || []).filter(
        (a) => a.deviceId === device.id && a.status !== "archived"
      );
      const playlistId = assignments[0]?.playlistId || device.playlistId;
      const playlist =
        (state.entities?.playlists || state.playlists || []).find((p) => p.id === playlistId) || null;
      const version = device.contentVersion || state.updatedAt || new Date().toISOString();
      res.json({
        deviceId: device.id,
        version,
        playlist,
        route: device.route || `/display/${device.id}`,
        assets: []
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/catalogs/:key", async (req, res, next) => {
    try {
      if (!isCmsCatalogKey(req.params.key)) {
        res.status(404).json({ error: "Unknown catalog" });
        return;
      }
      res.json(await getCatalog(req.params.key));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
