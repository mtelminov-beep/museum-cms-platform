import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { patchState, readState, writeState } from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const FRONTEND_DIST = path.join(PROJECT_ROOT, "frontend", "dist");

const app = express();
const upload = multer({ dest: path.join(PROJECT_ROOT, "backend", "data", "uploads") });
const PORT = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "museum-cms-platform", time: new Date().toISOString() });
});

app.get("/api/cms/state", async (req, res, next) => {
  try {
    res.json(await readState());
  } catch (error) {
    next(error);
  }
});

app.put("/api/cms/state", async (req, res, next) => {
  try {
    res.json(await writeState(req.body));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/cms/state", async (req, res, next) => {
  try {
    res.json(await patchState(req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/cms/media", upload.single("file"), async (req, res) => {
  res.status(201).json({
    id: req.file?.filename,
    originalName: req.file?.originalname,
    size: req.file?.size,
    message: "Media received. Connect object storage or a museum media server for production."
  });
});

app.use(express.static(FRONTEND_DIST, { index: false }));
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Museum CMS backend listening on :${PORT}`);
});

