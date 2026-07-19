---
version: 2026-07-19.003
date: 2026-07-19T19:10:00+05:00
author: Cursor Grok 4.5
type: docs
scope: docs/museumos-foundation
summary: Добавлены документы MuseumOS (аудит SHIHM, ADR, архитектура, модель контента, протокол устройств)
files:
  - docs/audit-shihm.md
  - docs/adr/0001-modular-monolith.md
  - docs/architecture.md
  - docs/content-model.md
  - docs/device-protocol.md
  - docs/migration-map-shihm.md
  - docs/security.md
  - docs/template-sdk.md
  - docs/acceptance-mvp.md
  - docs/runbook-player.md
---

## Changed

Создан комплект обязательных документов MuseumOS по Cursor Spec §14: аудит SHIHM, ADR модульного монолита, архитектура, модель контента, протокол устройств, карта миграции каталогов, безопасность, template SDK, чеклист приёмки MVP, runbook player. Существующий `docs/architecture.md` заменён.

## Why

Зафиксировать целевую архитектуру MuseumOS и фактическое состояние SHIHM/платформы до итераций реализации (tenant, `/api/v1`, устройства, PostgreSQL позже).

## Verification

Проверена UTF-8 запись всех 10 файлов; `docs/audit-shihm.md` ~124 строки (лимит ~250); соответствие Spec §4–9, §13–14 и аудиту SHIHM от 2026-07-19.
