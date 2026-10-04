"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Expand,
  MapPin,
  MessageCircleQuestion,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { cn, formatMoney, img } from "@/lib/utils";
import { useCurrentUser, useStore } from "@/lib/store";
import type { Tour } from "@/lib/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating, Stars } from "@/components/ui/primitives";
import { AccordionItem } from "@/components/ui/disclosure";
import { Modal } from "@/components/ui/overlay";
import { Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { ErrorState } from "@/components/ui/states";
import { ReviewCard, SaveButton, TourCard } from "@/components/site/cards";

const SECTIONS = [
  ["overview", "Overview"],
  ["highlights", "Highlights"],
  ["itinerary", "Itinerary"],
  ["included", "Included"],
  ["requirements", "Requirements"],
  ["policy", "Cancellation"],
  ["reviews", "Reviews"],
] as const;

export function TourDetail({ slug }: { slug: string }) {
  const { state, hydrated } = useStore();
  const tour = state.tours.find((t) => t.slug === slug);
  if (!tour) {
    if (!hydrated) return <div className="min-h-screen pt-24" />;
    return (
      <div className="pt-24">
        <ErrorState
          icon={<Compass />}
          code="404"
          title="This tour isn't available"
          description="It may have been unpublished or the link is out of date. Explore our current collection instead."
          actions={<ButtonLink href="/tours">Browse all tours</ButtonLink>}
        />
      </div>
    );
  }
  return <TourView tour={tour} />;
}

function TourView({ tour }: { tour: Tour }) {
  const { state } = useStore();
  const toast = useToast();
  const [gallery, setGallery] = useState<number | null>(null);
  const [ask, setAsk] = useState(false);
  const [active, setActive] = useState<string>("overview");
  const [openDay, setOpenDay] = useState<number | null>(1);
  const discount = tour.oldPrice ? Math.round((1 - tour.price / tour.oldPrice) * 100) : 0;
  const reviews = state.reviews.filter((r) => r.published);
  const related = state.tours.filter((t) => t.id !== tour.id && t.status === "published" && (t.destinationId === tour.destinationId || t.type === tour.type)).slice(0, 3);

  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-40% 0px -55% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="pt-16 md:pt-[76px]">
      <div className="container-x pt-6">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-muted">
          <Link href="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/tours" className="hover:text-ink">Tours</Link>
          <ChevronRight className="size-3.5" />
          <span className="truncate text-ink">{tour.title}</span>
        </nav>

        {/* Gallery */}
        <div className="relative grid h-[300px] gap-2 overflow-hidden rounded-2xl sm:h-[420px] md:h-[500px] md:grid-cols-4 md:grid-rows-2">
          {tour.gallery.slice(0, 5).map((g, i) => (
            <button
              key={g + i}
              onClick={() => setGallery(i)}
              className={cn("group relative overflow-hidden bg-slate-200", i === 0 ? "md:col-span-2 md:row-span-2" : "hidden md:block")}
              aria-label={`Open photo ${i + 1} of ${tour.gallery.length}`}
            >
              <Image src={img(g, i === 0 ? 1600 : 700)} alt={`${tour.title} photo ${i + 1}`} fill priority={i === 0} sizes={i === 0 ? "(max-width:768px) 100vw, 50vw" : "25vw"} className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            </button>
          ))}
          <Button variant="white" size="sm" className="absolute bottom-4 right-4 shadow-md" onClick={() => setGallery(0)}>
            <Expand /> View all {tour.gallery.length} photos
          </Button>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">{tour.type}</Badge>
              {discount > 0 && <Badge tone="accent">Save {discount}%</Badge>}
              {tour.bookings > 150 && <Badge tone="success">Bestseller</Badge>}
            </div>
            <div className="mt-3 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold leading-tight md:text-[40px]">{tour.title}</h1>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast({ title: "Link copied", description: "Share it with your travel companions." });
                  }}
                  className="grid size-9 place-items-center rounded-full border border-line bg-white hover:bg-slate-50"
                  aria-label="Share tour"
                >
                  <Share2 className="size-4" />
                </button>
                <SaveButton tourId={tour.id} className="border border-line shadow-none" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" /> {tour.location}
              </span>
              <Rating value={tour.rating} count={tour.reviewCount} size="md" />
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
              {[
                [<Clock key="c" />, "Duration", `${tour.days} Days / ${tour.nights} Nights`],
                [<Users key="u" />, "Group size", `Max ${tour.groupSize} people`],
                [<Compass key="t" />, "Tour type", tour.type],
                [<CalendarDays key="d" />, "Departures", "Daily, year-round"],
              ].map(([icon, label, value]) => (
                <div key={label as string} className="bg-white p-4">
                  <span className="text-secondary [&_svg]:size-5">{icon}</span>
                  <dt className="mt-2 text-xs text-muted">{label}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            {/* Section nav */}
            <nav aria-label="Tour sections" className="sticky top-16 z-20 -mx-4 mt-8 border-b border-line bg-canvas/95 px-4 backdrop-blur md:top-16">
              <ul className="scrollbar-none flex gap-6 overflow-x-auto">
                {SECTIONS.map(([id, label]) => (
                  <li key={id}>
                    <a href={`#${id}`} className={cn("relative block whitespace-nowrap py-3.5 text-sm font-medium transition-colors", active === id ? "text-primary" : "text-muted hover:text-ink")}>
                      {label}
                      {active === id && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <Section id="overview" title="Overview">
              <p className="leading-relaxed text-slate-700">{tour.description}</p>
              <div className="mt-5 rounded-xl border border-line bg-white p-4 text-sm">
                <p className="font-semibold text-ink">Meeting point</p>
                <p className="mt-1 text-muted">{tour.meetingPoint}</p>
              </div>
            </Section>

            <Section id="highlights" title="Highlights">
              <ul className="grid gap-3 sm:grid-cols-2">
                {tour.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 rounded-xl border border-line bg-white p-4 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-50 text-accent-600">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="itinerary" title="Itinerary" action={<button className="text-sm font-medium text-secondary hover:text-primary" onClick={() => setOpenDay(openDay === -1 ? 1 : -1)}>{openDay === -1 ? "Collapse" : "Expand"} all</button>}>
              <ol className="relative">
                {tour.itinerary.map((d, i) => {
                  const open = openDay === -1 || openDay === d.day;
                  const last = i === tour.itinerary.length - 1;
                  return (
                    <li key={d.day} className="relative pl-14">
                      {!last && <span className="absolute left-[19px] top-10 bottom-0 w-px bg-line" aria-hidden />}
                      <span className={cn("absolute left-0 top-2 grid size-10 place-items-center rounded-full border-2 text-xs font-bold transition-colors", open ? "border-primary bg-primary text-white" : "border-line bg-white text-primary")}>
                        {String(d.day).padStart(2, "0")}
                      </span>
                      <AccordionItem
                        className="border-0"
                        headerClassName="py-3"
                        open={open}
                        onToggle={() => setOpenDay(open && openDay !== -1 ? null : d.day)}
                        title={
                          <span>
                            <span className="block text-xs font-semibold uppercase tracking-wide text-secondary">Day {String(d.day).padStart(2, "0")}</span>
                            {d.title}
                          </span>
                        }
                      >
                        <div className="rounded-xl border border-line bg-white p-4 text-sm">
                          <p className="leading-relaxed text-slate-700">{d.description}</p>
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {d.activities.map((a) => (
                              <span key={a} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{a}</span>
                            ))}
                          </div>
                          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-3 text-xs text-muted">
                            <span className="flex items-center gap-1.5"><Utensils className="size-3.5" /> {d.meals.length ? d.meals.join(", ") : "No meals included"}</span>
                            {d.accommodation && <span className="flex items-center gap-1.5"><BedDouble className="size-3.5" /> {d.accommodation}</span>}
                          </div>
                        </div>
                      </AccordionItem>
                    </li>
                  );
                })}
              </ol>
            </Section>

            <Section id="included" title="What's included">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-line bg-white p-5">
                  <p className="mb-3 text-sm font-semibold text-success">Included</p>
                  <ul className="space-y-2.5 text-sm text-slate-700">
                    {tour.included.map((x) => (
                      <li key={x} className="flex gap-2.5"><Plus className="mt-0.5 size-4 shrink-0 text-success" /> {x}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-line bg-white p-5">
                  <p className="mb-3 text-sm font-semibold text-danger">Not included</p>
                  <ul className="space-y-2.5 text-sm text-slate-700">
                    {tour.excluded.map((x) => (
                      <li key={x} className="flex gap-2.5"><Minus className="mt-0.5 size-4 shrink-0 text-danger" /> {x}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            <Section id="requirements" title="Requirements">
              <ul className="space-y-2.5 text-sm text-slate-700">
                {tour.requirements.map((x) => (
                  <li key={x} className="flex gap-2.5"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-secondary" /> {x}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">
                Need a visa? <Link href="/visa" className="font-medium text-secondary hover:underline">Our visa desk can help</Link>.
              </p>
            </Section>

            <Section id="policy" title="Cancellation policy">
              <ol className="relative space-y-3 border-l-2 border-line pl-5 text-sm">
                {tour.cancellationPolicy.map((p, i) => (
                  <li key={p} className="relative">
                    <span className={cn("absolute -left-[27px] top-1 size-3 rounded-full border-2 border-white", i === 0 ? "bg-success" : i === 1 ? "bg-warning" : i === 2 ? "bg-danger" : "bg-secondary")} />
                    {p}
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="reviews" title="Reviews">
              <div className="mb-6 flex flex-col gap-6 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center">
                <div className="text-center sm:border-r sm:border-line sm:pr-8">
                  <p className="font-display text-5xl font-extrabold text-ink">{tour.rating.toFixed(1)}</p>
                  <Stars value={tour.rating} className="mt-2" />
                  <p className="mt-1 text-sm text-muted">{tour.reviewCount} reviews</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((s, i) => {
                    const pct = [82, 13, 3, 1, 1][i];
                    return (
                      <div key={s} className="flex items-center gap-3 text-sm">
                        <span className="w-8 text-muted">{s}★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-right tabular-nums text-muted">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.slice(0, 4).map((r) => (
                  <ReviewCard key={r.id} r={r} />
                ))}
              </div>
            </Section>
          </div>

          <BookingWidget tour={tour} onAsk={() => setAsk(true)} />
        </div>

        {related.length > 0 && (
          <section className="border-t border-line py-16">
            <h2 className="mb-8 text-2xl font-bold">You may also like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <TourCard key={t.id} tour={t} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div>
          <p className="text-xs text-muted">From</p>
          <p className="font-display text-xl font-extrabold text-primary">
            {formatMoney(tour.price)} <span className="text-xs font-normal text-muted">/ person</span>
          </p>
        </div>
        <ButtonLink href={`/tours/${tour.slug}/book`} variant="accent">
          Book This Tour
        </ButtonLink>
      </div>
      <div className="h-20 lg:hidden" />

      <GalleryModal images={tour.gallery} index={gallery} onClose={() => setGallery(null)} onIndex={setGallery} title={tour.title} />
      <AskModal open={ask} onClose={() => setAsk(false)} tour={tour} />
    </div>
  );
}

function Section({ id, title, children, action }: { id: string; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 border-b border-line py-10 last:border-0">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function BookingWidget({ tour, onAsk }: { tour: Tour; onAsk: () => void }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [minDate] = useState(() => new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-2xl border border-line bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-muted">From</span>
          <span className="font-display text-3xl font-extrabold text-primary">{formatMoney(tour.price)}</span>
          {tour.oldPrice && <span className="text-slate-400 line-through">{formatMoney(tour.oldPrice)}</span>}
        </div>
        <p className="text-sm text-muted">per person · twin sharing</p>
        <div className="mt-6 space-y-3">
          <Input label="Travel date" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
          <Select label="Adults" value={String(adults)} onChange={(e) => setAdults(Number(e.target.value))} options={Array.from({ length: tour.groupSize }, (_, i) => ({ value: String(i + 1), label: `${i + 1} ${i ? "Adults" : "Adult"}` }))} />
        </div>
        <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
          <span className="text-muted">Estimated total</span>
          <span className="font-semibold text-ink">{formatMoney(tour.price * adults)}</span>
        </div>
        <Button variant="accent" size="lg" className="mt-4 w-full" onClick={() => router.push(`/tours/${tour.slug}/book?${new URLSearchParams({ ...(date && { date }), adults: String(adults) })}`)}>
          Book This Tour
        </Button>
        <Button variant="outline" size="lg" className="mt-2.5 w-full" onClick={onAsk}>
          <MessageCircleQuestion /> Ask a Question
        </Button>
        <ul className="mt-6 space-y-2.5 border-t border-line pt-5 text-[13px] text-muted">
          <li className="flex gap-2"><Check className="size-4 text-success" /> Free cancellation up to 30 days</li>
          <li className="flex gap-2"><Check className="size-4 text-success" /> Reserve now, pay in instalments</li>
          <li className="flex gap-2"><Check className="size-4 text-success" /> Best price guarantee</li>
        </ul>
      </div>
    </aside>
  );
}

function GalleryModal({ images, index, onClose, onIndex, title }: { images: string[]; index: number | null; onClose: () => void; onIndex: (i: number) => void; title: string }) {
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose, onIndex]);

  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div role="dialog" aria-modal="true" aria-label={`${title} gallery`} className="fixed inset-0 z-[120] flex flex-col bg-slate-950" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <p className="text-sm tabular-nums text-white/70">
              {index + 1} / {images.length}
            </p>
            <button onClick={onClose} className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label="Close gallery" autoFocus>
              <X className="size-5" />
            </button>
          </div>
          <div className="relative flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={index} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Image src={img(images[index], 2000)} alt={`${title} photo ${index + 1}`} fill sizes="100vw" className="object-contain" />
              </motion.div>
            </AnimatePresence>
            <button onClick={() => onIndex((index - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20" aria-label="Previous photo">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => onIndex((index + 1) % images.length)} className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20" aria-label="Next photo">
              <ChevronRight className="size-5" />
            </button>
          </div>
          <div className="scrollbar-none flex justify-center gap-2 overflow-x-auto p-4">
            {images.map((g, i) => (
              <button key={g + i} onClick={() => onIndex(i)} aria-label={`Photo ${i + 1}`} aria-current={i === index} className={cn("relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-opacity", i === index ? "ring-2 ring-accent" : "opacity-50 hover:opacity-90")}>
                <Image src={img(g, 200)} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AskModal({ open, onClose, tour }: { open: boolean; onClose: () => void; tour: Tour }) {
  const user = useCurrentUser();
  const { actions } = useStore();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || msg.trim().length < 10) {
      setError("Please add your name, a valid email and a question of at least 10 characters.");
      return;
    }
    setError("");
    setSending(true);
    setTimeout(() => {
      if (user) actions.createTicket({ customerId: user.id, subject: `Question about ${tour.title}`, category: "Booking", priority: "Low", message: msg, author: user.name });
      setSending(false);
      setMsg("");
      onClose();
      toast({ title: "Question sent", description: user ? "Track the reply in Dashboard → Messages." : "A specialist will email you within a few hours." });
    }, 700);
  };

  return (
    <Modal open={open} onClose={onClose} title="Ask a question" description={tour.title}>
      <form id="ask-form" onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <Textarea label="Your question" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="e.g. Can we extend by two nights at the end?" required />
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={sending}>Send question</Button>
        </div>
      </form>
    </Modal>
  );
}
