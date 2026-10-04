"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe2, Search, SearchX } from "lucide-react";
import { visaCountries } from "@/lib/data/visa";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { SectionHeader } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/states";
import { Reveal } from "@/components/ui/widgets";
import { VisaCard } from "@/components/site/cards";

export function VisaCountryPicker() {
  const router = useRouter();
  const [country, setCountry] = useState("uae");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/visa/apply?country=${country}`);
      }}
      className="flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row"
    >
      <label className="flex flex-1 items-center gap-3 px-3">
        <Globe2 className="size-5 shrink-0 text-secondary" />
        <span className="sr-only">Destination country</span>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="h-12 w-full bg-transparent text-[15px] font-medium outline-none">
          {visaCountries.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" size="lg" variant="accent">
        Start Application <ArrowRight />
      </Button>
      <ButtonLink href="/visa/track" size="lg" variant="outline">
        Track
      </ButtonLink>
    </form>
  );
}

export function VisaGrid() {
  const [q, setQ] = useState("");
  const list = visaCountries.filter((v) => v.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="py-20 md:py-24">
      <div className="container-x">
        <SectionHeader
          eyebrow="Countries we cover"
          title="Popular visa services"
          description="Transparent pricing that includes our service fee. Government fees are shown at checkout."
          action={<Input icon={<Search />} placeholder="Search country" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search country" wrapperClassName="w-full md:w-72" />}
        />
        {list.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((v, i) => (
              <Reveal key={v.id} delay={(i % 3) * 0.05}>
                <VisaCard v={v} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState icon={<SearchX />} title={`We don't list “${q}” yet`} description="Our specialists handle 40+ countries — ask us about yours." action={<ButtonLink href="/contact?topic=visa">Ask a visa expert</ButtonLink>} />
        )}
      </div>
    </section>
  );
}
