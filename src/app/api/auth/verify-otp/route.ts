import { NextResponse } from "next/server";
import {
  extractAuthTokens,
  parseStagingError,
  stagingRequest,
} from "@/lib/api/staging-request";
import { setSessionTokens } from "@/lib/auth/session-cookies";

export async function POST(request: Request) {
  const body = await request.json();
  const response = await stagingRequest("auth/verify-otp/", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: await parseStagingError(response) },
      { status: response.status },
    );
  }

  const data = (await response.json()) as Record<string, unknown>;
  const { access, refresh } = extractAuthTokens(data);
  if (access) {
    await setSessionTokens(access, refresh);
  }

  return NextResponse.json({ ok: true, access: access ?? null, refresh: refresh ?? null });
}
