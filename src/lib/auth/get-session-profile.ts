import { getApiSessionProfile } from "@/lib/auth/get-api-session-profile";

export type SessionProfile = {
  id: string;
  fullName: string;
  username: string | null;
  headline: string | null;
  avatarUrl: string | null;
};

export async function getSessionProfile(): Promise<SessionProfile | null> {
  return getApiSessionProfile();
}
