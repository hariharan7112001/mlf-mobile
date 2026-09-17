import { getApiBaseUrl } from "@/core/env";
import { getToken } from "@/core/storage/secure-store";

export type ApiErrorCode =
  | "VALIDATION"
  | "RATE_LIMITED"
  | "INVALID_CREDENTIALS"
  | "PIN_LOCKED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER_ERROR"
  | "DB_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | string;

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  details?: unknown;

  constructor(code: ApiErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

const AUTH_PATH_PREFIX = "/api/auth/";
const DEFAULT_TIMEOUT_MS = 15000;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  timeoutMs?: number;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "POST", body, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = await getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${getApiBaseUrl()}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("TIMEOUT", "Request timed out. Please try again.", 0);
    }
    if (__DEV__) {
      console.warn(`[api] request to ${url} failed:`, error);
    }
    throw new ApiError(
      "NETWORK_ERROR",
      __DEV__
        ? `Could not reach ${url}. Check the server is running and EXPO_PUBLIC_API_BASE_URL is reachable from this device.`
        : "Network error. Check your connection and try again.",
      0
    );
  }
  clearTimeout(timer);

  let json: ApiEnvelope<T>;
  try {
    json = await response.json();
  } catch {
    throw new ApiError("SERVER_ERROR", "Unexpected response from server.", response.status);
  }

  if (json.ok) {
    return json.data;
  }

  if (response.status === 401 && !path.startsWith(AUTH_PATH_PREFIX)) {
    const { useAuthStore } = await import("@/features/auth/store");
    useAuthStore.getState().clearSession();
  }

  throw new ApiError(
    json.error.code,
    json.error.message,
    response.status,
    json.error.details
  );
}

export function apiPost<T>(path: string, body?: unknown, timeoutMs?: number): Promise<T> {
  return request<T>(path, { method: "POST", body, timeoutMs });
}

export function apiGet<T>(path: string, timeoutMs?: number): Promise<T> {
  return request<T>(path, { method: "GET", timeoutMs });
}

export function apiPatch<T>(path: string, body?: unknown, timeoutMs?: number): Promise<T> {
  return request<T>(path, { method: "PATCH", body, timeoutMs });
}
