import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PromoBanner } from "@/components/site/sections";
import { CardSkeleton } from "@/components/ui/states";
import { TourBrowser } from "./tour-browser";

export const metadata: Metadata = { title: "Tour Packages", description: "Browse handcrafted tour packages across Asia, Europe, the Middle East and Africa." };

export default function ToursPage() {
  return (
    <div className="pt-16 md:pt-[76px]">
      <PromoBanner placement="Tours" />
      <div className="border-b border-line bg-white">
        <div className="container-x py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-sm text-muted">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-ink">Tours</span>
          </nav>
          <h1 className="text-3xl font-bold md:text-[44px]">Find your next journey</h1>
          <p className="mt-3 max-w-2xl text-muted md:text-lg">Small groups, expert guides and hand-picked hotels — filter by destination, budget, style and dates.</p>
        </div>
      </div>
      <div className="pt-8">
        <Suspense
          fallback={
            <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <TourBrowser />
        </Suspense>
      </div>
    </div>
  );
}
