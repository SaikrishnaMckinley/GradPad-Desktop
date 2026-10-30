import { NextResponse } from "next/server";
import {
  extractAuthTokens,
  parseStagingError,
  stagingRequest,
} from "@/lib/api/staging-request";
import { setSessionTokens, clearSessionTokens, getSessionTokens } from "@/lib/auth/session-cookies";

export async function handleAuthLogin(body: { email?: string; password?: string }) {
  const email = body.email?.trim();
  const password = body.password;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const response = await stagingRequest("auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const message =
      response.status === 401
        ? "Incorrect email or password."
        : await parseStagingError(response);
    return NextResponse.json({ error: message }, { status: response.status });
  }

  const data = (await response.json()) as Record<string, unknown>;
  const { access, refresh } = extractAuthTokens(data);
  if (!access) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await setSessionTokens(access, refresh);

  return NextResponse.json({
    ok: true,
    access,
    refresh: refresh ?? null,
  });
}

export async function handleAuthLogout() {
  const { access } = await getSessionTokens();
  if (access) {
    try {
      await stagingRequest("auth/logout/", {
        method: "POST",
        body: JSON.stringify({}),
        accessToken: access,
      });
    } catch {
      /* ignore */
    }
  }
  await clearSessionTokens();
  return NextResponse.json({ ok: true });
}

export async function handleStagingPost(path: string, body: unknown, requireAuth = false) {
  const { access } = await getSessionTokens();
  if (requireAuth && !access) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const response = await stagingRequest(path, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
    accessToken: access ?? undefined,
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: await parseStagingError(response) },
      { status: response.status },
    );
  }

  const text = await response.text();
  if (!text) {
    return NextResponse.json({ ok: true });
  }

  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ ok: true });
  }
}
