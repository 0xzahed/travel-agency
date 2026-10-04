import { Suspense } from "react";
import type { Metadata } from "next";
import { IMG } from "@/lib/data/images";
import { PageHero } from "@/components/site/page-hero";
import { DestinationGrid } from "./destination-grid";

export const metadata: Metadata = { title: "Destinations" };

export default function DestinationsPage() {
  return (
    <>
      <PageHero image={IMG.santoriniView} eyebrow="Destinations" title="100+ places, one trusted team." description="Explore by region. Every destination is planned by a specialist who has been there — recently." />
      <Suspense>
        <DestinationGrid />
      </Suspense>
    </>
  );
}
