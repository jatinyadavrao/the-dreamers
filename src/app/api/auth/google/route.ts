import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { googleConfig, GOOGLE_AUTH_URL } from "@/lib/google";

export async function GET(req: Request) {
  const { clientId, redirectUri } = googleConfig();
  const next = new URL(req.url).searchParams.get("next") || "/companies";
  const state = randomBytes(16).toString("hex");
  const secure = process.env.NODE_ENV === "production";

  const store = await cookies();
  store.set("g_state", state, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 600 });
  store.set("g_next", next, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 600 });

  const auth = new URL(GOOGLE_AUTH_URL);
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", state);
  auth.searchParams.set("prompt", "select_account");
  auth.searchParams.set("access_type", "online");

  return NextResponse.redirect(auth.toString());
}
