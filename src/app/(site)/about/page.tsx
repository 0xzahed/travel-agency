import type { Metadata } from "next";
import Image from "next/image";
import { Compass, Eye, Gem, HeartHandshake, Leaf, ShieldCheck, Sparkles, Target } from "lucide-react";
import { img } from "@/lib/utils";
import { IMG } from "@/lib/data/images";
import { team } from "@/lib/data/content";
import { PageHero } from "@/components/site/page-hero";
import { CtaBand, Testimonials, TrustBar } from "@/components/site/sections";
import { SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/widgets";

export const metadata: Metadata = { title: "About us" };

const reasons = [
  { icon: <Compass />, title: "Specialists, not call centres", desc: "Every itinerary is designed by someone who has travelled it in the last 12 months." },
  { icon: <ShieldCheck />, title: "Financially protected", desc: "ATOL-protected packages and segregated client accounts for complete peace of mind." },
  { icon: <HeartHandshake />, title: "24/7 human support", desc: "One WhatsApp message reaches a real person, whatever the time zone." },
  { icon: <Gem />, title: "Hand-picked stays", desc: "We inspect every hotel in person and drop any that slip below our standards." },
  { icon: <Sparkles />, title: "Visa expertise in-house", desc: "A dedicated visa desk with a 97% first-time approval rate." },
  { icon: <Leaf />, title: "Travel that gives back", desc: "1% of every booking funds community and conservation projects we visit." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero image={IMG.cappadociaTravelers} eyebrow="About Voyara" title="We plan journeys the way we'd want to travel." description="Founded in London in 2015, Voyara has grown from a two-person visa desk into a full-service travel company trusted by 25,000+ travellers." />

      <section className="py-20 md:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-secondary">Our story</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight md:text-[40px]">From a single visa desk to 100+ destinations</h2>
            <div className="mt-6 space-y-4 leading-relaxed text-slate-700">
              <p>Voyara began when our founder, Nadia, spent a summer helping friends untangle Schengen paperwork. The visa desk grew by word of mouth — and so did requests to plan the trips themselves.</p>
              <p>Today our team of 60 specialists across London, Dubai and Kuala Lumpur designs tours across four continents, combining the care of a boutique agency with the reliability of a modern travel platform.</p>
              <p>What hasn&apos;t changed: every trip is personal, every document is double-checked, and someone is always on the other end of the phone.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
              <Image src={img(IMG.backpacker, 1200)} alt="Traveller looking out over a mountain lake" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-4 rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-lift)] md:-left-10">
              <p className="font-display text-3xl font-extrabold text-primary">2015</p>
              <p className="text-sm text-muted">Founded in London</p>
            </div>
          </Reveal>
        </div>
      </section>

      <TrustBar />

      <section className="py-20 md:py-28">
        <div className="container-x">
          <SectionHeader eyebrow="Why choose us" title="Six reasons travellers come back" align="center" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((r, i) => (
              <Reveal key={r.title} delay={(i % 3) * 0.05}>
                <div className="h-full rounded-2xl border border-line bg-white p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary-50 text-primary [&_svg]:size-5">{r.icon}</span>
                  <h3 className="mt-5 text-lg font-bold">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{r.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {[
            { icon: <Target />, title: "Our mission", text: "To make international travel feel effortless — by removing every point of friction between people and the places they dream of, from visas to the last transfer home." },
            { icon: <Eye />, title: "Our vision", text: "A world where crossing borders is simple, travel is responsible, and every journey leaves both the traveller and the destination better off." },
          ].map((b) => (
            <div key={b.title} className="rounded-2xl bg-primary p-8 text-white md:p-10">
              <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-accent [&_svg]:size-5">{b.icon}</span>
              <h3 className="mt-6 text-2xl font-bold">{b.title}</h3>
              <p className="mt-3 leading-relaxed text-white/80">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-28" id="team">
        <div className="container-x">
          <SectionHeader eyebrow="Leadership" title="The people behind your journey" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <figure key={m.name}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-200">
                  <Image src={m.avatar} alt={m.name} fill sizes="(max-width:640px) 100vw, 25vw" className="object-cover grayscale-[20%]" />
                </div>
                <figcaption className="mt-4">
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-muted">{m.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <div id="careers" className="mt-16 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-white p-6 md:flex-row md:items-center md:p-8">
            <div>
              <h3 className="text-lg font-bold">We&apos;re hiring</h3>
              <p className="mt-1 text-sm text-muted">Destination specialists, visa consultants and engineers — London, Dubai or remote.</p>
            </div>
            <a href="mailto:careers@voyara.travel" className="inline-flex h-11 items-center rounded-[10px] bg-primary px-5 text-sm font-medium text-white hover:bg-primary-700">
              View open roles
            </a>
          </div>
        </div>
      </section>

      <Testimonials />
      <CtaBand />
    </>
  );
}
