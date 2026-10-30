import "server-only";

import { API_BASE_URL } from "@/lib/api/config";
import {
  clearSessionTokens,
  getSessionTokens,
  setSessionTokens,
} from "@/lib/auth/session-cookies";

const JSON_ACCEPT = "application/json; version=v1";

type ServerFetchResult<T> = {
  data: T | null;
  status: number;
  ok: boolean;
};

async function refreshAccessToken(refresh: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}auth/token/refresh/`, {
      method: "POST",
      headers: {
        Accept: JSON_ACCEPT,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { access?: string };
    return body.access ?? null;
  } catch {
    return null;
  }
}

async function authorizedFetch(
  path: string,
  init: RequestInit,
  access: string,
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path.replace(/^\//, "")}`;
  return fetch(url, {
    ...init,
    headers: {
      Accept: JSON_ACCEPT,
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init.headers,
      Authorization: `Bearer ${access}`,
    },
    cache: "no-store",
  });
}

/**
 * Server-only staging API fetch. Tokens stay in cookies; browser never calls api-staging directly for reads.
 */
export async function serverFetchJson<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<ServerFetchResult<T>> {
  let { access, refresh } = await getSessionTokens();
  if (!access) {
    return { data: null, status: 401, ok: false };
  }

  let response = await authorizedFetch(path, init, access);

  if (response.status === 401 && refresh) {
    const nextAccess = await refreshAccessToken(refresh);
    if (nextAccess) {
      await setSessionTokens(nextAccess, refresh);
      access = nextAccess;
      response = await authorizedFetch(path, init, access);
    } else {
      await clearSessionTokens();
      return { data: null, status: 401, ok: false };
    }
  }

  if (response.status === 204) {
    return { data: null, status: 204, ok: true };
  }

  const text = await response.text();
  if (!text) {
    return { data: null, status: response.status, ok: response.ok };
  }

  try {
    const data = JSON.parse(text) as T;
    return { data, status: response.status, ok: response.ok };
  } catch {
    return { data: null, status: response.status, ok: false };
  }
}

export async function serverFetchPost<T = unknown>(
  path: string,
  body: unknown,
): Promise<ServerFetchResult<T>> {
  return serverFetchJson<T>(path, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

export async function serverFetchForm<T = unknown>(
  path: string,
  method: "POST" | "PATCH",
  body: FormData,
): Promise<ServerFetchResult<T>> {
  return serverFetchJson<T>(path, {
    method,
    body,
  });
}

function stagingErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
    if (typeof record.detail === "string" && record.detail.trim()) {
      return record.detail;
    }
    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }
    const fieldMessages = Object.entries(record)
      .filter(([key]) => !["error", "upgrade_required", "plan_type"].includes(key))
      .map(([key, value]) => {
        if (Array.isArray(value) && value[0]) return `${key}: ${String(value[0])}`;
        if (typeof value === "string") return `${key}: ${value}`;
        return null;
      })
      .filter(Boolean);
    if (fieldMessages.length > 0) {
      return fieldMessages.join(" ");
    }
  }
  if (status === 401) {
    return "Your session expired. Sign out, sign in again, and retry.";
  }
  return status === 403
    ? "You do not have permission to do that (check your Grad Pad plan limits)."
    : "Something went wrong. Try again.";
}

export function readStagingActionError(result: {
  data: unknown;
  status: number;
  ok: boolean;
}): string | null {
  if (result.ok) return null;
  return stagingErrorMessage(result.data, result.status);
}
