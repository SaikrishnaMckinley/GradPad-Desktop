import { handleStagingPost } from "@/lib/auth/api-routes";

export async function POST(request: Request) {
  const body = await request.json();
  return handleStagingPost("auth/signup/", body);
}
