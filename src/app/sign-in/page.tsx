import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthAside, AuthShell } from "@/components/auth-shell";

export const metadata = { title: "Sign in" };

export default function Page() {
  return (
    <AuthShell aside={<AuthAside />}>
      <Suspense>
        <AuthForm mode="sign-in" />
      </Suspense>
    </AuthShell>
  );
}
