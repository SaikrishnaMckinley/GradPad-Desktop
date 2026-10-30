import { API_BASE_URL } from "@/lib/api/config";

const JSON_ACCEPT = "application/json; version=v1";

export async function stagingRequest(
  path: string,
  init: RequestInit & { accessToken?: string } = {},
): Promise<Response> {
  const { accessToken, ...rest } = init;
  const url = `${API_BASE_URL}${path.replace(/^\//, "")}`;
  return fetch(url, {
    ...rest,
    headers: {
      Accept: JSON_ACCEPT,
      ...(rest.body && !(rest.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...rest.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: "no-store",
  });
}

export function extractAuthTokens(data: Record<string, unknown>): {
  access: string | null;
  refresh: string | undefined;
} {
  const nested = data.tokens as { access?: string; refresh?: string } | undefined;
  const access =
    (data.access as string | undefined) ??
    (data.access_token as string | undefined) ??
    (data.key as string | undefined) ??
    nested?.access ??
    null;
  const refresh =
    (data.refresh as string | undefined) ?? nested?.refresh ?? undefined;
  return { access, refresh };
}

export async function parseStagingError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as Record<string, unknown>;
    const pick = (value: unknown) =>
      Array.isArray(value) ? String(value[0]) : typeof value === "string" ? value : null;

    return (
      pick(body.error) ??
      pick(body.non_field_errors) ??
      pick(body.detail) ??
      pick(body.message) ??
      pick(body.email) ??
      pick(body.password) ??
      pick(body.password1) ??
      "Request failed. Please try again."
    );
  } catch {
    return "Request failed. Please try again.";
  }
}
