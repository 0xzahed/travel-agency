"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Clock, Heart, MapPin, Quote, Users } from "lucide-react";
import type { Destination, Review, Tour, VisaCountry } from "@/lib/types";
import { cn, flag, formatMoney, img } from "@/lib/utils";
import { useCurrentUser, useStore } from "@/lib/store";
import { Avatar, Rating, Stars } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function SaveButton({ tourId, className }: { tourId: string; className?: string }) {
  const user = useCurrentUser();
  const { actions } = useStore();
  const toast = useToast();
  const router = useRouter();
  const saved = !!user?.savedTours.includes(tourId);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved tours" : "Save tour"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return router.push("/login?next=/dashboard/saved");
        actions.toggleSaved(tourId);
        toast({ title: saved ? "Removed from saved tours" : "Saved to your wishlist", tone: saved ? "info" : "success" });
      }}
      className={cn("grid size-9 place-items-center rounded-full bg-white/95 text-ink shadow-sm backdrop-blur transition hover:scale-105", className)}
    >
      <Heart className={cn("size-4 transition-colors", saved ? "fill-danger text-danger" : "text-ink")} />
    </button>
  );
}

export function TourCard({ tour, priority, className }: { tour: Tour; priority?: boolean; className?: string }) {
  const discount = tour.oldPrice ? Math.round((1 - tour.price / tour.oldPrice) * 100) : 0;
  return (
    <article className={cn("group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]", className)}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={img(tour.image, 800)}
          alt={tour.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
          <div className="flex flex-wrap gap-1.5">
            {discount > 0 && <span className="rounded-md bg-accent px-2 py-1 text-xs font-bold text-ink">−{discount}%</span>}
            <span className="rounded-md bg-white/95 px-2 py-1 text-xs font-medium text-ink backdrop-blur">{tour.type}</span>
          </div>
          <SaveButton tourId={tour.id} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 truncate text-[13px] text-muted">
            <MapPin className="size-3.5 shrink-0" /> {tour.country}
          </p>
          <Rating value={tour.rating} />
        </div>
        <h3 className="text-[17px] font-bold leading-snug text-ink">
          <Link href={`/tours/${tour.slug}`} className="after:absolute after:inset-0 hover:text-primary">
            {tour.title}
          </Link>
        </h3>
        <div className="mb-5 mt-3 flex items-center gap-4 text-[13px] text-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" /> {tour.days} Days / {tour.nights} Nights
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" /> Max {tour.groupSize}
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between border-t border-line pt-4">
          <div>
            <p className="text-xs text-muted">From</p>
            <p className="flex items-baseline gap-2">
              <span className="font-display text-xl font-extrabold text-primary">{formatMoney(tour.price)}</span>
              {tour.oldPrice && <span className="text-sm text-slate-400 line-through">{formatMoney(tour.oldPrice)}</span>}
            </p>
            <p className="text-xs text-muted">{tour.reviewCount} reviews · per person</p>
          </div>
          <span className="relative z-10 inline-flex h-9 items-center gap-1 rounded-[10px] border border-line px-3 text-sm font-medium text-ink transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
            View Details
          </span>
        </div>
      </div>
    </article>
  );
}

export function TourListCard({ tour }: { tour: Tour }) {
  const discount = tour.oldPrice ? Math.round((1 - tour.price / tour.oldPrice) * 100) : 0;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-[var(--shadow-lift)] sm:flex-row">
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-auto sm:w-72 sm:shrink-0">
        <Image src={img(tour.image, 700)} alt={tour.title} fill sizes="(max-width:640px) 100vw, 288px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        {discount > 0 && <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-1 text-xs font-bold text-ink">−{discount}%</span>}
        <SaveButton tourId={tour.id} className="absolute right-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[13px] text-muted">
          <MapPin className="size-3.5" /> {tour.location}
          <span>·</span>
          <Badge tone="primary">{tour.type}</Badge>
        </div>
        <h3 className="mt-2 text-lg font-bold text-ink">
          <Link href={`/tours/${tour.slug}`} className="after:absolute after:inset-0 hover:text-primary">
            {tour.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{tour.shortDescription}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-muted">
          <Rating value={tour.rating} count={tour.reviewCount} />
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" /> {tour.days}D / {tour.nights}N
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" /> Max {tour.groupSize}
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="flex items-baseline gap-2">
            <span className="text-xs text-muted">From</span>
            <span className="font-display text-xl font-extrabold text-primary">{formatMoney(tour.price)}</span>
            {tour.oldPrice && <span className="text-sm text-slate-400 line-through">{formatMoney(tour.oldPrice)}</span>}
          </p>
          <span className="relative z-10 inline-flex h-9 items-center rounded-[10px] bg-primary px-4 text-sm font-medium text-white">View Details</span>
        </div>
      </div>
    </article>
  );
}

export function DestinationCard({ d, size = "md", className }: { d: Destination; size?: "md" | "lg"; className?: string }) {
  return (
    <Link
      href={`/tours?destination=${d.slug}`}
      className={cn("group relative block overflow-hidden rounded-2xl bg-slate-200", size === "lg" ? "aspect-[4/5] md:aspect-auto md:h-full" : "aspect-[4/5]", className)}
    >
      <Image src={img(d.image, 900)} alt={`${d.name} — ${d.description}`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-xs font-medium uppercase tracking-wider text-white/70">{d.region} · {d.tourCount} tours</p>
        <h3 className="mt-1 text-2xl font-bold">{d.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/80">{d.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm">
            From <span className="font-display text-lg font-bold text-accent">{formatMoney(d.fromPrice)}</span>
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors group-hover:bg-white group-hover:text-ink">
            Explore <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ReviewCard({ r, className }: { r: Review; className?: string }) {
  return (
    <figure className={cn("flex h-full flex-col rounded-2xl border border-line bg-white p-6 md:p-7", className)}>
      <div className="flex items-center justify-between">
        <Stars value={r.rating} />
        <Quote className="size-7 text-primary-100" aria-hidden />
      </div>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700">“{r.text}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
        <Avatar src={r.avatar} name={r.name} size={44} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{r.name}</p>
          <p className="truncate text-xs text-muted">
            {r.country} · {r.trip}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function VisaCard({ v }: { v: VisaCountry }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="relative h-9 w-12 overflow-hidden rounded-md ring-1 ring-black/5">
            <Image src={flag(v.code)} alt={`${v.name} flag`} fill sizes="48px" className="object-cover" />
          </span>
          <div>
            <h3 className="text-base font-bold text-ink">{v.name}</h3>
            <p className="text-xs text-muted">{v.types.join(" · ")}</p>
          </div>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 text-sm">
        <div>
          <dt className="text-xs text-muted">Processing</dt>
          <dd className="mt-0.5 font-medium text-ink">{v.processing}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Validity</dt>
          <dd className="mt-0.5 font-medium text-ink">{v.validity}</dd>
        </div>
      </dl>
      <ul className="mt-4 flex-1 space-y-1.5 text-[13px] text-muted">
        {v.requirements.slice(0, 3).map((r) => (
          <li key={r} className="flex gap-2">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-secondary" /> {r}
          </li>
        ))}
        {v.requirements.length > 3 && <li className="pl-3 text-xs text-secondary">+{v.requirements.length - 3} more requirements</li>}
      </ul>
      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <p className="text-sm text-muted">
          From <span className="font-display text-lg font-bold text-primary">{formatMoney(v.fromPrice)}</span>
        </p>
        <ButtonLink href={`/visa/apply?country=${v.id}`} size="sm">
          Apply Now
        </ButtonLink>
      </div>
    </article>
  );
}
