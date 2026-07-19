# Device protocol — MuseumOS

Protocol for kiosk, tablet, TV, and LED players. Aligns with Museum CMS Cursor Spec §8.3.

**MVP note:** implement the same endpoints and payloads against the **JSON store** first (`runtime-state.json` / device collections). PostgreSQL and signed device tokens harden later; shapes should not change.

WebSocket/SSE may notify “new version available”; **HTTP manifest remains source of truth** so devices survive connection drops.

---

## Endpoints

```text
POST /api/v1/devices/register          # one-time code → device token
POST /api/v1/devices/{id}/heartbeat
GET  /api/v1/devices/{id}/manifest     # ETag / version / asset list
POST /api/v1/devices/{id}/ack
GET  /api/v1/devices/{id}/commands
POST /api/v1/devices/{id}/command-ack
```

All device calls authenticate with the **device token** issued at registration (header, e.g. `Authorization: Bearer <deviceToken>` or `X-Device-Token`). Admin APIs that issue registration codes and assignments use staff auth + RBAC (`device.command`, etc.).

---

## Flows

### 1. Register

1. Admin creates a device (or pending slot) and a **one-time registration code**.
2. Player calls `POST /api/v1/devices/register` with `{ code, deviceInfo }` (type, name, OS, resolution, player version).
3. API binds the physical unit, returns `{ deviceId, deviceToken }` (rotatable later).
4. Code is invalidated.

### 2. Heartbeat

`POST /api/v1/devices/{id}/heartbeat` body (illustrative):

- `online` / status
- `playerVersion`
- `contentVersion` (last applied)
- `freeStorage`
- `resolution`
- `lastError` (optional)
- IP only for support diagnostics, not analytics PII

Server updates `lastHeartbeatAt`, online flag, and dashboard views.

### 3. Manifest

`GET /api/v1/devices/{id}/manifest`:

- Returns assigned playlist/scene version, item list, media URLs, **checksums**, schedule/fallback.
- Supports `ETag` / `If-None-Match` for cheap polls.
- Player downloads assets, verifies checksums, then **atomically** switches to the new version.

### 4. Ack

`POST /api/v1/devices/{id}/ack` confirms successful apply of a content version (or reports failure reason). Required for “delivered” status in admin.

### 5. Commands

`GET /api/v1/devices/{id}/commands` — pending remote actions, e.g.:

- refresh content now
- restart player
- capture status snapshot

Dangerous commands require explicit admin confirmation and **AuditLog**.  
`POST /api/v1/devices/{id}/command-ack` reports command result.

Users without `device.command` must be rejected even on direct API calls.

---

## Player behaviour (summary)

- Fullscreen PWA/web runtime with local cache of last **acked** scene + media.
- Offline: keep playing last confirmed version; on reconnect, heartbeat → manifest → ack.
- Kiosk: idle timeout → home/wait screen; no OS chrome.
- TV: playlist timing, transitions, weekly/calendar schedule.

---

## Current platform gap

Today MuseumOS opens `/display/<screen-id>` with screens/playlists in JSON and **static** `deviceProfiles`. There is **no** register/heartbeat/manifest yet — this document is the contract to implement next (JSON-backed MVP acceptable).
