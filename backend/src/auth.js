import { getCmsToken } from "./cmsSecurity.js";

export function getAdminCredentials() {
  return {
    login: process.env.ADMIN_LOGIN || "admin",
    password: process.env.ADMIN_PASSWORD || "admin"
  };
}

export function handleAdminLogin(req, res) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const login = String(body.login ?? body.username ?? "").trim();
  const password = String(body.password ?? "");
  const creds = getAdminCredentials();

  if (login !== creds.login || password !== creds.password) {
    res.status(401).json({ ok: false, error: "Неверный логин или пароль" });
    return;
  }

  res.json({
    ok: true,
    admin: { login: creds.login, role: "admin" },
    token: getCmsToken()
  });
}
