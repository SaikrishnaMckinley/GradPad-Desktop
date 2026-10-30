import { NextResponse } from "next/server";
import { serverFetchPost } from "@/lib/api/server-fetch";

type CreateLocationBody = {
  address?: string;
  description?: string;
  place_id?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export async function POST(request: Request) {
  let body: CreateLocationBody;
  try {
    body = (await request.json()) as CreateLocationBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const description = body.description?.trim() || body.address?.trim();
  if (!description) {
    return NextResponse.json({ error: "Location description is required" }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
    address: body.address?.trim() || description,
    description,
  };
  if (body.place_id?.trim()) payload.place_id = body.place_id.trim();
  if (typeof body.latitude === "number" && !Number.isNaN(body.latitude)) {
    payload.latitude = body.latitude;
  }
  if (typeof body.longitude === "number" && !Number.isNaN(body.longitude)) {
    payload.longitude = body.longitude;
  }

  const result = await serverFetchPost<Record<string, unknown>>("locations/", payload);
  if (!result.ok || !result.data) {
    return NextResponse.json(
      { error: "Could not save location" },
      { status: result.status || 400 },
    );
  }
  return NextResponse.json(result.data);
}
