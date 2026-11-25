import { Suspense } from "react";
import { VerifyForm } from "@/components/verify-form";
import { AuthAside, AuthShell } from "@/components/auth-shell";

export const metadata = { title: "Verify your email" };

export default function Page() {
  return (
    <AuthShell aside={<AuthAside />}>
      <Suspense>
        <VerifyForm />
      </Suspense>
    </AuthShell>
  );
}
