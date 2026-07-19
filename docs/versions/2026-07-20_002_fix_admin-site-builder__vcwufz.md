---
version: 2026-07-20.002
date: 2026-07-20T02:35:00+05:00
author: Cursor Agent
type: fix
scope: admin-site-builder-visible
summary: Сайт·редактор по умолчанию, видимый Tilda-конструктор и структура разделов
---

## Changed
Вкладка «Сайт · редактор» открывается сразу после входа с разделами (О музее, Афиша, карты, игры…) и Tilda-конструктором. Шаблоны — отдельная вкладка.

## Why
Пользователь не видел результат: админка открывалась на «Устройствах», конструктор был спрятан.

## Verification
npm run lint -w frontend; Vite serves SiteBuilderAdmin; backend :8787 OK