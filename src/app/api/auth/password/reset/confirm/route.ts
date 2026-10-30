import { handleStagingPost } from "@/lib/auth/api-routes";

export async function POST(request: Request) {
  const body = await request.json();
  return handleStagingPost("account/password/reset/confirm/", body);
}
