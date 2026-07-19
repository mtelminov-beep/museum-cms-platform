# Museum CMS Platform

Universal CMS shell for museums and cultural venues. The project is intentionally content-neutral: it contains structure, workflows, device profiles, and kiosk/display logic without copying materials from any existing museum site.

## What It Does

- Runs a public site and parallel display experiences from one CMS state.
- Supports touch panels, TV panels, projection screens, tablets, and Android kiosk shells.
- Keeps display behavior separate from content so each museum can manage its own exhibitions, media, and schedules.
- Provides rotation, kiosk mode, display scaling, and offline-friendly screen bundles.

## Project Shape

- `backend/`: Express API and JSON state storage.
- `frontend/`: React/Vite control panel and display runtime.
- `android-shell/`: native Android kiosk shell template for locked touch panels.
- `docs/`: operator and deployment notes.

## Quick Start

```bash
npm install
npm run dev
```

- Public start screen: `http://localhost:5173/`
- Museum menu: `http://localhost:5173/museum`
- Admin panel: `http://localhost:5173/admin` (login `admin` / `admin`)
- Backend API: `http://localhost:8787`

Content (welcome, navigation, sections, pages with block constructor, materials) is edited in `/admin` and stored as CMS catalogs.

## Build

```bash
npm run build
npm run start
```

## Android Kiosk

The web runtime can be packaged with Capacitor. The native shell template in `android-shell/` documents immersive kiosk behavior and rotation controls for 55-85 inch Android touch panels.

