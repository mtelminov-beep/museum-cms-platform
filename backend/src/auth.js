import { getCmsToken } from "./cmsSecurity.js";
import { permissionsForRole } from "./rbac.js";
import { readState } from "./store.js";

export function getAdminCredentials() {
  return {
    login: process.env.ADMIN_LOGIN || "admin",
    password: process.env.ADMIN_PASSWORD || "admin"
  };
}

export async function handleAdminLogin(req, res) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const login = String(body.login ?? body.username ?? "").trim();
  const password = String(body.password ?? "");
  const creds = getAdminCredentials();

  let role = "admin";
  let userId = "user-admin";
  let displayName = "Администратор";

  if (login === creds.login && password === creds.password) {
    role = "admin";
  } else {
    try {
      const state = await readState();
      const user = (state.users || []).find((u) => u.login === login && u.password === password);
      if (!user) {
        res.status(401).json({ ok: false, error: "Неверный логин или пароль" });
        return;
      }
      role = user.role || "editor";
      userId = user.id;
      displayName = user.displayName || user.login;
    } catch {
      res.status(401).json({ ok: false, error: "Неверный логин или пароль" });
      return;
    }
  }

  res.json({
    ok: true,
    admin: { id: userId, login, role, displayName },
    token: getCmsToken(),
    permissions: permissionsForRole(role)
  });
}
