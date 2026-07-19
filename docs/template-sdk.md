# Template SDK — MuseumOS

A **template** is not a pile of filled pages. It is a portable package:

```text
manifest + design tokens + allowedBlocks + pagePresets (+ deviceSkins)
```

After a museum picks a template, the system creates **empty page frames** (home, about, exhibitions, collection, events, visitors, contacts, …). The museum fills content; switching theme must **not** destroy entities.

Do **not** copy HTML, images, logos, or copy from reference museum websites. Inspiration is compositional only; all shipping templates are original and Russian-locale by default, with demo placeholders.

---

## Manifest shape (illustrative)

```json
{
  "id": "museum-editorial",
  "name": "Редакционный музей",
  "locale": "ru",
  "tokens": {
    "color": {},
    "typography": {},
    "radius": {},
    "spacing": {}
  },
  "pagePresets": ["home", "about", "exhibitions", "collection", "events", "contacts"],
  "allowedBlocks": ["hero", "exhibit-grid", "timeline", "map", "footer"],
  "deviceSkins": ["kiosk-light", "tv-dark"]
}
```

| Part | Role |
| --- | --- |
| **manifest** | id, name, locale, version, preview metadata |
| **tokens** | colors, type, radius, spacing — theme knobs |
| **allowedBlocks** | which block types the editor may insert |
| **pagePresets** | empty page skeletons created on site bootstrap |
| **deviceSkins** | optional player chrome for kiosk/TV |

Shared **block runtime** renders the same blocks on web and player; templates only constrain and style.

---

## Starter template IDs

From Museum CMS Cursor Spec §6.2 (IDs only; implement original visuals):

| ID | Working title (RU) |
| --- | --- |
| `shihm-cultural-route` | Культурный маршрут |
| `shihm-digital-guide` | Цифровой гид |
| `natural-discovery` | Открытия |
| `heritage-dark` | Наследие |
| `history-story` | История в лицах |
| `science-split` | Наука и пространство |
| `gallery-minimal` | Галерея |

`shihm-cultural-route` is the primary **migration theme** for SHIHM-shaped information architecture (still content-neutral). `shihm-digital-guide` emphasizes mobile-first guide/kiosk flows.

MVP may ship the cultural-route template plus at least two others; remaining IDs stay in the registry as placeholders until designed.

---

## Rules

1. No free execution of user JavaScript in the editor.
2. Limited extra CSS only for privileged roles, tenant-scoped, with preview.
3. Tokens are data — content entities stay in the content model, not in the template package.
4. Demo media must be clearly placeholder assets owned by the platform.
