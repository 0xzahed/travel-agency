import { Suspense } from "react";
import type { Metadata } from "next";
import { tours } from "@/lib/data/tours";
import { BookingFlow } from "./booking-flow";

export const metadata: Metadata = { title: "Book your tour" };

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.slug }));
}

export default async function BookPage({ params }: PageProps<"/tours/[slug]/book">) {
  const { slug } = await params;
  return (
    <Suspense>
      <BookingFlow slug={slug} />
    </Suspense>
  );
}
