import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "td_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionPayload = { userId: string; email: string; name: string };

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not defined. Add it to .env.local");
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}

/** Read and verify the current session from the request cookie. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Set the session cookie (only valid inside a route handler / server action). */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
