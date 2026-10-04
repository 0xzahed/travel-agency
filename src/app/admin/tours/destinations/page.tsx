"use client";

import Image from "next/image";
import { useStore } from "@/lib/store";
import { formatMoney, img } from "@/lib/utils";
import { Card, PageHeader } from "@/components/ui/primitives";
import { Switch } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function DestinationsAdmin() {
  const { state, actions } = useStore();
  const toast = useToast();
  return (
    <>
      <PageHeader title="Destinations" description="Featured destinations appear on the homepage grid." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {state.destinations.map((d) => (
          <Card key={d.id} className="overflow-hidden">
            <div className="relative aspect-[16/8]">
              <Image src={img(d.image, 600)} alt={d.name} fill sizes="400px" className="object-cover" />
              <Badge tone="neutral" className="absolute left-3 top-3 bg-white">
                {d.region}
              </Badge>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{d.name}</h2>
                  <p className="text-sm text-muted">
                    {state.tours.filter((t) => t.destinationId === d.id).length} tours · from {formatMoney(d.fromPrice)}
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t border-line pt-4">
                <Switch
                  label="Featured on homepage"
                  checked={d.featured}
                  onChange={() => {
                    actions.toggleFeaturedDestination(d.id);
                    toast({ title: d.featured ? `${d.name} removed from homepage` : `${d.name} featured on homepage` });
                  }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
