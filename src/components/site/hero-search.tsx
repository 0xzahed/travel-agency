"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, CalendarDays, Compass, FileCheck2, Globe2, MapPin, Plane, Search, Tag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { visaCountries } from "@/lib/data/visa";
import { Button } from "@/components/ui/button";

type Tab = "tours" | "destinations" | "flights" | "hotels" | "visa";
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "tours", label: "Tours", icon: <Compass /> },
  { id: "destinations", label: "Destinations", icon: <Globe2 /> },
  { id: "flights", label: "Flights", icon: <Plane /> },
  { id: "hotels", label: "Hotels", icon: <BedDouble /> },
  { id: "visa", label: "Visa", icon: <FileCheck2 /> },
];
const TYPES = ["Adventure", "Family", "Honeymoon", "Luxury", "Religious", "Cultural", "Beach", "City Tour"];

function Cell({ label, icon, children, className }: { label: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("group flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-slate-50 focus-within:bg-slate-50", className)}>
      <span className="mt-0.5 text-secondary [&_svg]:size-[18px]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
        {children}
      </span>
    </label>
  );
}

const fieldCls = "mt-0.5 w-full appearance-none bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-slate-400 placeholder:font-normal";

export function HeroSearch() {
  const router = useRouter();
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>("tours");
  const [dest, setDest] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");
  const [type, setType] = useState("");
  const [region, setRegion] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [country, setCountry] = useState("uae");
  const [visaType, setVisaType] = useState("Tourist");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (tab === "tours") {
      if (dest) p.set("destination", dest);
      if (type) p.set("type", type);
      if (date) p.set("date", date);
      if (guests) p.set("guests", guests);
      router.push(`/tours?${p}`);
    } else if (tab === "destinations") {
      router.push(`/destinations${region ? `?region=${encodeURIComponent(region)}` : ""}`);
    } else if (tab === "visa") {
      router.push(`/visa/apply?country=${country}&type=${visaType}`);
    } else {
      p.set("topic", tab);
      if (from) p.set("from", from);
      if (to) p.set("to", to);
      if (date) p.set("date", date);
      router.push(`/contact?${p}`);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="w-full rounded-[18px] bg-white p-2 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.25)] ring-1 ring-black/5">
      <div role="tablist" aria-label="Search type" className="scrollbar-none flex gap-1 overflow-x-auto border-b border-line px-2 pt-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 px-3.5 pb-3 pt-2 text-sm font-medium transition-colors [&_svg]:size-4",
              tab === t.id ? "text-primary" : "text-muted hover:text-ink",
            )}
          >
            {t.icon}
            {t.label}
            {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-1 p-2 lg:flex-row lg:items-center">
        {tab === "tours" && (
          <>
            <Cell label="Destination" icon={<MapPin />}>
              <select value={dest} onChange={(e) => setDest(e.target.value)} className={fieldCls} aria-label="Destination">
                <option value="">Where to?</option>
                {state.destinations.map((d) => (
                  <option key={d.id} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Cell>
            <Divider />
            <Cell label="Travel date" icon={<CalendarDays />}>
              <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls} aria-label="Travel date" />
            </Cell>
            <Divider />
            <Cell label="Guests" icon={<Users />} className="lg:max-w-40">
              <select value={guests} onChange={(e) => setGuests(e.target.value)} className={fieldCls} aria-label="Guests">
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </Cell>
            <Divider />
            <Cell label="Tour type" icon={<Tag />}>
              <select value={type} onChange={(e) => setType(e.target.value)} className={fieldCls} aria-label="Tour type">
                <option value="">Any type</option>
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Cell>
          </>
        )}
        {tab === "destinations" && (
          <Cell label="Region" icon={<Globe2 />}>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className={fieldCls} aria-label="Region">
              <option value="">All regions</option>
              {["Asia", "Europe", "Middle East", "Africa"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Cell>
        )}
        {(tab === "flights" || tab === "hotels") && (
          <>
            {tab === "flights" && (
              <>
                <Cell label="From" icon={<Plane />}>
                  <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="City or airport" className={fieldCls} aria-label="Departure city" />
                </Cell>
                <Divider />
              </>
            )}
            <Cell label={tab === "flights" ? "To" : "City or hotel"} icon={<MapPin />}>
              <input value={to} onChange={(e) => setTo(e.target.value)} placeholder={tab === "flights" ? "Where to?" : "e.g. Dubai Marina"} className={fieldCls} aria-label="Destination" />
            </Cell>
            <Divider />
            <Cell label={tab === "flights" ? "Departure" : "Check-in"} icon={<CalendarDays />}>
              <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls} aria-label="Date" />
            </Cell>
            <Divider />
            <Cell label="Travellers" icon={<Users />} className="lg:max-w-40">
              <select value={guests} onChange={(e) => setGuests(e.target.value)} className={fieldCls} aria-label="Travellers">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Adult" : "Adults"}
                  </option>
                ))}
              </select>
            </Cell>
          </>
        )}
        {tab === "visa" && (
          <>
            <Cell label="Destination country" icon={<Globe2 />}>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={fieldCls} aria-label="Country">
                {visaCountries.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </Cell>
            <Divider />
            <Cell label="Visa type" icon={<FileCheck2 />}>
              <select value={visaType} onChange={(e) => setVisaType(e.target.value)} className={fieldCls} aria-label="Visa type">
                {(visaCountries.find((v) => v.id === country)?.types ?? []).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Cell>
          </>
        )}
        <Button type="submit" variant="primary" size="lg" className="mt-2 h-14 px-7 lg:mt-0 lg:ml-2">
          <Search />
          {tab === "tours" ? "Search Tours" : tab === "destinations" ? "Explore" : tab === "visa" ? "Start Application" : "Get a Quote"}
        </Button>
      </form>
    </div>
  );
}

function Divider() {
  return <span className="hidden h-10 w-px bg-line lg:block" aria-hidden />;
}
