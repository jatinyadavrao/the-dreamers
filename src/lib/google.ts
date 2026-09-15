import "server-only";

export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export function googleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth is not configured (GOOGLE_CLIENT_ID / SECRET / REDIRECT_URI).");
  }
  return { clientId, clientSecret, redirectUri };
}

/** Canonical site origin, derived from the registered redirect URI. */
export function siteOrigin(): string {
  return new URL(googleConfig().redirectUri).origin;
}
