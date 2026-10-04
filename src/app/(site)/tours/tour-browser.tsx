"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, MapPin, SearchX, SlidersHorizontal, X } from "lucide-react";
import type { TourType } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Radio, Select } from "@/components/ui/field";
import { Drawer } from "@/components/ui/overlay";
import { CardSkeleton, EmptyState } from "@/components/ui/states";
import { Pagination, RangeSlider } from "@/components/ui/widgets";
import { TourCard, TourListCard } from "@/components/site/cards";

const TYPES: TourType[] = ["Adventure", "Family", "Honeymoon", "Luxury", "Religious", "Cultural", "Beach", "City Tour"];
const DURATIONS = [
  { id: "1-3", label: "1–3 Days", test: (d: number) => d <= 3 },
  { id: "4-7", label: "4–7 Days", test: (d: number) => d >= 4 && d <= 7 },
  { id: "8-14", label: "8–14 Days", test: (d: number) => d >= 8 && d <= 14 },
  { id: "15+", label: "15+ Days", test: (d: number) => d >= 15 },
];
const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];
const PRICE_MAX = 3000;
const PER_PAGE = 9;

export function TourBrowser() {
  const { state } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [destination, setDestination] = useState(params.get("destination") ?? "");
  const [destQuery, setDestQuery] = useState("");
  const [price, setPrice] = useState<[number, number]>([0, PRICE_MAX]);
  const [durations, setDurations] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>(params.get("type") ? [params.get("type")!] : []);
  const [rating, setRating] = useState("");
  const [date, setDate] = useState(params.get("date") ?? "");
  const [sort, setSort] = useState("recommended");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [paging, setPaging] = useState({ key: "", page: 1 });
  const [drawer, setDrawer] = useState(false);
  const [loadedKey, setLoadedKey] = useState("");

  // Keep URL in sync for shareable filters (destination + type only).
  useEffect(() => {
    const p = new URLSearchParams();
    if (destination) p.set("destination", destination);
    if (types.length === 1) p.set("type", types[0]);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [destination, types, pathname, router]);

  // Brief skeleton when results change — mirrors a real network fetch.
  const filterKey = JSON.stringify([destination, price, durations, types, rating, date, sort]);
  useEffect(() => {
    const t = setTimeout(() => setLoadedKey(filterKey), 350);
    return () => clearTimeout(t);
  }, [filterKey]);
  const loading = loadedKey !== filterKey;
  // Page resets to 1 whenever filters change.
  const page = paging.key === filterKey ? paging.page : 1;
  const setPage = (p: number) => setPaging({ key: filterKey, page: p });

  const results = useMemo(() => {
    const destId = state.destinations.find((d) => d.slug === destination)?.id;
    let list = state.tours.filter((t) => t.status === "published");
    if (destId) list = list.filter((t) => t.destinationId === destId);
    list = list.filter((t) => t.price >= price[0] && (price[1] >= PRICE_MAX || t.price <= price[1]));
    if (durations.length) list = list.filter((t) => DURATIONS.some((d) => durations.includes(d.id) && d.test(t.days)));
    if (types.length) list = list.filter((t) => types.includes(t.type));
    if (rating) list = list.filter((t) => t.rating >= Number(rating));
    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "rating":
        return [...list].sort((a, b) => b.rating - a.rating);
      case "newest":
        return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      default:
        return [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || b.bookings - a.bookings);
    }
  }, [state.tours, state.destinations, destination, price, durations, types, rating, sort]);

  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const shown = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeCount = (destination ? 1 : 0) + (price[0] > 0 || price[1] < PRICE_MAX ? 1 : 0) + durations.length + types.length + (rating ? 1 : 0) + (date ? 1 : 0);

  const clear = () => {
    setDestination("");
    setPrice([0, PRICE_MAX]);
    setDurations([]);
    setTypes([]);
    setRating("");
    setDate("");
  };
  const toggle = (arr: string[], v: string, set: (x: string[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const destOptions = state.destinations.filter((d) => d.name.toLowerCase().includes(destQuery.toLowerCase()));

  const filters = (
    <div className="space-y-7">
      <FilterGroup title="Destination">
        <Input placeholder="Search destinations" value={destQuery} onChange={(e) => setDestQuery(e.target.value)} icon={<MapPin />} aria-label="Search destinations" />
        <div className="mt-3 max-h-56 space-y-2.5 overflow-y-auto pr-1">
          <Radio name="dest" value="" checked={destination === ""} onChange={setDestination} label="All destinations" />
          {destOptions.map((d) => (
            <Radio key={d.id} name="dest" value={d.slug} checked={destination === d.slug} onChange={setDestination} label={d.name} />
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Price range">
        <RangeSlider min={0} max={PRICE_MAX} step={50} value={price} onChange={setPrice} format={(n) => (n >= PRICE_MAX ? `${formatMoney(n)}+` : formatMoney(n))} />
      </FilterGroup>
      <FilterGroup title="Duration">
        <div className="space-y-2.5">
          {DURATIONS.map((d) => (
            <Checkbox key={d.id} checked={durations.includes(d.id)} onChange={() => toggle(durations, d.id, setDurations)} label={d.label} />
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Tour type">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const on = types.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(types, t, setTypes)}
                className={cn("rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors", on ? "border-primary bg-primary text-white" : "border-line bg-white text-ink hover:border-slate-300")}
              >
                {t}
              </button>
            );
          })}
        </div>
      </FilterGroup>
      <FilterGroup title="Rating">
        <div className="space-y-2.5">
          {[
            ["", "Any rating"],
            ["4.9", "5 Star"],
            ["4", "4+ Star"],
            ["3", "3+ Star"],
          ].map(([v, l]) => (
            <Radio key={v} name="rating" value={v} checked={rating === v} onChange={setRating} label={l} />
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Availability">
        <Input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} aria-label="Travel date" />
        <p className="mt-2 text-xs text-muted">Departures run daily — we&apos;ll confirm seats at checkout.</p>
      </FilterGroup>
    </div>
  );

  return (
    <div className="container-x pb-24">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 rounded-2xl border border-line bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold">Filters</h2>
              {activeCount > 0 && (
                <button onClick={clear} className="text-sm font-medium text-secondary hover:text-primary">
                  Clear all ({activeCount})
                </button>
              )}
            </div>
            {filters}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              <span className="font-semibold text-ink">{results.length}</span> tours found
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setDrawer(true)}>
                <SlidersHorizontal /> Filters {activeCount > 0 && <span className="rounded-full bg-primary px-1.5 text-[11px] text-white">{activeCount}</span>}
              </Button>
              <Select options={SORTS} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort tours" className="h-9 w-48" />
              <div className="hidden rounded-[10px] border border-line bg-white p-0.5 sm:flex" role="group" aria-label="View">
                {(["grid", "list"] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)} aria-pressed={view === v} aria-label={`${v} view`} className={cn("grid size-8 place-items-center rounded-lg", view === v ? "bg-primary-50 text-primary" : "text-muted hover:text-ink")}>
                    {v === "grid" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeCount > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {destination && <Chip onRemove={() => setDestination("")}>{state.destinations.find((d) => d.slug === destination)?.name}</Chip>}
              {types.map((t) => (
                <Chip key={t} onRemove={() => toggle(types, t, setTypes)}>
                  {t}
                </Chip>
              ))}
              {durations.map((d) => (
                <Chip key={d} onRemove={() => toggle(durations, d, setDurations)}>
                  {DURATIONS.find((x) => x.id === d)?.label}
                </Chip>
              ))}
              {(price[0] > 0 || price[1] < PRICE_MAX) && <Chip onRemove={() => setPrice([0, PRICE_MAX])}>{`${formatMoney(price[0])} – ${formatMoney(price[1])}`}</Chip>}
              {rating && <Chip onRemove={() => setRating("")}>{rating}+ stars</Chip>}
              {date && <Chip onRemove={() => setDate("")}>From {date}</Chip>}
            </div>
          )}

          {loading ? (
            <div className={cn("grid gap-6", view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "")}>
              {Array.from({ length: 6 }, (_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white">
              <EmptyState
                icon={<SearchX />}
                title="No tours match these filters"
                description="Try widening your price range or removing a filter. Our specialists can also build a custom trip for you."
                action={
                  <>
                    <Button onClick={clear}>Clear filters</Button>
                    <Button variant="outline" onClick={() => router.push("/contact?topic=plan")}>
                      Request a custom tour
                    </Button>
                  </>
                }
              />
            </div>
          ) : view === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((t, i) => (
                <TourCard key={t.id} tour={t} priority={i < 3} />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {shown.map((t) => (
                <TourListCard key={t.id} tour={t} />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            pages={pages}
            onChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="mt-12"
          />
        </div>
      </div>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        side="bottom"
        title="Filters"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={clear}>
              Clear all
            </Button>
            <Button className="flex-1" onClick={() => setDrawer(false)}>
              Show {results.length} tours
            </Button>
          </div>
        }
      >
        {filters}
      </Drawer>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-ink">{title}</legend>
      {children}
    </fieldset>
  );
}

function Chip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary-100 bg-primary-50 py-1 pl-2.5 pr-1.5 text-[13px] font-medium text-primary">
      {children}
      <button onClick={onRemove} aria-label={`Remove filter`} className="grid size-5 place-items-center rounded hover:bg-primary-100">
        <X className="size-3.5" />
      </button>
    </span>
  );
}
