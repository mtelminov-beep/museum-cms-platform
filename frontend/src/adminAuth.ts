import { ADMIN_SESSION_KEY } from "./cmsConfig";

export interface AdminSession {
  login: string;
  at: string;
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.login) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setAdminSession(login: string) {
  const session: AdminSession = { login, at: new Date().toISOString() };
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
