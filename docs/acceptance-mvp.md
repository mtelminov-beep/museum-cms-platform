# Acceptance checklist — MuseumOS MVP

Criteria from Museum CMS Cursor Spec §13. Mark each item only when verified on a staging (or equivalent) environment with **neutral/demo** content — not production SHIHM copy pasted by hand.

---

## Checklist

- [ ] **1. New museum + template**  
  Administrator creates a new museum (tenant), chooses one of the Russian-locale templates, and receives a **site skeleton** with empty/demo placeholders and **no third-party museum content**.

- [ ] **2. Exhibition + exhibit, single source**  
  Editor creates an exhibition and an exhibit, uploads images, and publishes them to a **site card** and a **kiosk scene** without duplicating the entity data.

- [ ] **3. Page builder + revision**  
  Editor builds a new page from blocks, adjusts the mobile layout, **rolls back to a previous version**, and publishes.

- [ ] **4. QR batch**  
  For **20 exhibits**, a QR package is produced (SVG / PNG / PDF). Changing the QR **target** keeps the same printed code working (stable public id / redirect).

- [ ] **5. Touch panel offline**  
  A touch panel **registers with a one-time code**, receives a scene, **works offline**, and shows the current scene again after connectivity returns (manifest + ack).

- [ ] **6. TV schedule + monitoring**  
  A TV panel shows a playlist on **schedule**. Operator sees **online/offline** and **content version** in the cabinet.

- [ ] **7. RBAC on device commands**  
  A user **without** `device.command` cannot restart (or otherwise command) a device — including via a direct API request.

- [ ] **8. Accessibility + SEO basics**  
  The public site passes a basic accessibility check and exposes search metadata (title/description/OG or equivalent; Schema.org where implemented).

---

## Sign-off

| Field | Value |
| --- | --- |
| Environment | |
| Build / commit | |
| Tester | |
| Date | |
| Notes / known gaps | |

Do not cut over SHIHM production DNS until this checklist is approved and a rollback plan (DB/media backup, DNS TTL) is ready.
