# ADR 0001: Modular monolith for MuseumOS MVP

**Status:** Accepted  
**Date:** 2026-07-19  
**Deciders:** MuseumOS platform team  

---

## Context

The Museum CMS Cursor Spec recommends a TypeScript monorepo (`apps/admin|web|player|api`, shared packages) with NestJS/Fastify, PostgreSQL, Redis, and optional WebSocket/SSE. SHIHM and the current `museum-cms-platform` already run as a **JSON-backed Express monolith** with a single React/Vite frontend that serves admin, public web, and display/player routes.

Shipping a full apps/ split and microservices before content, tenancy, and device protocol work would delay MVP without reducing risk.

## Decision

1. **Stay a modular monolith** for MVP and the near term.
2. **One frontend app** (React + Vite): routes for **admin**, **web** (public site/PWA), and **player** (`/display/...`) in the same package, with clear folder boundaries (`admin/`, `pages/`, `device/`).
3. **One API process** (Express): domain modules under `backend/src/` with explicit boundaries (auth, catalogs/CMS, media, devices, later tenants).
4. Introduce **`tenant_id`** on all domain records and enforce it in every read/write path (even while storage remains JSON).
5. Version the public API as **`/api/v1/...`** (migrate existing `/api/*` routes behind aliases where needed).
6. **Postpone:**
   - microservices / separate deployables;
   - full monorepo `apps/` + `packages/` split;
   - NestJS/Fastify rewrite;
   - PostgreSQL as the primary store (planned **after** MVP content model and editors stabilize).

JSON file store (`runtime-state.json` / catalogs) remains acceptable for early iterations; PostgreSQL is the target persistence, not a day-one blocker for modular boundaries.

## Consequences

### Positive

- Faster iteration on content model, visual editor, QR, and device protocol.
- Matches current `museum-cms-platform` and SHIHM operational reality.
- Clear upgrade path: extract packages (`content-schema`, `block-runtime`, `device-sdk`, `template-sdk`) when module seams are proven.

### Negative / risks

- Shared frontend bundle may grow; mitigate with route-level code splitting.
- Discipline required so “modules” do not become a tangled singleton — enforce tenant checks and folder ownership in review.
- `/api/v1` migration must not break existing admin clients during transition.

### Follow-ups

- Document module map in `docs/architecture.md`.
- Add tenant isolation tests before multi-museum data lands.
- Revisit monorepo split only after MVP acceptance (`docs/acceptance-mvp.md`) and first real content migration staging.
