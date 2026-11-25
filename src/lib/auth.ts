import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function emailIsAdmin(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/** The signed-in user (from the session cookie), or null. */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  return getSession();
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSession();
  return emailIsAdmin(user?.email);
}

/** Require a signed-in user or redirect to sign-in. */
export async function requireUser(next?: string): Promise<SessionPayload> {
  const user = await getSession();
  if (!user) redirect(`/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

/** Require an admin user or redirect. */
export async function requireAdmin(): Promise<SessionPayload> {
  const user = await getSession();
  if (!user) redirect("/sign-in?next=/admin");
  if (!emailIsAdmin(user.email)) redirect("/");
  return user;
}

/** A path plus the named query values a page understands (where sign-in should bring the visitor back). */
export function withQuery(path: string, sp: Record<string, string | string[] | undefined>, keys: string[]): string {
  const q = new URLSearchParams();
  for (const k of keys) {
    const v = sp[k];
    const one = Array.isArray(v) ? v[0] : v;
    if (one) q.set(k, one);
  }
  const qs = q.toString();
  return qs ? `${path}?${qs}` : path;
}
