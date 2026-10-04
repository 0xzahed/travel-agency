import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/states";
import { VisaAdmin } from "./visa-admin";

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <VisaAdmin />
    </Suspense>
  );
}
