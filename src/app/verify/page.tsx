import { Suspense } from "react";
import { VerifyForm } from "@/components/verify-form";

export const metadata = { title: "Verify email · The Dreamers" };

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
