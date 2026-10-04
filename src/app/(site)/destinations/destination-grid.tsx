"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Tabs } from "@/components/ui/disclosure";
import { Reveal } from "@/components/ui/widgets";
import { DestinationCard } from "@/components/site/cards";

const REGIONS = ["All", "Asia", "Europe", "Middle East", "Africa"] as const;

export function DestinationGrid() {
  const { state } = useStore();
  const params = useSearchParams();
  const initial = (REGIONS as readonly string[]).includes(params.get("region") ?? "") ? (params.get("region") as (typeof REGIONS)[number]) : "All";
  const [region, setRegion] = useState<(typeof REGIONS)[number]>(initial);
  const list = state.destinations.filter((d) => region === "All" || d.region === region);

  return (
    <section className="container-x py-14 md:py-20">
      <Tabs
        variant="pill"
        value={region}
        onChange={setRegion}
        tabs={REGIONS.map((r) => ({ value: r, label: r, count: r === "All" ? state.destinations.length : state.destinations.filter((d) => d.region === r).length }))}
        className="mb-10 w-fit max-w-full"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((d, i) => (
          <Reveal key={d.id} delay={(i % 4) * 0.05}>
            <DestinationCard d={d} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
