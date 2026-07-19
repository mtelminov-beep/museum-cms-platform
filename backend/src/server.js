import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleAdminLogin } from "./auth.js";
import { CMS_CATALOG_KEYS, isCmsCatalogKey } from "./catalogKeys.js";
import { cmsGate } from "./cmsSecurity.js";
import { createEntity } from "./entities.js";
import {
  MEDIA_FOLDERS,
  MEDIA_ROOT,
  ensureMediaRoot,
  listMediaFolder,
  normalizeFolder,
  saveUploadedMedia
} from "./mediaUpload.js";
import {
  getCatalog,
  listCatalogs,
  patchState,
  putCatalog,
  readState,
  writeState
} from "./store.js";
import { createV1Router } from "./v1Router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const FRONTEND_DIST = path.join(PROJECT_ROOT, "frontend", "dist");
const UPLOADS_DIR = path.join(PROJECT_ROOT, "backend", "data", "uploads");

const app = express();
const PORT = Number(process.env.PORT || 8787);

ensureMediaRoot();
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({
  dest: path.join(os.tmpdir(), "museum-cms-uploads"),
  limits: { fileSize: 64 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/media", express.static(MEDIA_ROOT));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "museum-cms-platform", time: new Date().toISOString() });
});

app.post("/api/auth/admin-login", handleAdminLogin);
app.use("/api/v1", createV1Router());

app.get("/api/cms/state", async (req, res, next) => {
  try {
    res.json(await readState());
  } catch (error) {
    next(error);
  }
});

app.put("/api/cms/state", cmsGate, async (req, res, next) => {
  try {
    res.json(await writeState(req.body));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/cms/state", cmsGate, async (req, res, next) => {
  try {
    res.json(await patchState(req.body));
  } catch (error) {
    next(error);
  }
});

app.get("/api/cms/catalogs", async (req, res, next) => {
  try {
    res.json({ keys: CMS_CATALOG_KEYS, items: await listCatalogs() });
  } catch (error) {
    next(error);
  }
});

app.get("/api/cms/catalogs/:key", async (req, res, next) => {
  try {
    const key = req.params.key;
    if (!isCmsCatalogKey(key)) {
      res.status(404).json({ error: "Unknown catalog key", key });
      return;
    }
    res.json(await getCatalog(key));
  } catch (error) {
    next(error);
  }
});

app.put("/api/cms/catalogs/:key", cmsGate, async (req, res, next) => {
  try {
    const key = req.params.key;
    if (!isCmsCatalogKey(key)) {
      res.status(404).json({ error: "Unknown catalog key", key });
      return;
    }
    const body = req.body && typeof req.body === "object" ? req.body : {};
    if (!("payload" in body)) {
      res.status(400).json({ error: "payload required" });
      return;
    }
    const serialized = JSON.stringify(body.payload);
    if (serialized.length > 4_000_000) {
      res.status(413).json({ error: "Payload too large" });
      return;
    }
    res.json(await putCatalog(key, body.payload));
  } catch (error) {
    next(error);
  }
});

app.get("/api/cms/media/folders", cmsGate, (_req, res) => {
  res.json({ folders: MEDIA_FOLDERS });
});

app.get("/api/cms/media/list", cmsGate, async (req, res, next) => {
  try {
    const folder = normalizeFolder(req.query.folder);
    res.json({ folder, items: await listMediaFolder(folder) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/cms/media", cmsGate, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "file required" });
      return;
    }
    const folder = normalizeFolder(req.body?.folder || req.query.folder || "uploads");
    const saved = await saveUploadedMedia(req.file, folder);
    const state = await readState();
    const asset = await createEntity(
      "mediaAssets",
      {
        title: saved.originalName,
        url: saved.url,
        folder: saved.folder,
        mimeType: saved.mimeType,
        size: saved.size,
        alt: "",
        license: "",
        tags: [saved.folder],
        status: "published"
      },
      { tenantId: state.tenant?.id, actor: req.get("X-CMS-Actor") || "admin" }
    );
    res.status(201).json({
      id: asset.id,
      originalName: saved.originalName,
      size: saved.size,
      mimeType: saved.mimeType,
      url: saved.url,
      folder: saved.folder,
      fileName: saved.fileName,
      asset
    });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(FRONTEND_DIST, { index: false }));
app.get("*", async (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    next();
    return;
  }
  try {
    await fsp.access(path.join(FRONTEND_DIST, "index.html"));
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  } catch {
    res.status(404).json({
      error: "Frontend build not found",
      hint: "Use Vite dev server in development, or run npm run build"
    });
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: error?.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Museum CMS backend listening on :${PORT}`);
});
