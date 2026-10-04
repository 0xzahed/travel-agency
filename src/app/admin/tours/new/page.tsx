"use client";

import { useStore } from "@/lib/store";
import { TourForm } from "@/components/admin/tour-form";
import { Skeleton } from "@/components/ui/primitives";

export default function NewTourPage() {
  const { hydrated } = useStore();
  if (!hydrated) return <Skeleton className="h-96" />;
  return <TourForm />;
}
