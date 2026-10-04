"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Check, Clock, Download, FileQuestion, Headphones, MapPin, Ticket, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { downloadInvoice } from "@/lib/documents";
import { formatDate, formatMoney, img } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/primitives";

export function Confirmation({ id }: { id: string }) {
  const { state, hydrated } = useStore();
  const reduce = useReducedMotion();
  const booking = state.bookings.find((b) => b.id === id);
  const tour = state.tours.find((t) => t.id === booking?.tourId);
  const customer = state.customers.find((c) => c.id === booking?.customerId);

  if (!hydrated)
    return (
      <div className="container-x max-w-3xl pb-24 pt-32">
        <Skeleton className="mx-auto size-16 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-8 w-64" />
        <Skeleton className="mt-10 h-80 w-full rounded-2xl" />
      </div>
    );

  if (!booking || !tour || !customer)
    return (
      <div className="pt-24">
        <ErrorState icon={<FileQuestion />} title="Booking not found" description="We couldn't find that booking reference. Check your dashboard for all bookings." actions={<ButtonLink href="/dashboard/bookings">My bookings</ButtonLink>} />
      </div>
    );

  const pending = booking.paymentStatus === "Pending";

  return (
    <div className="bg-canvas pb-24 pt-28 md:pt-32">
      <div className="container-x max-w-3xl">
        <div className="text-center">
          <motion.div
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`mx-auto grid size-16 place-items-center rounded-full ring-8 ${pending ? "bg-warning text-white ring-warning-50" : "bg-success text-white ring-success-50"}`}
          >
            {pending ? <Clock className="size-8" /> : <Check className="size-8" strokeWidth={3} />}
          </motion.div>
          <h1 className="mt-6 text-3xl font-bold md:text-4xl">{pending ? "Booking Reserved" : "Booking Confirmed"}</h1>
          <p className="mt-2 text-muted">
            {pending ? "We'll confirm as soon as your bank transfer arrives." : `A confirmation email is on its way to ${customer.email}.`}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-white px-4 py-2 text-sm">
            Booking ID <span className="font-mono font-semibold text-primary">{booking.id}</span>
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-soft)]">
          <div className="relative h-44 md:h-56">
            <Image src={img(tour.image, 1400)} alt={tour.title} fill sizes="768px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
            <div className="absolute bottom-0 p-5 text-white md:p-6">
              <p className="flex items-center gap-1.5 text-sm text-white/80">
                <MapPin className="size-4" /> {tour.location}
              </p>
              <p className="mt-1 text-xl font-bold md:text-2xl">{tour.title}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
            {[
              [<CalendarDays key="1" />, "Date", formatDate(booking.date, "long")],
              [<Users key="2" />, "Travellers", `${booking.adults + booking.children + booking.infants} people`],
              [<Ticket key="3" />, "Amount", formatMoney(booking.total)],
              [<Check key="4" />, "Payment", <StatusBadge key="s" status={booking.paymentStatus} />],
            ].map(([icon, label, value]) => (
              <div key={label as string} className="bg-white p-5">
                <span className="text-secondary [&_svg]:size-4">{icon}</span>
                <dt className="mt-2 text-xs text-muted">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-line p-5 md:p-6">
            <h2 className="text-sm font-semibold">What happens next</h2>
            <ol className="mt-4 grid gap-4 text-sm text-muted md:grid-cols-3">
              {[
                ["Documents", "Vouchers & invoice are now in your dashboard."],
                ["Visa check", "We'll email if any traveller needs a visa."],
                ["Pre-departure", "Your guide's details arrive 7 days before."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-50 text-xs font-bold text-primary">{i + 1}</span>
                  <span>
                    <span className="block font-medium text-ink">{t}</span>
                    {d}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => downloadInvoice(booking, tour, customer)}>
            <Download /> Download Invoice
          </Button>
          <ButtonLink href={`/dashboard/bookings/${booking.id}`}>View Booking</ButtonLink>
          <ButtonLink href={`/dashboard/messages?new=1&booking=${booking.id}`} variant="outline">
            <Headphones /> Contact Support
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
