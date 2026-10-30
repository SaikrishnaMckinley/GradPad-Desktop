import { handleAuthLogin } from "@/lib/auth/api-routes";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  return handleAuthLogin(body);
}
