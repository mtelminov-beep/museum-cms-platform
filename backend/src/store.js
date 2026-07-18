import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../data");
const SEED_PATH = path.join(DATA_DIR, "cms-state.seed.json");
const STATE_PATH = path.join(DATA_DIR, "runtime-state.json");

async function ensureStateFile() {
  try {
    await fs.access(STATE_PATH);
  } catch {
    const seed = await fs.readFile(SEED_PATH, "utf8");
    await fs.writeFile(STATE_PATH, seed);
  }
}

export async function readState() {
  await ensureStateFile();
  const raw = await fs.readFile(STATE_PATH, "utf8");
  return JSON.parse(raw);
}

export async function writeState(nextState) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STATE_PATH, `${JSON.stringify(nextState, null, 2)}\n`);
  return nextState;
}

export async function patchState(patch) {
  const current = await readState();
  return writeState({
    ...current,
    ...patch,
    updatedAt: new Date().toISOString()
  });
}

