import type { AuthState } from "@/types/auth";

const AUTH_KEY = "vendia_auth";
const TOKEN_COOKIE = "vendia_token";
const ROLE_COOKIE = "vendia_role";

export function getAuthState(): AuthState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function setAuthState(state: AuthState): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${TOKEN_COOKIE}=${state.token}; path=/; SameSite=Lax; max-age=${maxAge}`;
  document.cookie = `${ROLE_COOKIE}=${state.role}; path=/; SameSite=Lax; max-age=${maxAge}`;
}

export function clearAuthState(): void {
  localStorage.removeItem(AUTH_KEY);
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0`;
}

export function getToken(): string | null {
  return getAuthState()?.token ?? null;
}

export function hasTokenCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(TOKEN_COOKIE);
}
