import type { AuthUser } from "@/types/auth";
import type { AppRole } from "@/types/products";

const ACCESS_KEY = "dd_access";
const REFRESH_KEY = "dd_refresh";
const USER_KEY = "dd_user";

export function saveTokens(access: string, refresh?: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) {
    localStorage.setItem(REFRESH_KEY, refresh);
  }
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function saveUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getStoredRole(): AppRole {
  const role = getStoredUser()?.role;
  if (role === "owner" || role === "admin" || role === "accountant") {
    return role;
  }
  return "owner";
}
