import type { Metadata } from "next";
import { IMG } from "@/lib/data/images";
import { PageHero } from "@/components/site/page-hero";
import { FaqSection, PromoBanner } from "@/components/site/sections";
import { VisaCountryPicker, VisaGrid } from "./visa-client";

export const metadata: Metadata = { title: "Visa Services", description: "Visa assistance for 40+ countries with document checks and live tracking." };

const STEPS = [
  ["Choose country", "Pick your destination and visa type to see the exact checklist."],
  ["Upload documents", "Securely upload scans from any device — we'll flag anything missing."],
  ["Agent review", "A dedicated visa agent verifies every document within 24 hours."],
  ["Track & receive", "Follow each stage live until your visa is approved."],
];

export default function VisaPage() {
  return (
    <>
      <PageHero image={IMG.plane} eyebrow="Visa services" title="Visa Assistance Made Simple" description="Expert guidance, document checks and real-time tracking for tourist, business, student and transit visas.">
        <VisaCountryPicker />
      </PageHero>
      <PromoBanner placement="Visa" />
      <section className="border-b border-line bg-white">
        <ol className="container-x grid gap-8 py-14 md:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="relative">
              <span className="font-display text-sm font-bold text-accent-600">0{i + 1}</span>
              <p className="mt-2 font-semibold text-ink">{t}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>
      <VisaGrid />
      <FaqSection title="Visa questions" />
    </>
  );
}
