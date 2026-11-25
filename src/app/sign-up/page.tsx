import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthAside, AuthShell } from "@/components/auth-shell";

export const metadata = { title: "Create your account" };

export default function Page() {
  return (
    <AuthShell aside={<AuthAside />}>
      <Suspense>
        <AuthForm mode="sign-up" />
      </Suspense>
    </AuthShell>
  );
}
