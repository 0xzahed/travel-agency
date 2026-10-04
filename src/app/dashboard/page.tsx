import { Suspense } from "react";
import { Overview } from "./overview";

export default function DashboardPage() {
  return (
    <Suspense>
      <Overview />
    </Suspense>
  );
}
