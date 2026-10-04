"use client";

import { useMemo } from "react";
import { BookOpen, Compass, FileCheck2, MapPin } from "lucide-react";
import { useStore } from "@/lib/store";
import { visaCountries } from "@/lib/data/visa";
import { formatMoney } from "@/lib/utils";
import { CommandPalette, type CommandGroup } from "@/components/shared/command-palette";

export function SiteSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useStore();
  const groups = useMemo<CommandGroup[]>(
    () => [
      {
        label: "Tours",
        items: state.tours
          .filter((t) => t.status === "published")
          .map((t) => ({ id: t.id, label: t.title, sub: `${t.location} · ${t.days} days · from ${formatMoney(t.price)}`, icon: <Compass />, href: `/tours/${t.slug}`, keywords: `${t.country} ${t.type}` })),
      },
      {
        label: "Destinations",
        items: state.destinations.map((d) => ({ id: d.id, label: d.name, sub: d.description, icon: <MapPin />, href: `/tours?destination=${d.slug}`, keywords: `${d.country} ${d.region}` })),
      },
      {
        label: "Visa services",
        items: visaCountries.map((v) => ({ id: `visa-${v.id}`, label: `${v.name} visa`, sub: `${v.processing} · from ${formatMoney(v.fromPrice)}`, icon: <FileCheck2 />, href: `/visa/apply?country=${v.id}` })),
      },
      {
        label: "Travel guide",
        items: state.blog.filter((b) => b.published).map((b) => ({ id: b.id, label: b.title, sub: b.category, icon: <BookOpen />, href: `/blog/${b.slug}` })),
      },
    ],
    [state.tours, state.destinations, state.blog],
  );
  return <CommandPalette open={open} onClose={onClose} groups={groups} placeholder="Search tours, destinations, visas…" />;
}
