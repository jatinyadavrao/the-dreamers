import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign in · The Dreamers" };

export default function SignInPage() {
  return (
    <Suspense>
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
