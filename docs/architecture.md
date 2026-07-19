# Architecture — MuseumOS

MuseumOS is a **multi-tenant CMS** for museums: one installation serves many museums (`tenant`). Each museum describes content once and publishes it selectively to **Web**, **PWA guide**, **kiosk/touch**, **tablet**, and **TV/signage**.

**Current reality (2026-07):** JSON Express monolith (`backend/` + `frontend/`) evolving toward a modular monolith with `tenant_id` and `/api/v1`. PostgreSQL and a full `apps/` monorepo split come **after** MVP content. See [ADR 0001](adr/0001-modular-monolith.md).

---

## Layers

| Layer | Responsibility | Today | Target |
| --- | --- | --- | --- |
| **admin** | Tenant cabinet: entities, page builder, media, QR, devices, roles | Routes under `/admin` in shared Vite app | Same UX; optional later extract to `apps/admin` |
| **web** | Public site + PWA guide render | `/`, `/museum`, section/content pages | SSR/prerender, SEO, offline guide cache |
| **player** | Kiosk / TV / tablet runtime | `/display`, `/display/:screenId` | Offline manifest cache, idle reset, playlists |
| **api** | REST (+ later WS/SSE notify) | Express on **8787**, JSON state | `/api/v1`, domain modules, then PostgreSQL |

Supporting: `android-shell/` wraps the web player for locked touch panels. Media: local upload folder now; S3-compatible object storage later, always keyed by tenant.

```text
┌─────────────┐  ┌─────────────┐  ┌──────────────┐
│   admin UI  │  │  web / PWA  │  │    player    │
└──────┬──────┘  └──────┬──────┘  └──────┬───────┘
       │                │                 │
       └────────────────┼─────────────────┘
                        ▼
              ┌──────────────────┐
              │  api (Express)   │
              │  tenant_id gate  │
              └────────┬─────────┘
                       ▼
         JSON store → PostgreSQL (later)
         + media storage (tenant-prefixed)
```

---

## Tenant isolation

- Every persisted record carries **`tenant_id`**.
- Server enforces tenant on every query; UI hiding is not security.
- No cross-tenant reads/writes (acceptance and automated tests required).
- Domains, brand tokens, and media paths are scoped per tenant.
- Early JSON store may use a single default tenant; schema must still include the field.

---

## Content: catalogs and entities

**Near term:** versioned **CMS catalogs** (SHIHM-style envelope `{ payload, updated_at }`) — MuseumOS keys such as `cms-welcome-v1`, `cms-home-v1`, `cms-navigation-v1`, `cms-sections-v1`, `cms-pages-v1`, `cms-materials-v1`, plus screens/playlists in runtime state.

**Target model:** first-class entities (see [content-model.md](content-model.md)): Museum, Branch, Hall, Exhibition, Exhibit, Person, Event, Article, Route, MediaAsset, Page (+ blocks + revisions), Template, QRCode, Device, Playlist/Scene, Assignment, User/Role, AuditLog.

Pages store `blocks: BlockInstance[]` with references to entities (`exhibitionIds`, etc.), not copied snapshots. Publication creates an immutable **published revision**.

---

## Devices (protocol sketch)

Player is a first-class client of the API (details in [device-protocol.md](device-protocol.md)):

```text
POST /api/v1/devices/register
POST /api/v1/devices/{id}/heartbeat
GET  /api/v1/devices/{id}/manifest
POST /api/v1/devices/{id}/ack
GET  /api/v1/devices/{id}/commands
POST /api/v1/devices/{id}/command-ack
```

MVP may implement the same shapes against the JSON store. WebSocket/SSE only notifies “new version”; **manifest is source of truth**.

Today: static `deviceProfiles`, screens in state, open `/display/<screen-id>` — no heartbeat yet.

---

## Publication channels

| Channel | Role |
| --- | --- |
| **Web** | Public museum site, SEO, CHPU |
| **PWA** | Mobile guide: routes, favorites, QR entry, offline cache |
| **Kiosk / touch** | Large touch targets, idle reset, locked shell |
| **Tablet** | Guide / educator scenarios |
| **TV / LED** | Playlist / schedule, view-only signage |

One exhibit or exhibition is authored once and assigned to channels via publication rules and device assignments — not duplicated per channel.

---

## Templates

A template is `manifest + design tokens + allowedBlocks + pagePresets` ([template-sdk.md](template-sdk.md)). Changing theme must not destroy content. Demo placeholders only — no third-party museum assets.

---

## Security & ops (pointers)

Secrets in env, CMS token / session auth, RBAC as actions, rate-limited login, tenant isolation — [security.md](security.md). Player local run — [runbook-player.md](runbook-player.md). MVP checklist — [acceptance-mvp.md](acceptance-mvp.md).
