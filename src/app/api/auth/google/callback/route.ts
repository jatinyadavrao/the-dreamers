import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signSession, setSessionCookie } from "@/lib/session";
import { googleConfig, siteOrigin, GOOGLE_TOKEN_URL, GOOGLE_USERINFO_URL } from "@/lib/google";

export async function GET(req: Request) {
  const origin = siteOrigin();
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/sign-in?error=${reason}`, origin));

  const { clientId, clientSecret, redirectUri } = googleConfig();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const savedState = store.get("g_state")?.value;
  const next = store.get("g_next")?.value || "/companies";
  store.delete("g_state");
  store.delete("g_next");

  if (url.searchParams.get("error")) return fail("google_denied");
  if (!code || !state || state !== savedState) return fail("google_state");

  // Exchange the code for tokens.
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  }).catch(() => null);
  const tokens = tokenRes ? await tokenRes.json().catch(() => ({})) : {};
  if (!tokens.access_token) return fail("google_token");

  // Fetch the user's profile.
  const infoRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  }).catch(() => null);
  const info = infoRes ? await infoRes.json().catch(() => ({})) : {};
  const email = String(info.email ?? "").toLowerCase();
  if (!email) return fail("google_email");

  await connectDB();
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      name: info.name ?? "",
      image: info.picture ?? "",
      provider: "google",
      emailVerified: true,
    });
  } else {
    // Link Google to an existing account and mark verified.
    user.emailVerified = true;
    if (!user.name && info.name) user.name = info.name;
    if (info.picture) user.image = info.picture;
    await user.save();
  }

  const token = await signSession({ userId: String(user._id), email: user.email, name: user.name });
  await setSessionCookie(token);

  return NextResponse.redirect(new URL(next, origin));
}
