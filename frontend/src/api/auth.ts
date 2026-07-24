import { apiFetch } from "@/lib/api";
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

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/v1/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signup(payload: SignupPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/v1/auth/signup/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMe(accessToken: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/v1/auth/me/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
