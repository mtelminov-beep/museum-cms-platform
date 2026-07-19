import { timingSafeEqual } from "node:crypto";

export function getCmsToken() {
  return process.env.CMS_TOKEN || "admin";
}

export function cmsTokenMatches(header, expected) {
  if (typeof expected !== "string" || expected.length === 0) return false;
  if (typeof header !== "string" || header.length === 0) return false;
  const a = Buffer.from(header, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function cmsGate(req, res, next) {
  const expected = getCmsToken();
  const header = req.get("X-CMS-Token") || "";
  if (!cmsTokenMatches(header, expected)) {
    res.status(401).json({ error: "Unauthorized", message: "Требуется X-CMS-Token" });
    return;
  }
  next();
}
