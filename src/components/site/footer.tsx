"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { company } from "@/lib/data/content";
import { Logo } from "@/components/shared/logo";
import { FacebookIcon, InstagramIcon, LinkedinIcon, PaymentMarks, XIcon, YoutubeIcon } from "@/components/shared/brand-icons";
import { useToast } from "@/components/ui/toast";

const columns = [
  { title: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["Careers", "/about#careers"], ["Blog", "/blog"]] },
  { title: "Services", links: [["Tour Packages", "/tours"], ["Visa Services", "/visa"], ["Travel Insurance", "/faq#insurance"], ["Airport Transfer", "/tours"]] },
  { title: "Destinations", links: [["Asia", "/destinations?region=Asia"], ["Europe", "/destinations?region=Europe"], ["Middle East", "/destinations?region=Middle East"], ["Africa", "/destinations?region=Africa"]] },
  { title: "Support", links: [["Help Center", "/faq"], ["FAQ", "/faq"], ["Track Visa", "/visa/track"], ["Contact Support", "/dashboard/messages"]] },
  { title: "Legal", links: [["Privacy Policy", "/legal/privacy"], ["Terms", "/legal/terms"], ["Refund Policy", "/legal/refunds"], ["Cancellation Policy", "/legal/cancellation"]] },
] as const;

export function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  return (
    <footer className="bg-[#0b2e38] text-white/70">
      <div className="container-x">
        <div className="flex flex-col gap-6 border-b border-white/10 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Travel inspiration, monthly.</h2>
            <p className="mt-1.5 text-sm">Hand-picked deals, visa updates and destination guides. No spam.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) return toast({ title: "Enter a valid email", tone: "error" });
              toast({ title: "You're subscribed", description: "Look out for our next issue in your inbox." });
              setEmail("");
            }}
            className="flex w-full max-w-md gap-2"
          >
            <label htmlFor="newsletter" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 min-w-0 flex-1 rounded-[10px] border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none"
            />
            <button className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-accent px-5 text-sm font-semibold text-ink hover:bg-accent-600">
              Subscribe <ArrowRight className="size-4" />
            </button>
          </form>
        </div>

        <div className="grid gap-10 py-14 lg:grid-cols-[1.4fr_repeat(5,1fr)]">
          <div className="max-w-xs">
            <Logo light />
            <p className="mt-5 text-sm leading-relaxed">Premium tours, visa assistance and 24/7 travel support from a team that has guided 25,000+ travellers since 2015.</p>
            <ul className="mt-6 space-y-2.5 text-sm">
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-accent" /> <a href={`tel:${company.phone}`} className="hover:text-white">{company.phone}</a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-accent" /> <a href={`mailto:${company.email}`} className="hover:text-white">{company.email}</a>
              </li>
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" /> {company.address}
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-5">
            {columns.map((c) => (
              <div key={c.title}>
                <h3 className="font-sans text-sm font-semibold tracking-normal text-white">{c.title}</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {c.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="transition-colors hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-white/10 py-8 text-sm md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {company.legal}. ATOL 12345 · IATA accredited.</p>
          <div className="flex items-center gap-2">
            {[
              [FacebookIcon, "Facebook"],
              [InstagramIcon, "Instagram"],
              [XIcon, "X"],
              [YoutubeIcon, "YouTube"],
              [LinkedinIcon, "LinkedIn"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof FacebookIcon;
              return (
                <a key={label as string} href="#" aria-label={label as string} className="grid size-9 place-items-center rounded-full border border-white/15 transition-colors hover:border-white/40 hover:text-white">
                  <I className="size-4" />
                </a>
              );
            })}
          </div>
          <PaymentMarks />
        </div>
      </div>
    </footer>
  );
}
