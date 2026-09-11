import { currentUser } from "@clerk/nextjs/server";

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

/** Server-side admin check based on the signed-in Clerk user's email. */
export async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;
  const emails = user.emailAddresses.map((e) => e.emailAddress);
  return emails.some((e) => emailIsAdmin(e));
}
