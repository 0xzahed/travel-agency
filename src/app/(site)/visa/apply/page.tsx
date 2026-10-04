import { Suspense } from "react";
import type { Metadata } from "next";
import { VisaApply } from "./visa-apply";

export const metadata: Metadata = { title: "Apply for a visa" };

export default function VisaApplyPage() {
  return (
    <Suspense>
      <VisaApply />
    </Suspense>
  );
}
