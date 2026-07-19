# Migration map: SHIHM catalogs → MuseumOS entities

**Purpose:** structural mapping only. **Do not copy** SHIHM texts, images, logos, or seed content into MuseumOS. Import will use an exporter/adapter with checksums and a URL redirect table (see Cursor Spec §11).

**Date:** 2026-07-19

---

## Catalog key → entity / concept

| SHIHM catalog key | MuseumOS target | Notes |
| --- | --- | --- |
| `kiosk-welcome-screen-v1` | **Page** (preset: home/start) + blocks | Visual start screen → page builder blocks |
| `kiosk-start-screen-v1` | **Page** (home) + blocks | Museum home tiles → blocks / navigation bindings |
| `kiosk-museum-info-v1` | **Museum** + **Page** (about) | Profile fields → Museum; long copy → Page |
| `kiosk-navigation-v1` | **Nav** (site navigation tree) | Visibility/publish flags → channel rules |
| `kiosk-halls-v1` | **Hall** | Floor/order/media → Hall (+ Branch) |
| `kiosk-expositions-v1` | **Exhibition** (or hall sections) | Map to Exhibition and/or nested hall structure |
| `kiosk-heritage-page-v1` | **Page** | Heritage hub → blocks + links to halls/exhibitions |
| `kiosk-exhibits-v1` | **Exhibit** + **MediaAsset** | Primary collection entities |
| `kiosk-exhibitions-v1` | **Exhibition** | Temporary/permanent shows |
| `kiosk-poster-page-v1` | **Page** + **Event** / **Exhibition** cards | Poster hub composition |
| `kiosk-heroes-v1` | **Person** | Hero cards → Person |
| `kiosk-hero-sections-v1` | Taxonomy / **Page** sections | Structural grouping for Person |
| `kiosk-hero-subsections-v1` | Taxonomy / **Page** sections | Nested grouping |
| `kiosk-articles-v1` | **Article** | Bank of articles |
| `kiosk-qr-links-v1` | **QRCode** | Evolve to stable `publicId` + server redirect |
| `kiosk-map-v1` | Map points on **Branch** / **Hall** / **Route** | Geometry + POI links |
| `kiosk-cinema-v1` | **MediaAsset** + **Playlist** / **Page** | Site-specific; optional module |
| `kiosk-ecotrail-v1` | **Route** (+ Event/Page) | Product-specific trail → Route |
| `kiosk-quiz-catalog-v2` | Optional interactive module | Out of core MVP unless prioritized |
| `kiosk-game-v1` | Optional interactive module | Usually exclude from core import |
| `kiosk-city-code-v1` | **Page** or custom section | Local project page |
| `kiosk-drive-shbk-v1` | **Page** or **Route** | Local project page |
| `kiosk-privacy-policy-v1` | **Page** (legal) | Per-tenant legal page |

---

## Legacy SHIHM arrays (non-catalog)

| Legacy key / API | MuseumOS target |
| --- | --- |
| `species` / `/exhibits` | **Exhibit** (if still used) or drop after catalog-only cutover |
| `media` | **MediaAsset** |
| `mapPoints` | Map POIs → Hall/Branch/Route |
| `games` / `gameSteps` / `gameOptions` | Optional plugins — not core MVP |
| `attributions` | Media license / rights fields |
| `settingsPublic` | Tenant + device/kiosk settings |

---

## MuseumOS early catalogs (platform)

| MuseumOS key | Direction |
| --- | --- |
| `cms-welcome-v1` | Page (welcome) |
| `cms-home-v1` | Page (home) |
| `cms-navigation-v1` | Nav |
| `cms-sections-v1` | Sections → Hall / Exhibition / Page hubs |
| `cms-pages-v1` | **Page** + blocks |
| `cms-materials-v1` | **MediaAsset** / materials list |

Screens + playlists in runtime state → **Device**, **Playlist/Scene**, **Assignment**.

---

## Import rules (reminder)

1. Read-only adapter from SHIHM API/files — no manual CMS re-typing of production content.
2. Media import with checksum + original names; preserve alt/rights when present.
3. Build legacy URL → new URL map and 301s.
4. Staging tenant first; delta import before DNS cutover.
5. MuseumOS seeds stay empty/demo — never commit Shebekino production content into the platform repo.
