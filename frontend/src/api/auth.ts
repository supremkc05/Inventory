import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/authStorage";
import type { AuthTokens, AuthUser } from "@/types/auth";

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  business_name: string;
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  pan_vat_number: string;
};

export type AuthResponse = AuthTokens & {
  user: AuthUser;
};

export type SignupResponse = {
  user: AuthUser;
};

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/v1/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signup(payload: SignupPayload): Promise<SignupResponse> {
  return apiFetch<SignupResponse>("/api/v1/auth/signup/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMe(accessToken?: string): Promise<AuthUser> {
  const token = accessToken ?? getAccessToken();
  return apiFetch<AuthUser>("/api/v1/auth/me/", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function logout(refreshToken: string): Promise<void> {
  return apiFetch<void>("/api/v1/auth/logout/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  }).catch(() => {
    // Network / already blacklisted — still clear local tokens
  }) as Promise<void>;
}
