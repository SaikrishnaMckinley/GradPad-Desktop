/** Grad Pad Django API (same as gradpad-web staging). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/?$/, "/") ??
  "https://api-staging.gradpad.io/api/";

/** Desktop always targets the Django API (env overrides default staging URL). */
export function isGradPadApiMode(): boolean {
  return true;
}
