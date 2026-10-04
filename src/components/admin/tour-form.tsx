"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "framer-motion";
import { ArrowDown, ArrowUp, Check, ChevronLeft, GripVertical, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import type { ItineraryDay, Tour, TourType } from "@/lib/types";
import { IMG } from "@/lib/data/images";
import { cn, img, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/primitives";
import { Checkbox, Input, Select, Switch, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";

const TYPES: TourType[] = ["Adventure", "Family", "Honeymoon", "Luxury", "Religious", "Cultural", "Beach", "City Tour"];
const LIBRARY = Object.values(IMG);

type DayDraft = ItineraryDay & { key: string };

const blank = (id: string): Tour => ({
  id,
  slug: "",
  title: "",
  destinationId: "",
  country: "",
  location: "",
  type: "Cultural",
  days: 5,
  nights: 4,
  groupSize: 16,
  minTravelers: 2,
  price: 0,
  rating: 0,
  reviewCount: 0,
  image: "",
  gallery: [],
  shortDescription: "",
  description: "",
  highlights: [],
  included: [],
  excluded: [],
  requirements: [],
  cancellationPolicy: ["Free cancellation up to 30 days before departure", "50% refund between 29 and 14 days before departure", "No refund within 13 days of departure"],
  meetingPoint: "",
  itinerary: [{ day: 1, title: "Arrival", description: "", activities: [], meals: [] }],
  bookings: 0,
  status: "draft",
  featured: false,
  createdAt: new Date().toISOString().slice(0, 10),
});

const lines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

export function TourForm({ initial }: { initial?: Tour }) {
  const { state, actions } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [t, setT] = useState<Tour>(() => initial ?? blank(actions.newTourId()));
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [discount, setDiscount] = useState(initial?.oldPrice ? Math.round((1 - initial.price / initial.oldPrice) * 100) : 0);
  const [days, setDays] = useState<DayDraft[]>(() => t.itinerary.map((d, i) => ({ ...d, key: `d${i}-${d.day}` })));
  const [picker, setPicker] = useState<null | "cover" | "gallery">(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isNew = !initial;

  const set = <K extends keyof Tour>(k: K, v: Tour[K]) => setT((x) => ({ ...x, [k]: v }));

  const addDay = () => setDays((ds) => [...ds, { key: `d${Date.now()}`, day: ds.length + 1, title: "", description: "", activities: [], meals: [] }]);
  const updateDay = (key: string, patch: Partial<DayDraft>) => setDays((ds) => ds.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  const move = (i: number, dir: -1 | 1) =>
    setDays((ds) => {
      const j = i + dir;
      if (j < 0 || j >= ds.length) return ds;
      const copy = [...ds];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const save = (publish?: boolean) => {
    const e: Record<string, string> = {};
    if (t.title.trim().length < 4) e.title = "Title is required";
    if (!t.slug) e.slug = "Slug is required";
    else if (state.tours.some((x) => x.slug === t.slug && x.id !== t.id)) e.slug = "Slug already in use";
    if (!t.destinationId) e.destinationId = "Choose a destination";
    if (t.price <= 0) e.price = "Enter a price";
    if (t.minTravelers > t.groupSize) e.groupSize = "Max must be ≥ min";
    if (!t.image) e.image = "Add a cover image";
    if (t.shortDescription.length < 20) e.shortDescription = "At least 20 characters";
    if (days.some((d) => !d.title.trim())) e.itinerary = "Every day needs a title";
    setErrors(e);
    if (Object.keys(e).length) {
      toast({ title: "Please fix the highlighted fields", tone: "error" });
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const dest = state.destinations.find((d) => d.id === t.destinationId);
      const oldPrice = discount > 0 ? Math.round(t.price / (1 - discount / 100)) : undefined;
      const tour: Tour = {
        ...t,
        country: t.country || dest?.country || "",
        location: t.location || dest?.name || "",
        oldPrice,
        gallery: t.gallery.length ? t.gallery : [t.image],
        itinerary: days.map((d, i) => ({ day: i + 1, title: d.title, description: d.description, activities: d.activities, meals: d.meals, accommodation: d.accommodation, image: d.image })),
        nights: Math.max(0, t.days - 1),
        status: publish === undefined ? t.status : publish ? "published" : "draft",
      };
      actions.upsertTour(tour);
      setSaving(false);
      toast({ title: isNew ? "Tour created" : "Tour saved", description: tour.status === "published" ? "Live on the website." : "Saved as draft." });
      router.push("/admin/tours");
    }, 600);
  };

  return (
    <div className="pb-24">
      <Link href="/admin/tours" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> All tours
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-[28px]">{isNew ? "Add Tour" : `Edit: ${initial.title}`}</h1>
          <p className="mt-1 text-sm text-muted">{isNew ? "Create a new tour package." : `${t.id} · ${t.bookings} bookings`}</p>
        </div>
        {!isNew && (
          <Link href={`/tours/${t.slug}`} target="_blank" className="text-sm font-medium text-secondary hover:underline">
            View on site ↗
          </Link>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Basic information" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Input
                wrapperClassName="sm:col-span-2"
                label="Tour title"
                value={t.title}
                error={errors.title}
                required
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
              />
              <Input label="Slug" value={t.slug} error={errors.slug} hint={`/tours/${t.slug || "your-tour"}`} onChange={(e) => (setSlugTouched(true), set("slug", slugify(e.target.value)))} required />
              <Select label="Destination" value={t.destinationId} error={errors.destinationId} placeholder="Select destination" options={state.destinations.map((d) => ({ value: d.id, label: d.name }))} onChange={(e) => set("destinationId", e.target.value)} required />
              <Input label="Country" value={t.country} placeholder={state.destinations.find((d) => d.id === t.destinationId)?.country} onChange={(e) => set("country", e.target.value)} />
              <Select label="Category" value={t.type} options={TYPES} onChange={(e) => set("type", e.target.value as TourType)} />
              <Input label="Location label" value={t.location} placeholder="e.g. Ubud & Uluwatu, Bali" onChange={(e) => set("location", e.target.value)} />
              <Input label="Meeting point" value={t.meetingPoint} onChange={(e) => set("meetingPoint", e.target.value)} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Pricing & capacity" />
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <Input label="Duration (days)" type="number" min={1} value={t.days} onChange={(e) => set("days", Math.max(1, Number(e.target.value)))} />
              <Input label="Price (USD)" type="number" min={0} value={t.price || ""} error={errors.price} onChange={(e) => set("price", Number(e.target.value))} required />
              <Input label="Discount (%)" type="number" min={0} max={80} value={discount || ""} onChange={(e) => setDiscount(Math.min(80, Math.max(0, Number(e.target.value))))} hint={discount > 0 && t.price ? `Shows was $${Math.round(t.price / (1 - discount / 100))}` : undefined} />
              <Input label="Minimum travellers" type="number" min={1} value={t.minTravelers} onChange={(e) => set("minTravelers", Number(e.target.value))} />
              <Input label="Maximum travellers" type="number" min={1} value={t.groupSize} error={errors.groupSize} onChange={(e) => set("groupSize", Number(e.target.value))} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Images" description="Cover image and gallery (first 5 show on the tour page)" />
            <div className="space-y-5 p-5">
              <div>
                <p className="mb-2 text-sm font-medium">Cover image</p>
                {t.image ? (
                  <div className="group relative aspect-[16/7] overflow-hidden rounded-xl">
                    <Image src={img(t.image, 1200)} alt="Cover" fill sizes="800px" className="object-cover" />
                    <Button size="sm" variant="white" className="absolute right-3 top-3" onClick={() => setPicker("cover")}>
                      Change
                    </Button>
                  </div>
                ) : (
                  <button onClick={() => setPicker("cover")} aria-describedby={errors.image ? "cover-error" : undefined} className={cn("flex aspect-[16/7] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted hover:border-secondary", errors.image ? "border-danger" : "border-slate-300")}>
                    <ImagePlus className="size-6" /> Choose cover image
                  </button>
                )}
                {errors.image && <p id="cover-error" className="mt-1.5 text-xs text-danger">{errors.image}</p>}
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Gallery</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {t.gallery.map((g) => (
                    <div key={g} className="group relative aspect-square overflow-hidden rounded-lg">
                      <Image src={img(g, 300)} alt="" fill sizes="150px" className="object-cover" />
                      <button onClick={() => set("gallery", t.gallery.filter((x) => x !== g))} className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity group-hover:opacity-100 focus:opacity-100" aria-label="Remove image">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setPicker("gallery")} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-xs text-muted hover:border-secondary">
                    <Plus className="size-5" /> Add
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Descriptions" />
            <div className="space-y-4 p-5">
              <Textarea label="Short description" rows={2} value={t.shortDescription} error={errors.shortDescription} hint={`${t.shortDescription.length}/160 — shown on tour cards`} maxLength={160} onChange={(e) => set("shortDescription", e.target.value)} className="min-h-0" required />
              <Textarea label="Full description" rows={6} value={t.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Details" description="One item per line" />
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <Textarea label="Highlights" rows={5} value={t.highlights.join("\n")} onChange={(e) => set("highlights", lines(e.target.value))} />
              <Textarea label="Requirements" rows={5} value={t.requirements.join("\n")} onChange={(e) => set("requirements", lines(e.target.value))} />
              <Textarea label="Included" rows={5} value={t.included.join("\n")} onChange={(e) => set("included", lines(e.target.value))} />
              <Textarea label="Excluded" rows={5} value={t.excluded.join("\n")} onChange={(e) => set("excluded", lines(e.target.value))} />
              <Textarea wrapperClassName="md:col-span-2" label="Cancellation policy" rows={4} value={t.cancellationPolicy.join("\n")} onChange={(e) => set("cancellationPolicy", lines(e.target.value))} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Itinerary builder"
              description="Drag the handle (or use the arrows) to reorder days"
              action={
                <Button size="sm" variant="subtle" onClick={addDay}>
                  <Plus /> Add Day
                </Button>
              }
            />
            <div className="p-5">
              {errors.itinerary && <p className="mb-3 text-sm text-danger">{errors.itinerary}</p>}
              <Reorder.Group axis="y" values={days} onReorder={setDays} className="space-y-3">
                {days.map((d, i) => (
                  <DayEditor key={d.key} d={d} index={i} total={days.length} onChange={(p) => updateDay(d.key, p)} onMove={(dir) => move(i, dir)} onDelete={() => setDays(days.filter((x) => x.key !== d.key))} />
                ))}
              </Reorder.Group>
              <Button variant="outline" className="mt-4 w-full border-dashed" onClick={addDay}>
                <Plus /> Add Day {days.length + 1}
              </Button>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="sticky top-24 p-5">
            <p className="text-sm font-semibold">Publishing</p>
            <div className="mt-4 space-y-4">
              <Switch label="Published" description={t.status === "published" ? "Visible on the website" : "Saved as draft"} checked={t.status === "published"} onChange={(v) => set("status", v ? "published" : "draft")} />
              <Switch label="Featured" description="Show on the homepage" checked={t.featured} onChange={(v) => set("featured", v)} />
            </div>
            <div className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
              <Row label="Days" value={`${t.days}D / ${Math.max(0, t.days - 1)}N`} />
              <Row label="Itinerary days" value={String(days.length)} warn={days.length !== t.days} />
              <Row label="Gallery images" value={String(t.gallery.length)} />
            </div>
            {days.length !== t.days && <p className="mt-2 text-xs text-amber-700">Itinerary has {days.length} days but duration is {t.days}.</p>}
            <div className="mt-5 flex flex-col gap-2">
              <Button loading={saving} onClick={() => save()}>
                <Check /> Save tour
              </Button>
              {t.status === "draft" && (
                <Button variant="accent" onClick={() => save(true)} disabled={saving}>
                  Save & publish
                </Button>
              )}
              <Button variant="ghost" onClick={() => router.push("/admin/tours")}>
                Cancel
              </Button>
            </div>
          </Card>
        </aside>
      </div>

      <Modal open={!!picker} onClose={() => setPicker(null)} title={picker === "cover" ? "Choose cover image" : "Add gallery images"} size="xl">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LIBRARY.map((id) => {
            const selected = picker === "cover" ? t.image === id : t.gallery.includes(id);
            return (
              <button
                key={id}
                onClick={() => {
                  if (picker === "cover") {
                    set("image", id);
                    setPicker(null);
                  } else set("gallery", selected ? t.gallery.filter((g) => g !== id) : [...t.gallery, id]);
                }}
                aria-pressed={selected}
                className={cn("relative aspect-[4/3] overflow-hidden rounded-lg ring-offset-2 transition", selected ? "ring-2 ring-primary" : "hover:opacity-90")}
              >
                <Image src={img(id, 300)} alt="" fill sizes="200px" className="object-cover" />
                {selected && (
                  <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-white">
                    <Check className="size-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={cn("font-medium", warn && "text-amber-700")}>{value}</span>
    </div>
  );
}

function DayEditor({ d, index, total, onChange, onMove, onDelete }: { d: DayDraft; index: number; total: number; onChange: (p: Partial<DayDraft>) => void; onMove: (dir: -1 | 1) => void; onDelete: () => void }) {
  const controls = useDragControls();
  const [open, setOpen] = useState(index === 0 || !d.title);
  const meals = ["Breakfast", "Lunch", "Dinner"] as const;
  return (
    <Reorder.Item value={d} dragListener={false} dragControls={controls} className="rounded-xl border border-line bg-white" whileDrag={{ boxShadow: "0 14px 40px rgba(15,23,42,.14)", scale: 1.01 }}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button type="button" onPointerDown={(e) => controls.start(e)} className="grid size-8 cursor-grab touch-none place-items-center rounded-lg text-slate-400 hover:bg-slate-100 active:cursor-grabbing" aria-label={`Drag to reorder day ${index + 1}`}>
          <GripVertical className="size-4" />
        </button>
        <span className="grid size-8 place-items-center rounded-full bg-primary-50 text-xs font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
        <button type="button" onClick={() => setOpen(!open)} className="min-w-0 flex-1 truncate text-left text-sm font-medium" aria-expanded={open}>
          {d.title || <span className="text-muted">Untitled day</span>}
        </button>
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-slate-100 disabled:opacity-30" aria-label="Move day up">
          <ArrowUp className="size-4" />
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-slate-100 disabled:opacity-30" aria-label="Move day down">
          <ArrowDown className="size-4" />
        </button>
        <button type="button" onClick={onDelete} disabled={total === 1} className="grid size-8 place-items-center rounded-lg text-danger hover:bg-danger-50 disabled:opacity-30" aria-label="Delete day">
          <Trash2 className="size-4" />
        </button>
      </div>
      {open && (
        <div className="grid gap-4 border-t border-line p-4 sm:grid-cols-2">
          <Input label="Title" value={d.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="e.g. Arrival in Dubai" />
          <Input label="Accommodation" value={d.accommodation ?? ""} onChange={(e) => onChange({ accommodation: e.target.value })} placeholder="Hotel name" />
          <Textarea wrapperClassName="sm:col-span-2" label="Description" rows={3} value={d.description} onChange={(e) => onChange({ description: e.target.value })} />
          <Input label="Activities" hint="Comma separated" value={d.activities.join(", ")} onChange={(e) => onChange({ activities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
          <div>
            <p className="mb-2 text-sm font-medium">Meals</p>
            <div className="flex flex-wrap gap-4">
              {meals.map((m) => (
                <Checkbox key={m} checked={d.meals.includes(m)} onChange={(v) => onChange({ meals: v ? [...d.meals, m] : d.meals.filter((x) => x !== m) })} label={m} />
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium">Day image</p>
            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
              {LIBRARY.slice(0, 14).map((id) => (
                <button key={id} type="button" onClick={() => onChange({ image: d.image === id ? undefined : id })} aria-pressed={d.image === id} className={cn("relative h-12 w-16 shrink-0 overflow-hidden rounded-md", d.image === id ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100")}>
                  <Image src={img(id, 120)} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Reorder.Item>
  );
}
