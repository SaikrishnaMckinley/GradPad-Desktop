import { NextResponse } from "next/server";
import { serverFetchJson } from "@/lib/api/server-fetch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input")?.trim();
  if (!input || input.length < 3) {
    return NextResponse.json({ predictions: [] });
  }

  const qs = new URLSearchParams({ input, country: "us" });
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  if (lat && lng) {
    qs.set("lat", lat);
    qs.set("lng", lng);
    qs.set("radius", searchParams.get("radius") ?? "50000");
  }

  const result = await serverFetchJson<unknown>(`locations/google/autocomplete/?${qs}`);
  if (!result.ok) {
    return NextResponse.json({ predictions: [] }, { status: result.status });
  }
  return NextResponse.json(result.data ?? { predictions: [] });
}
