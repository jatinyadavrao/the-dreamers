import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/");
  return <>{children}</>;
}
