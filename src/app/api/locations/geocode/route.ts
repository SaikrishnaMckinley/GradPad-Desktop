import { NextResponse } from "next/server";
import { serverFetchJson } from "@/lib/api/server-fetch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim();
  const placeId = searchParams.get("place_id")?.trim();

  if (!address && !placeId) {
    return NextResponse.json({ error: "address or place_id required" }, { status: 400 });
  }

  const qs = new URLSearchParams();
  if (placeId) qs.set("place_id", placeId);
  else if (address) qs.set("address", address);

  const result = await serverFetchJson<unknown>(`locations/google/geocode/?${qs}`);
  if (!result.ok) {
    return NextResponse.json({ error: "Geocode failed" }, { status: result.status });
  }
  return NextResponse.json(result.data ?? {});
}
