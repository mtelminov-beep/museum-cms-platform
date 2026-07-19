# Runbook — display / player (local)

How to run the MuseumOS **player** locally during MVP. Protocol target: [device-protocol.md](device-protocol.md). Today the runtime is the Vite display route backed by JSON state.

---

## Prerequisites

```bash
cd C:\dev\museum-cms-platform
npm install
npm run dev
```

Typical URLs:

| Surface | URL |
| --- | --- |
| Vite frontend | http://localhost:5173 |
| API | http://localhost:8787 |
| Admin | http://localhost:5173/admin (dev defaults: `admin` / `admin`) |
| Player | http://localhost:5173/display or `/display/<screen-id>` |

Ensure the backend is up (`GET /api/health` or proxied `/api/health`).

---

## Run display / player

1. In admin, create or note a **screen** id (screens live in CMS/runtime state).
2. Optionally assign a **playlist** / materials for that screen.
3. On the panel PC or browser:
   - Open `http://localhost:5173/display/<screen-id>`
   - Or open `/display` and select/default screen behavior in UI
4. For kiosk-like use: fullscreen the browser (F11) or use `android-shell` / Capacitor guidance for locked panels.
5. Rotation: frontend localStorage key `museum-cms:display-rotation` (`0` \| `90` \| `180` \| `270`); Android shell can lock orientation natively.

Device **profiles** (resolution, density) are listed in `frontend/src/device/profiles.ts` for planning; they are not yet a live registry.

---

## Register a device (MVP)

**Target flow (implement against JSON store first):**

1. Admin creates a pending device and a **one-time code**.
2. Player opens a register screen and submits the code to `POST /api/v1/devices/register`.
3. Store returned `deviceId` + `deviceToken` in player secure storage / localStorage (dev only).
4. Player starts **heartbeat** and polls **manifest**.

**Until register API exists:** treat “registration” as opening `/display/<screen-id>` on that hardware and documenting the screen id in admin. Do not pretend heartbeat exists — dashboard online status will be missing.

---

## Offline cache notes

| Phase | Behaviour |
| --- | --- |
| **Now** | Browser HTTP cache / SPA assets only. No guaranteed offline scene package. Prefer a stable LAN URL to the API during demos. |
| **MVP target** | After manifest download + **ack**, cache scene JSON + media (Cache Storage or equivalent). On offline boot, play **last acked** version. |
| **Checksums** | Verify assets before atomic switch; on failure keep previous version and report via heartbeat/`ack`. |
| **Updates** | On reconnect: heartbeat → `GET manifest` (ETag) → download delta → ack. |

Do not clear site data on kiosk machines without re-fetching a full manifest.

---

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Empty display | Backend running? Screen id present in state? |
| Stale content | Hard refresh; confirm catalog/playlist publish; later — content version vs ack |
| Admin 401 on save | CMS token after login; `CMS_TOKEN` env in production |
| Wrong rotation | Reset display rotation in UI / localStorage |

---

## Related

- [architecture.md](architecture.md) — layers and channels  
- [operator-guide.md](operator-guide.md) — day-to-day screen assignment  
- [acceptance-mvp.md](acceptance-mvp.md) — offline/TV acceptance items  
