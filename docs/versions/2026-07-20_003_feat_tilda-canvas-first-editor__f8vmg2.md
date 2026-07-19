---
version: 2026-07-20.003
date: 2026-07-20T05:55:00+05:00
author: Cursor Agent
type: feat
scope: cms-visual-editor
summary: Canvas-first визуальный конструктор страниц в стиле Tilda
files:
  - frontend/src/admin/TildaPageEditor.tsx
  - frontend/src/admin/VisualPageEditor.tsx
  - frontend/src/components/ContentBlocks.tsx
  - frontend/src/styles.css
---

## Changed
Убрана трёхколоночная раскладка конструктора. Холст стал главной поверхностью с WYSIWYG-рендером блоков (как на сайте). Библиотека блоков и свойства открываются выезжающими панелями. Между блоками — точки вставки; список страниц скрывается в режиме фокуса.

## Why
Параллельные окна мешали видеть страницу целиком и работать как в Tilda.

## Verification
npm run lint -w frontend (tsc --noEmit) — OK.