"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Headphones, RefreshCcw, ShieldCheck, BadgeCheck, Megaphone, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, img } from "@/lib/utils";
import { IMG } from "@/lib/data/images";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/primitives";
import { AccordionItem } from "@/components/ui/disclosure";
import { Counter, Reveal } from "@/components/ui/widgets";
import { DestinationCard, ReviewCard, TourCard } from "./cards";

export function TrustBar() {
  const stats = [
    { to: 10, suffix: "+", label: "Years of experience" },
    { to: 25, suffix: "K+", label: "Happy travellers" },
    { to: 100, suffix: "+", label: "Destinations" },
    { to: 98, suffix: "%", label: "Customer satisfaction" },
  ];
  const trust = [
    { icon: <ShieldCheck />, title: "Secure Booking", desc: "PCI-DSS payments & ATOL protection" },
    { icon: <BadgeCheck />, title: "Verified Partners", desc: "Every hotel and guide vetted in person" },
    { icon: <Headphones />, title: "24/7 Support", desc: "Real people, any time zone" },
    { icon: <RefreshCcw />, title: "Flexible Cancellation", desc: "Free changes up to 30 days out" },
  ];
  return (
    <section aria-label="Why travellers trust us" className="relative z-10 bg-white">
      <div className="container-x py-14 md:py-16">
        <dl className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:divide-x md:divide-line">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:px-6">
              <dd className="font-display text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
                <Counter to={s.to} suffix={s.suffix} />
              </dd>
              <dt className="mt-2 text-sm text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
        <ul className="mt-12 grid gap-4 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((t) => (
            <li key={t.title} className="flex items-start gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary [&_svg]:size-5">{t.icon}</span>
              <div>
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                <p className="mt-0.5 text-sm text-muted">{t.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PopularDestinations() {
  const { state } = useStore();
  const list = state.destinations.filter((d) => d.featured).slice(0, 8);
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <SectionHeader
          eyebrow="Popular destinations"
          title="Where our travellers are heading"
          description="From overwater villas to alpine villages — handpicked places our specialists know inside out."
          action={
            <ButtonLink href="/destinations" variant="outline">
              All destinations <ArrowRight />
            </ButtonLink>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {list.map((d, i) => (
            <Reveal key={d.id} delay={(i % 4) * 0.06}>
              <DestinationCard d={d} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedTours() {
  const { state } = useStore();
  const list = state.tours.filter((t) => t.featured && t.status === "published").slice(0, 6);
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-x">
        <SectionHeader
          eyebrow="Featured packages"
          title="Tours designed down to the detail"
          description="Every itinerary is built by a destination specialist and refined with feedback from thousands of travellers."
          action={
            <ButtonLink href="/tours" variant="outline">
              View all tours <ArrowRight />
            </ButtonLink>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 0.06}>
              <TourCard tour={t} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VisaPromo() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <div className="grid overflow-hidden rounded-3xl bg-primary lg:grid-cols-2">
          <div className="p-8 md:p-14">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">Visa services</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white md:text-[40px]">Visa assistance, without the paperwork stress.</h2>
            <p className="mt-4 max-w-md leading-relaxed text-white/75">Upload your documents once. A dedicated agent checks every page, lodges your application and keeps you updated with live tracking.</p>
            <ul className="mt-8 grid gap-3 text-sm text-white/90 sm:grid-cols-2">
              {["Document checklist per country", "Agent review within 24 hours", "Real-time status tracking", "97% first-time approval rate"].map((x) => (
                <li key={x} className="flex items-center gap-2.5">
                  <BadgeCheck className="size-4 text-accent" /> {x}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/visa/apply" variant="accent" size="lg">
                Start Visa Application
              </ButtonLink>
              <ButtonLink href="/visa/track" variant="glass" size="lg">
                Track Application
              </ButtonLink>
            </div>
          </div>
          <div className="relative min-h-72 lg:min-h-full">
            <Image src={img(IMG.plane, 1200)} alt="View of a plane wing above the clouds at sunset" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/20 to-transparent lg:via-primary/10" />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur md:left-auto md:w-72">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">VISA-2026-00452</p>
              <p className="mt-1 text-sm font-semibold text-ink">UAE Tourist Visa</p>
              <div className="mt-3 flex gap-1">
                {[1, 1, 1, 0, 0, 0].map((d, i) => (
                  <span key={i} className={cn("h-1.5 flex-1 rounded-full", d ? "bg-success" : "bg-slate-200")} />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">Processing · Est. decision in 3 days</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const { state } = useStore();
  const list = state.reviews.filter((r) => r.published);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const perPage = 3;
  const pages = Math.max(1, Math.ceil(list.length / perPage));

  useEffect(() => {
    if (paused || reduce || pages < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % pages), 7000);
    return () => clearInterval(t);
  }, [paused, reduce, pages]);

  const page = Math.min(i, pages - 1);
  const shown = list.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="bg-white py-20 md:py-28" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="container-x">
        <SectionHeader
          eyebrow="Traveller stories"
          title="Rated 4.9 out of 5 by 25,000+ travellers"
          action={
            <div className="flex gap-2">
              <button onClick={() => setI((page - 1 + pages) % pages)} className="grid size-11 place-items-center rounded-full border border-line bg-white hover:border-primary hover:text-primary" aria-label="Previous reviews">
                <ChevronLeft className="size-5" />
              </button>
              <button onClick={() => setI((page + 1) % pages)} className="grid size-11 place-items-center rounded-full border border-line bg-white hover:border-primary hover:text-primary" aria-label="Next reviews">
                <ChevronRight className="size-5" />
              </button>
            </div>
          }
        />
        <div className="relative" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={page} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="grid gap-5 md:grid-cols-3">
              {shown.map((r, k) => (
                <ReviewCard key={r.id} r={r} className={cn(k > 0 && "hidden md:flex")} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Show review page ${k + 1}`} aria-current={k === page} className={cn("h-2 rounded-full transition-all", k === page ? "w-7 bg-primary" : "w-2 bg-slate-300 hover:bg-slate-400")} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ limit, title = "Questions, answered" }: { limit?: number; title?: string }) {
  const { state } = useStore();
  const [open, setOpen] = useState<string | null>(state.faqs[0]?.id ?? null);
  const list = limit ? state.faqs.slice(0, limit) : state.faqs;
  return (
    <section className="py-20 md:py-28" id="faq">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHeader eyebrow="FAQ" title={title} description="Can't find what you're looking for? Our travel specialists are available around the clock." className="mb-6" />
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/contact">Contact us</ButtonLink>
            <ButtonLink href="/faq" variant="outline">
              Visit Help Center
            </ButtonLink>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white px-6">
          {list.map((f) => (
            <AccordionItem key={f.id} title={f.q} open={open === f.id} onToggle={() => setOpen(open === f.id ? null : f.id)}>
              <p className="leading-relaxed text-muted">{f.a}</p>
            </AccordionItem>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PromoBanner({ placement }: { placement: "Homepage" | "Tours" | "Visa" }) {
  const { state } = useStore();
  const [hidden, setHidden] = useState(false);
  const b = state.banners.find((x) => x.active && x.placement === placement);
  if (!b || hidden) return null;
  return (
    <div className="border-b border-accent/30 bg-accent-50">
      <div className="container-x flex items-center gap-3 py-2.5 text-sm">
        <Megaphone className="size-4 shrink-0 text-accent-600" />
        <p className="min-w-0 flex-1 truncate text-ink">
          <span className="font-semibold">{b.title}</span>
          <span className="hidden text-muted sm:inline"> — {b.subtitle}</span>
        </p>
        <Link href={placement === "Visa" ? "/visa/apply" : "/tours"} className="shrink-0 font-semibold text-primary hover:underline">
          {b.cta}
        </Link>
        <button onClick={() => setHidden(true)} aria-label="Dismiss banner" className="shrink-0 text-muted hover:text-ink">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="relative overflow-hidden">
      <Image src={img(IMG.lakeTurquoise, 1800)} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-primary/80" />
      <div className="container-x relative py-20 text-center md:py-28">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white md:text-5xl">Let&apos;s plan the trip you keep talking about.</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/80">Tell us where, when and who&apos;s coming. A specialist will send a tailored itinerary within 24 hours — free, no obligation.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/contact?topic=plan" variant="accent" size="lg">
            Plan My Trip
          </ButtonLink>
          <ButtonLink href="/tours" variant="glass" size="lg">
            Browse Tours
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
