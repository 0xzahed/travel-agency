import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/states";
import { BookingsAdmin } from "./bookings-admin";

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <BookingsAdmin />
    </Suspense>
  );
}
