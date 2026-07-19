/** RBAC: действия и роли MuseumOS (MVP). */

export const PERMISSIONS = [
  "content.read",
  "content.write",
  "content.publish",
  "media.write",
  "device.read",
  "device.command",
  "template.edit",
  "users.manage",
  "tenant.settings",
  "analytics.read"
];

export const ROLE_PERMISSIONS = {
  owner: [...PERMISSIONS],
  admin: [...PERMISSIONS],
  editor: ["content.read", "content.write", "content.publish", "media.write", "analytics.read"],
  curator: ["content.read", "content.write", "media.write"],
  designer: ["content.read", "content.write", "template.edit", "media.write"],
  operator: ["content.read", "device.read", "device.command"],
  analyst: ["content.read", "analytics.read"]
};

export function permissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || ["content.read"];
}

export function roleCan(role, permission) {
  return permissionsForRole(role).includes(permission);
}

export function requirePermission(permission) {
  return (req, res, next) => {
    const role = req.cmsRole || "admin";
    if (!roleCan(role, permission)) {
      res.status(403).json({ error: "Forbidden", permission });
      return;
    }
    next();
  };
}
