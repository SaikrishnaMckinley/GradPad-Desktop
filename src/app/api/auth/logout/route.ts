import { handleAuthLogout } from "@/lib/auth/api-routes";

export async function POST() {
  return handleAuthLogout();
}
