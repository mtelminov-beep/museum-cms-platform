import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const MEDIA_ROOT = path.resolve(__dirname, "../data/media");

export const MEDIA_FOLDERS = [
  "uploads",
  "welcome",
  "about",
  "poster",
  "exhibits",
  "exhibitions",
  "articles",
  "news",
  "heroes",
  "cinema",
  "maps",
  "games",
  "tickets",
  "audio",
  "video",
  "documents"
];

const ALLOWED_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".mp4",
  ".webm",
  ".mp3",
  ".wav",
  ".ogg",
  ".pdf"
]);

export function ensureMediaRoot() {
  fs.mkdirSync(MEDIA_ROOT, { recursive: true });
  for (const folder of MEDIA_FOLDERS) {
    fs.mkdirSync(path.join(MEDIA_ROOT, folder), { recursive: true });
  }
}

export function normalizeFolder(raw) {
  const folder = String(raw || "uploads")
    .replace(/\\/g, "/")
    .replace(/\.\./g, "")
    .replace(/^\/+|\/+$/g, "")
    .split("/")[0];
  return MEDIA_FOLDERS.includes(folder) ? folder : "uploads";
}

function uniqueName(dir, baseName) {
  const ext = path.extname(baseName);
  const stem = path.basename(baseName, ext).replace(/[^\w.\-]+/g, "_").slice(0, 60) || "file";
  let name = `${stem}${ext.toLowerCase()}`;
  let i = 1;
  while (fs.existsSync(path.join(dir, name))) {
    name = `${stem}-${i}${ext.toLowerCase()}`;
    i += 1;
  }
  return name;
}

export async function saveUploadedMedia(file, folderRaw) {
  const folder = normalizeFolder(folderRaw);
  const dir = path.join(MEDIA_ROOT, folder);
  await fsp.mkdir(dir, { recursive: true });
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error(`Недопустимый тип файла: ${ext || "unknown"}`);
  }
  const fileName = uniqueName(dir, file.originalname || `file${ext}`);
  const dest = path.join(dir, fileName);
  await fsp.rename(file.path, dest);
  const stat = await fsp.stat(dest);
  return {
    url: `/media/${folder}/${fileName}`,
    folder,
    fileName,
    size: stat.size,
    mimeType: file.mimetype,
    originalName: file.originalname
  };
}

export async function listMediaFolder(folderRaw) {
  const folder = normalizeFolder(folderRaw);
  const dir = path.join(MEDIA_ROOT, folder);
  await fsp.mkdir(dir, { recursive: true });
  const names = await fsp.readdir(dir);
  const items = [];
  for (const name of names) {
    const full = path.join(dir, name);
    const stat = await fsp.stat(full);
    if (!stat.isFile()) continue;
    items.push({
      url: `/media/${folder}/${name}`,
      folder,
      fileName: name,
      size: stat.size,
      mtimeMs: stat.mtimeMs
    });
  }
  items.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return items;
}
