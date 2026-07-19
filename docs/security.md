# Security — MuseumOS

Baseline security rules for the modular monolith. Enforce on the **server**; UI-only checks are not protection.

---

## Secrets

- All secrets live in **environment variables** (`.env` locally, secret store in production).
- Never commit `.env`, CMS tokens, device tokens, or password hashes to git.
- Required (names illustrative): `CMS_TOKEN`, `ADMIN_LOGIN` / `ADMIN_PASSWORD` (bootstrap only), later `DATABASE_URL`, session secrets, object-storage keys.
- Production must refuse to start CMS writes if `CMS_TOKEN` (or successor) is empty/misconfigured.

---

## Passwords and sessions

- Store user passwords with **bcrypt** (or Argon2); never plaintext.
- Prefer hashed staff users in the data store over long-lived env plaintext passwords (env bootstrap acceptable for first admin only).
- Support session revocation; plan MFA for administrators (Spec §9).
- Visitor/staff auth: no JWT secrets in the frontend bundle.

---

## CMS token

- Admin mutations require a **CMS token** (today: `X-CMS-Token`, timing-safe compare).
- Token is issued on successful admin login; treat like a secret capability, not a public museum id.
- Rotate token on compromise; do not embed default tokens such as `"admin"` in production builds.

---

## RBAC

Permissions are **actions**, not only role names. Examples:

| Action | Meaning |
| --- | --- |
| `content.publish` | Publish pages/entities |
| `content.edit` | Edit drafts |
| `device.command` | Remote device commands (restart, force refresh) |
| `template.edit` | Change theme/template tokens |
| `tenant.admin` | Users, domains, billing-level settings |

Roles (owner, museum admin, editor, curator, exhibition operator, designer, analyst) are bundles of actions. Missing `device.command` must fail even on a forged API request.

---

## Rate limiting and abuse

- **Rate-limit login** (`/auth/admin-login` and user login) by IP + account.
- Lock out or delay after repeated failures; log attempts in **AuditLog**.
- Validate all inputs; sanitize rich text (no `<script>`, no inline handlers).
- Uploads: MIME allowlist, size limits; antivirus queue when available.
- CSRF for cookie sessions; CORS allowlist; CSP for public/admin apps.

---

## Tenant isolation

- Every query filters by **`tenant_id`** derived from the authenticated principal (or device binding), never from an unchecked client body field alone.
- **No tenant cross-read:** tenant A must not read or mutate tenant B’s entities, media, devices, or audit rows.
- Automated test proving cross-tenant denial is required before multi-museum data goes live.
- Media paths and object keys are tenant-prefixed.

---

## Devices

- Device tokens are secrets; registration codes are one-time.
- Remote commands require `device.command` + explicit confirmation + AuditLog entry.

---

## Current gaps (honest)

MuseumOS and SHIHM still use weak default credentials in development. Replace before any shared or production deployment. Structured AuditLog and full action RBAC are target state; implement alongside tenancy.
