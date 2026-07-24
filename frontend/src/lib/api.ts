/** Shared fetch helper for DokanDaftar API. */

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export type ApiErrorBody = {
  detail?: string | string[];
  [field: string]: unknown;
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
        : `Request failed (${status})`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  const data = (await res.json().catch(() => ({}))) as ApiErrorBody;

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data as T;
}

/** Map DRF field errors onto a form error object. */
export function mapDrfErrors<K extends string>(
  body: ApiErrorBody,
  fieldMap: Record<string, K>,
): Partial<Record<K | "form", string>> {
  const out: Partial<Record<K | "form", string>> = {};

  for (const [apiField, formField] of Object.entries(fieldMap)) {
    const raw = body[apiField];
    if (raw == null) continue;
    const msg = Array.isArray(raw) ? String(raw[0]) : String(raw);
    out[formField] = msg;
  }

  if (body.detail != null && Object.keys(out).length === 0) {
    out.form = Array.isArray(body.detail)
      ? body.detail.join(" ")
      : String(body.detail);
  }

  // Non-field errors like { non_field_errors: [...] }
  const nonField = body.non_field_errors;
  if (nonField != null && !out.form) {
    out.form = Array.isArray(nonField) ? String(nonField[0]) : String(nonField);
  }

  return out;
}
