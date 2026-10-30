"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "gradpad_access_token";

/** Server-side sign out (e.g. from Server Components). Prefer client signOut in UI. */
export async function signOutServer() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}
