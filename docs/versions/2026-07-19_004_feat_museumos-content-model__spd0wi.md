---
version: 2026-07-19.004
date: 2026-07-19T19:25:00+05:00
author: Cursor Agent
type: feat
scope: museumos-foundation
summary: Модель контента MuseumOS, API v1, RBAC, устройства и QR
files:
  - backend/src/v1Router.js
  - backend/src/entities.js
  - backend/src/rbac.js
  - backend/src/auth.js
  - backend/src/store.js
  - backend/src/server.js
  - backend/data/cms-state.seed.json
  - frontend/src/admin/EntityCollectionEditor.tsx
  - frontend/src/pages/AdminPage.tsx
  - frontend/src/pages/EntityPublicPages.tsx
  - frontend/src/App.tsx
  - docs/audit-shihm.md
  - docs/architecture.md
  - docs/content-model.md
---

## Changed
Добавлены tenant, сущности контента, RBAC, API /api/v1, регистрации устройств, QR-редиректы, админ-вкладка «Контент», документация MuseumOS.

## Why
Расширение рабочей модели CMS по ТЗ MuseumOS (итерации 0–1) без копирования контента SHIHM.

## Verification
npm run lint -w frontend; smoke /api/v1/health, exhibits, devices/register.