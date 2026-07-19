---
version: 2026-07-20.002
date: 2026-07-20T00:50:00+05:00
author: Cursor Agent
type: feat
scope: templates-full-design
summary: Шаблоны применяют шрифты, меню, представление и канонические разделы
files:
  - frontend/src/templates/presets.ts
  - frontend/src/templates/applyTemplate.ts
  - frontend/src/admin/TemplatesAdmin.tsx
  - frontend/src/styles.css
  - frontend/src/pages/HomePage.tsx
  - frontend/src/components/PublicLayout.tsx
---

## Changed
Применение шаблона больше не ограничивается палитрой: подключаются Google Fonts, стили меню/hero/плиток, полное меню из SITE_SECTIONS и каркасы страниц без удаления заполненного контента.

## Why
Запрос: копировать структуру шаблона (шрифты, дизайн, меню), а не только цветовую гамму, с учётом разделов по умолчанию.

## Verification
npm run lint -w frontend