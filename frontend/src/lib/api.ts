/** Shared fetch helper for DokanDaftar API. */

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/lib/authStorage";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export type ApiErrorBody = {
  detail?: string | string[];
  title?: string;
  status?: number;
  errors?: Record<string, unknown>;
  [field: string]: unknown;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    const detail = body.detail;
    const message = Array.isArray(detail)
      ? detail.join(" ")
      : typeof detail === "string"
        ? detail
        : typeof body.title === "string"
          ? body.title
          : `Request failed (${status})`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type ApiFetchInit = RequestInit & {
  /** Internal: already retried after a token refresh. */
  _retried?: boolean;
};

const AUTH_NO_REFRESH = [
  "/api/v1/auth/login/",
  "/api/v1/auth/signup/",
  "/api/v1/auth/refresh/",
];

/** Single in-flight refresh so parallel 401s share one refresh call. */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      access?: string;
      refresh?: string;
      detail?: string;
    };
    if (!res.ok || !data.access) {
      clearTokens();
      return null;
    }
    // ROTATE_REFRESH_TOKENS returns a new refresh; keep old if omitted.
    saveTokens(data.access, data.refresh ?? refresh);
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path === "/login" || path === "/signup") return;
  const next = encodeURIComponent(path + window.location.search);
  window.location.assign(`/login?next=${next}`);
}

export async function apiFetch<T>(
  path: string,
  init: ApiFetchInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!headers.has("Content-Type") && init.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  // Let the browser set multipart boundary for FormData.
  if (isFormData) {
    headers.delete("Content-Type");
  }

  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = (await res.json().catch(() => ({}))) as ApiErrorBody;

  if (
    res.status === 401 &&
    !init._retried &&
    !AUTH_NO_REFRESH.some((p) => path.startsWith(p))
  ) {
    if (!refreshInFlight) {
      refreshInFlight = refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });
    }
    const newAccess = await refreshInFlight;
    if (newAccess) {
      const retryHeaders = new Headers(init.headers);
      if (isFormData) {
        retryHeaders.delete("Content-Type");
      } else if (!retryHeaders.has("Content-Type") && init.body) {
        retryHeaders.set("Content-Type", "application/json");
      }
      retryHeaders.set("Authorization", `Bearer ${newAccess}`);
      return apiFetch<T>(path, {
        ...init,
        headers: retryHeaders,
        _retried: true,
      });
    }
    redirectToLogin();
    throw new ApiError(401, data);
  }

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data as T;
}

/** Map DRF / E36 field errors onto a form error object. */
export function mapDrfErrors<K extends string>(
  body: ApiErrorBody,
  fieldMap: Record<string, K>,
): Partial<Record<K | "form", string>> {
  const out: Partial<Record<K | "form", string>> = {};
  const fieldErrors =
    body.errors && typeof body.errors === "object"
      ? (body.errors as Record<string, unknown>)
      : body;

  for (const [apiField, formField] of Object.entries(fieldMap)) {
    const raw = fieldErrors[apiField];
    if (raw == null) continue;
    const msg = Array.isArray(raw) ? String(raw[0]) : String(raw);
    out[formField] = msg;
  }

  if (body.detail != null && Object.keys(out).length === 0) {
    out.form = Array.isArray(body.detail)
      ? body.detail.join(" ")
      : String(body.detail);
  }

  const nonField = fieldErrors.non_field_errors;
  if (nonField != null && !out.form) {
    out.form = Array.isArray(nonField) ? String(nonField[0]) : String(nonField);
  }

  return out;
}
