"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Bookmark, CalendarCheck, CalendarDays, Compass, FileCheck2, Plane, PartyPopper, Plus, Sparkles, Users, X } from "lucide-react";
import { useCurrentUser, useStore } from "@/lib/store";
import { visaCountries } from "@/lib/data/visa";
import { cn, daysUntil, formatDate, greeting, img } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/states";
import { StatsCard } from "@/components/shared/stats-card";
import { NotificationItem } from "@/components/shared/notification-center";
import { TourCard } from "@/components/site/cards";

export function Overview() {
  const { state, actions } = useStore();
  const user = useCurrentUser()!;
  const router = useRouter();
  const params = useSearchParams();
  const [welcome, setWelcome] = useState(params.get("welcome") === "1");
  // The portal renders client-side only (after store hydration), so local time is safe here.
  const hello = greeting();

  const bookings = state.bookings.filter((b) => b.customerId === user.id);
  const upcoming = bookings.filter((b) => ["Confirmed", "Pending"].includes(b.status) && daysUntil(b.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const next = upcoming[0];
  const nextTour = state.tours.find((t) => t.id === next?.tourId);
  const visas = state.visaApplications.filter((v) => v.customerId === user.id);
  const activeVisas = visas.filter((v) => !["Completed", "Rejected"].includes(v.status));
  const notes = state.notifications.filter((n) => n.audience === "customer").slice(0, 5);
  const recommended = state.tours.filter((t) => t.status === "published" && !bookings.some((b) => b.tourId === t.id)).sort((a, b) => b.rating - a.rating).slice(0, 3);
  const days = next ? daysUntil(next.date) : 0;

  return (
    <div className="space-y-6">
      {welcome && (
        <div className="flex items-center gap-4 rounded-2xl border border-accent/40 bg-accent-50 p-4">
          <PartyPopper className="size-6 shrink-0 text-accent-600" />
          <p className="flex-1 text-sm">
            <span className="font-semibold">Welcome to Voyara!</span> Your account is ready. Start by saving a few tours you love.
          </p>
          <button onClick={() => setWelcome(false)} aria-label="Dismiss" className="text-muted hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold md:text-[28px]">
            {hello}, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-muted">Here&apos;s what&apos;s happening with your travel plans.</p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/visa/apply" variant="outline">
            <FileCheck2 /> Apply for visa
          </ButtonLink>
          <ButtonLink href="/tours">
            <Plus /> Book a tour
          </ButtonLink>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard label="Upcoming Trips" value={upcoming.length} icon={<Plane />} hint={next ? `Next in ${days} days` : "Nothing booked yet"} href="/dashboard/bookings" />
        <StatsCard label="Active Bookings" value={bookings.filter((b) => b.status === "Confirmed" || b.status === "Pending").length} icon={<CalendarCheck />} tone="success" hint={`${bookings.length} all-time`} href="/dashboard/bookings" />
        <StatsCard label="Visa Applications" value={activeVisas.length} icon={<FileCheck2 />} tone="info" hint={`${visas.length} total`} href="/dashboard/visa" />
        <StatsCard label="Saved Tours" value={user.savedTours.length} icon={<Bookmark />} tone="accent" hint="On your wishlist" href="/dashboard/saved" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {next && nextTour ? (
          <div className="group relative overflow-hidden rounded-2xl bg-slate-900 text-white">
            <Image src={img(nextTour.image, 1400)} alt={nextTour.title} fill sizes="(max-width:1280px) 100vw, 60vw" className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/10" />
            <div className="relative flex min-h-[320px] flex-col justify-between p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">Upcoming trip</span>
                <div className="rounded-2xl bg-white px-4 py-3 text-center text-ink shadow-lg">
                  <p className="font-display text-3xl font-extrabold leading-none text-primary tabular-nums">{days}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Days to go</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-white/75">{nextTour.location}</p>
                <h2 className="mt-1 text-2xl font-bold md:text-3xl">{nextTour.title}</h2>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-4" /> Departure {formatDate(next.date, "long")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-4" /> {next.adults + next.children + next.infants} travellers
                  </span>
                  <StatusBadge status={next.status} className="bg-white/90" />
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <ButtonLink href={`/dashboard/bookings/${next.id}`} variant="accent">
                    View Trip <ArrowRight />
                  </ButtonLink>
                  <ButtonLink href="/dashboard/documents" variant="glass">
                    Travel documents
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <EmptyState icon={<Compass />} title="No upcoming trips" description="When you book a tour, your countdown and trip details will appear here." action={<ButtonLink href="/tours">Explore tours</ButtonLink>} />
          </Card>
        )}

        <Card>
          <CardHeader title="Visa applications" action={<Link href="/dashboard/visa" className="text-sm font-medium text-secondary hover:text-primary">View all</Link>} />
          {visas.length ? (
            <ul className="divide-y divide-line">
              {visas.slice(0, 3).map((v) => {
                const c = visaCountries.find((x) => x.id === v.countryId)!;
                const pct = { Submitted: 15, "Under Review": 30, "Documents Required": 30, Processing: 60, Approved: 90, Rejected: 100, Completed: 100 }[v.status];
                return (
                  <li key={v.id}>
                    <Link href={`/visa/track?id=${v.id}&passport=${v.applicant.passport}`} className="block px-5 py-4 hover:bg-slate-50">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {c.name} · {v.type}
                          </p>
                          <p className="text-xs text-muted">{v.id}</p>
                        </div>
                        <StatusBadge status={v.status} />
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className={cn("h-full rounded-full", v.status === "Rejected" ? "bg-danger" : v.status === "Documents Required" ? "bg-accent" : "bg-primary")} style={{ width: `${pct}%` }} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={<FileCheck2 />} title="No visa applications" description="Apply online and track every step here." action={<ButtonLink href="/visa/apply" size="sm">Start application</ButtonLink>} className="py-10" />
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardHeader
            title="Recent activity"
            action={
              <button onClick={() => actions.markAllRead("customer")} className="text-sm font-medium text-secondary hover:text-primary">
                Mark all read
              </button>
            }
          />
          <div className="divide-y divide-line">
            {notes.map((n) => (
              <NotificationItem key={n.id} n={n} compact onClick={() => (actions.markRead(n.id), n.href && router.push(n.href))} />
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><Sparkles className="size-4 text-accent" /> Recommended for you</span>} description="Based on trips you've loved" action={<Link href="/tours" className="text-sm font-medium text-secondary hover:text-primary">Browse all</Link>} />
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
