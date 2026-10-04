"use client";

import Link from "next/link";
import { Baby, Building2, Compass, Crown, Heart, Landmark, Mountain, Palmtree } from "lucide-react";
import { useStore } from "@/lib/store";
import type { TourType } from "@/lib/types";
import { Card, PageHeader } from "@/components/ui/primitives";

const META: Record<TourType, { icon: React.ReactNode; desc: string }> = {
  Adventure: { icon: <Mountain />, desc: "Hiking, safaris and active trips" },
  Family: { icon: <Baby />, desc: "Kid-friendly pacing and rooms" },
  Honeymoon: { icon: <Heart />, desc: "Romantic stays for couples" },
  Luxury: { icon: <Crown />, desc: "Five-star hotels and private guides" },
  Religious: { icon: <Landmark />, desc: "Pilgrimages and heritage sites" },
  Cultural: { icon: <Compass />, desc: "History, food and local life" },
  Beach: { icon: <Palmtree />, desc: "Islands, coasts and resorts" },
  "City Tour": { icon: <Building2 />, desc: "Short urban breaks" },
};

export default function CategoriesPage() {
  const { state } = useStore();
  return (
    <>
      <PageHeader title="Tour categories" description="Categories power the filters on the public tour listing." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(META) as TourType[]).map((c) => {
          const tours = state.tours.filter((t) => t.type === c);
          return (
            <Card key={c} className="p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-primary-50 text-primary [&_svg]:size-5">{META[c].icon}</span>
              <h2 className="mt-4 font-semibold">{c}</h2>
              <p className="mt-1 text-sm text-muted">{META[c].desc}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
                <span>
                  <span className="font-semibold">{tours.length}</span> <span className="text-muted">tours</span>
                </span>
                <Link href={`/tours?type=${encodeURIComponent(c)}`} target="_blank" className="font-medium text-secondary hover:underline">
                  View on site
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
