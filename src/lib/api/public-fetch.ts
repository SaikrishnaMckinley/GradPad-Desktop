import "server-only";

import { API_BASE_URL } from "@/lib/api/config";

const JSON_ACCEPT = "application/json; version=v1";

export type PublicFetchResult<T> = {
  data: T | null;
  status: number;
  ok: boolean;
};

/** Unauthenticated staging GET (e.g. `community/open/<id>/`). */
export async function publicFetchJson<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<PublicFetchResult<T>> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path.replace(/^\//, "")}`;

  try {
    const response = await fetch(url, {
      ...init,
      method: init.method ?? "GET",
      headers: {
        Accept: JSON_ACCEPT,
        ...init.headers,
      },
      cache: "no-store",
    });

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
  } catch {
    return { data: null, status: 0, ok: false };
  }
}
