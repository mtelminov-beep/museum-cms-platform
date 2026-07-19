# Content model — MuseumOS

Canonical domain model for MuseumOS. Storage today may still be JSON catalogs / runtime state; field shapes below are the target schema (PostgreSQL later). All records include **`tenant_id`** unless noted as global platform config.

**Publication status** (where applicable): `draft` | `published` | `archived`.

---

## Entities

| Entity | Key fields and relations |
| --- | --- |
| **Tenant** | name, domain(s), timezone, plan, brand settings |
| **Museum** | tenant, legal/display name, contacts |
| **Branch** | museum, address, hours, coordinates |
| **Hall** | branch, floor/zone, plan/schema, sort order, accessibility flags |
| **Exhibition** | type (permanent / temporary / virtual), period, cover, linked halls & exhibits, status |
| **Exhibit** | inventory number, title, dates, short/full description, author/person links, materials, dimensions, provenance, tags, media, status |
| **Person** | full name, role, years, biography, portrait, links to exhibits/articles |
| **Event** | date/time, location, age rating, registration URL, cover, status |
| **Article** | rubric, author, SEO, content blocks, status |
| **Route** | ordered stops, duration, audience, map, audio guide refs, status |
| **MediaAsset** | file ref, MIME, dimensions/duration, alt, rights/license, tags, focal point, variants |
| **Page** | slug, SEO, `blocks[]`, current revision, status (`draft` \| `published` \| `archived`) |
| **Template** | manifest, design tokens, allowed blocks, page presets, preview, version |
| **QRCode** | stable `publicId`, target type/id, design, status, UTM, scan stats |
| **Device** | tenant, type (`kiosk` \| `tablet` \| `tv` \| `led`), name, OS, resolution, token, online, player version, last heartbeat |
| **Playlist / Scene** | channels, items, schedule, conditions, fallback, content version |
| **Assignment** | device ↔ playlist/scene, priority, active window |
| **User / Role** | tenant, role, permission actions, MFA flags, last login |
| **AuditLog** | actor, timestamp, action, entity type/id, before/after, IP |

---

## Page and blocks

A page does **not** hard-code museum HTML. It stores:

```ts
blocks: BlockInstance[]
```

### BlockInstance shape

| Field | Purpose |
| --- | --- |
| `id` | Stable block instance id |
| `type` | Block type key (e.g. `hero`, `exhibit-grid`) |
| `props` | Typed content props for the block |
| `styleOverrides` | Limited style overrides (not free-form CSS by default) |
| `visibilityRules` | Channel / breakpoint / schedule visibility |
| `responsiveOverrides` | Desktop / tablet / mobile adjustments |
| `anchor` | Optional in-page anchor |
| `dataBindings` | Links to live entities (e.g. `exhibitionIds`) — **no copied snapshots** |

Blocks fetch published entity data via the content API at render time.

### Page revisions

- Autosave updates a **draft** revision.
- **Publish** freezes an immutable `published_revision`.
- Rollback restores a previous revision into draft (or republishes a historical revision per product rules).
- Status on the page document: `draft` | `published` | `archived`.

---

## Catalog bridge (current platform)

Until entities are fully normalized, CMS catalogs remain a transport envelope:

```json
{ "payload": {}, "updated_at": "ISO-8601" }
```

Map SHIHM / early MuseumOS catalogs to entities in [migration-map-shihm.md](migration-map-shihm.md). Seed data stays **content-neutral**.
