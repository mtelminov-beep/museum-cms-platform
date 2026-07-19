# Audit: SHIHM → MuseumOS

**Scope:** read-only audit of local mirror `C:\dev\SHIHM`  
**Date:** 2026-07-19  
**Target:** Museum CMS / MuseumOS (`C:\dev\museum-cms-platform`)  
**SHIHM frontend version:** 2.6.18 (`frontend/src/kioskConfig.ts`)

---

## 0. Executive summary

SHIHM is a **single-tenant** museum kiosk + public site: **React/Vite + Express on port 8787**, content in versioned **kiosk catalogs** inside `backend/data/cms-state.json`. Admin writes use **`X-CMS-Token`**; there is **no device heartbeat/registry** (kiosk mode is localStorage). QR resolution is **client-side**. Media lives under **`C:\dev\SHIHM\media`**.

MuseumOS already mirrors catalog + CMS token + admin login, with a smaller neutral catalog set, screens/playlists, and static device profiles. Persistence is still JSON (`runtime-state.json`); PostgreSQL, multi-tenant, revisions, and a real device protocol remain ahead.

---

## 1. Stack

| Layer | Stack | Ports / notes |
| --- | --- | --- |
| Frontend | React 18.3, React Router 6, TypeScript, Vite 5.4 | Dev **5173**; proxy to backend for `/cms`, `/kiosk/*`, `/health` |
| Backend | Node ESM, Express 4.21, multer | **`PORT \|\| 8787`** |
| Native | Capacitor Android (`ru.shihm.kiosk`) | APK scripts; not a device registry |
| DB | **None** — flat JSON files | No PostgreSQL / Redis / ORM |

Key env: `CMS_TOKEN`, `ADMIN_LOGIN` / `ADMIN_PASSWORD`, `CMS_DATA_PATH`, `KIOSK_UPDATE_TOKEN`, `KIOSK_SERVE_STATIC`.

Layout highlights: `backend/src/server.js`, `store.js`, `persistence.js`, `backend/data/cms-state.json`, `frontend/src/router.tsx`, `media/`.

---

## 2. Auth model

1. **Admin UI session** — `sessionStorage` (`shihm-admin-session-v2`); client gate for `/admin` only.
2. **CMS API token** — header `X-CMS-Token`, timing-safe compare (`cmsSecurity.js`). Issued by `POST /auth/admin-login` as env `CMS_TOKEN`.
3. **Visitor accounts** — scrypt hashes in `users.json`; roles `user` | `admin`. No JWT/cookies for visitors.

Production with empty `CMS_TOKEN` → CMS **503**. Non-prod empty token → open CMS. Kiosk UI password is frontend-only (`kioskModePassword`), not a server credential.

---

## 3. Data storage

**Primary store:** `cms-state.json` via `persistence.js` / `store.js`.

Top-level keys include legacy arrays (`species`, `media`, `mapPoints`, `games`, …), `settingsPublic`, and **`kioskCatalogs`** (primary CMS content).

Catalog envelope:

```json
{ "<catalog-key>": { "payload": {}, "updated_at": "ISO-8601" } }
```

Whitelist: `kioskCatalogKeys.js` / `CMS_CATALOG_KEYS` in `kioskConfig.ts` (24 keys). Local snapshot on audit date had ~11 keys present; others fall back to frontend defaults.

Separate files: `users.json`, `user-visits.json`, `content/updates/meta.json`. Frontend also caches catalogs in `localStorage`.

---

## 4. API (summary)

Envelope: `{ data, meta }` / `{ error, meta }`. Many routes assume section `shebekino`.

| Group | Examples |
| --- | --- |
| Ops / public | `GET /health`, `/settings/public`, `/sync/manifest`, `/sync/bundle`, `/kiosk/content/:key` |
| Auth | `POST /auth/admin-login`, `/auth/login`, `/auth/register`, profile/score |
| CMS (`cmsGate`) | `/cms/kiosk/catalogs/:key`, legacy CRUD, `POST /cms/media/upload`, users, backup jobs |
| Kiosk update | `/kiosk/update/*` (inbox apply to media/dist; host machine, not per-device identity) |

---

## 5. Frontend routes (high level)

`/`, `/admin`, `/museum`, about/place/poster/heritage/exhibits/heroes/articles/qr/account/cinema/game/quiz, plus legacy redirects. Chunk-load retry via `chunkReload`.

---

## 6. Admin & catalog keys

Admin tabs: content catalogs, users, sync, calibration, backup.

| Key | Role |
| --- | --- |
| `kiosk-navigation-v1` | Nav publish/visibility |
| `kiosk-welcome-screen-v1` / `kiosk-start-screen-v1` | Start / home visuals |
| `kiosk-museum-info-v1` | About museum |
| `kiosk-halls-v1` / `kiosk-expositions-v1` / `kiosk-heritage-page-v1` | Halls / heritage |
| `kiosk-exhibits-v1` / `kiosk-exhibitions-v1` | Exhibits / exhibitions |
| `kiosk-heroes-v1` (+ sections/subsections) | Persons / heroes |
| `kiosk-articles-v1` / `kiosk-poster-page-v1` | Articles / poster |
| `kiosk-map-v1` / `kiosk-qr-links-v1` | Map / QR links |
| `kiosk-cinema-v1`, ecotrail, quiz, city-code, drive, privacy, game | Site-specific modules |

Editors under `frontend/src/admin/*` (visual welcome, structured catalogs, Quill, media upload, QR PNG).

---

## 7. QR mechanism

- Catalog `kiosk-qr-links-v1`: `{ id, code, targetType, targetId?, externalUrl?, label }`.
- Admin generates PNG via `qrcode` to absolute site URLs.
- `QrPage` resolves with **html5-qrcode** against catalogs / entity `qrCode` fields — **no server redirect** (`/q/{publicId}`).
- Scan history in `localStorage`.

---

## 8. Device / kiosk protocol

| Capability | SHIHM reality |
| --- | --- |
| Kiosk mode / idle reset / low-vision / calibration | **localStorage** only |
| Device registry / registration code | **Absent** |
| Heartbeat / online status | **Absent** |
| Per-device playlist assignment | **Absent** (shared SPA) |
| Offline / sync | `/sync/*` + service worker (partial); `/kiosk/update` is host media push |

MuseumOS direction (`/display/<screen-id>`, screens/playlists) is a different model already started in the platform repo.

---

## 9. Media

| Root | Path |
| --- | --- |
| Media | `C:\dev\SHIHM\media` |
| Dist fallback | `C:\dev\SHIHM\frontend\dist` |
| Update inbox | `C:\dev\SHIHM\content\updates\` |

Upload: `POST /cms/media/upload` → `MEDIA_ROOT/<folder>/<file>`. Served folders include `halls`, `exhibits`, `cinema`, `uploads`, etc. Vite `publicDir: "../media"` in dev.

---

## 10. Reuse vs rewrite

| Area | Decision | Notes |
| --- | --- | --- |
| Catalog envelope `{ payload, updated_at }` + whitelist | **Reuse** | Already mirrored as `cms-*` in MuseumOS |
| CMS token gate (timing-safe) | **Reuse** | Harden defaults for production |
| Admin login → token handoff | **Reuse** | Pattern in MuseumOS `auth.js` |
| Visual editors / media field / rich text | **Reuse patterns** | Port UX, not SHIHM copy/content |
| QR generate + client resolve | **Reuse as module** | Evolve toward stable `/q/{id}` redirects |
| Media upload + folder URLs | **Reuse** | Add `tenant_id` prefix later |
| Backup/restore jobs idea | **Reuse concept** | Ops value for MVP |
| Capacitor / Android shell idea | **Reuse concept** | Align with `android-shell/` |
| SHIHM content & defaults | **Rewrite / never import** | Content-neutral platform seed |
| Dual legacy + kiosk models | **Rewrite** | One content model in MuseumOS |
| Hardcoded `shebekino` section | **Rewrite** | → `tenant_id` / museum |
| Default passwords / client tokens | **Rewrite** | Secrets in env only |
| JSON as multi-museum store | **Rewrite later** | PostgreSQL after MVP content path |
| `/kiosk/update` as “devices” | **Rewrite** | Real registry + heartbeat + manifest |

---

## 11. Gaps vs MuseumOS MVP

| Capability | SHIHM | MuseumOS today | Gap |
| --- | --- | --- | --- |
| Multi-tenant | Single section | Single seed museum | **Major** |
| PostgreSQL | JSON files | `runtime-state.json` | **Major** (planned after MVP content) |
| Device registry + heartbeat | None | Screens + static profiles | **Major** |
| Page revisions | Overwrite `updated_at` | Same | **Major** |
| RBAC actions | Binary admin/user | Env admin | **Medium** |
| Secure secrets | Weak defaults | Weak defaults | **Must fix** before deploy |
| QR as first-class | Full client | Not first-class | Port/adapt |
| AuditLog structured | Markdown changelogs | Version journal docs | Need tenant audit |

**Suggested phases:** freeze SHIHM as reference → stabilize MuseumOS JSON CMS → introduce `tenant_id` + devices → page revisions → PostgreSQL + tenant media prefixes → optional QR/backup/Capacitor ports.

---

## 12. Audit limitations

- Local mirror only; production `cms-state.json` may differ.
- No local `backend/.env` / `users.json` inspected.
- Do not delete or break SHIHM until a verified staging migration.

---

*Source audit for `docs/audit-shihm.md`. Content mapping: see `docs/migration-map-shihm.md`.*
