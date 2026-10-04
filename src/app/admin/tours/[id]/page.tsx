"use client";

import { use } from "react";
import { Compass } from "lucide-react";
import { useStore } from "@/lib/store";
import { TourForm } from "@/components/admin/tour-form";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/primitives";
import { ErrorState } from "@/components/ui/states";

export default function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, hydrated } = useStore();
  if (!hydrated) return <Skeleton className="h-96" />;
  const tour = state.tours.find((t) => t.id === id);
  if (!tour) return <ErrorState icon={<Compass />} title="Tour not found" description="It may have been deleted." actions={<ButtonLink href="/admin/tours">All tours</ButtonLink>} />;
  return <TourForm key={tour.id} initial={tour} />;
}
