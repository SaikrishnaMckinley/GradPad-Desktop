/** Returns true if the JWT payload role is service_role (not anon). */
export function isServiceRoleJwt(key: string | undefined): boolean {
  if (!key?.includes(".")) return false;
  try {
    const payload = key.split(".")[1];
    if (!payload) return false;
    const json = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
        "utf8",
      ),
    ) as { role?: string };
    return json.role === "service_role";
  } catch {
    return false;
  }
}
