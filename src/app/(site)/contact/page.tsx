import { Suspense } from "react";
import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { company } from "@/lib/data/content";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  const items = [
    { icon: <Phone />, label: "Call us", value: company.phone, href: `tel:${company.phone}` },
    { icon: <MessageCircle />, label: "WhatsApp", value: company.whatsapp, href: "#" },
    { icon: <Mail />, label: "Email", value: company.email, href: `mailto:${company.email}` },
    { icon: <MapPin />, label: "Office", value: company.address },
    { icon: <Clock />, label: "Working hours", value: company.hours },
  ];
  return (
    <div className="pb-24 pt-28 md:pt-36">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-secondary">Contact</p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Let&apos;s talk about your trip</h1>
          <p className="mt-4 text-lg text-muted">Questions, custom itineraries or visa advice — our specialists reply within 2 working hours.</p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-6">
            <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
              {items.map((i) => (
                <li key={i.label} className="flex items-start gap-4 p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary [&_svg]:size-[18px]">{i.icon}</span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">{i.label}</p>
                    {i.href ? (
                      <a href={i.href} className="mt-0.5 block font-medium text-ink hover:text-primary">
                        {i.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 font-medium text-ink">{i.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="relative h-64 overflow-hidden rounded-2xl border border-line bg-[#e8eef1]" role="img" aria-label={`Map showing our office at ${company.address}`}>
              <svg className="absolute inset-0 h-full w-full" aria-hidden>
                <defs>
                  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M32 0H0V32" fill="none" stroke="#d3dde2" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <path d="M-10 180 C 120 120, 220 220, 420 140 S 700 80, 900 160" stroke="#c4d6dd" strokeWidth="22" fill="none" />
                <path d="M120 -10 L 200 300" stroke="#fff" strokeWidth="10" />
                <path d="M-10 90 L 900 60" stroke="#fff" strokeWidth="8" />
                <path d="M380 -10 L 330 300" stroke="#fff" strokeWidth="6" />
              </svg>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                <div className="grid size-11 place-items-center rounded-full bg-primary text-white shadow-lg ring-4 ring-white">
                  <MapPin className="size-5" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 rounded-lg bg-white px-3 py-2 text-xs shadow">
                <p className="font-semibold">Voyara HQ</p>
                <p className="text-muted">Finsbury Square, London</p>
              </div>
            </div>
          </div>
          <Suspense>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
