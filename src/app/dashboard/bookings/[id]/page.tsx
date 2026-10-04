"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BedDouble, CalendarDays, ChevronLeft, CreditCard, Download, FileText, Headphones, MapPin, Ticket, Users, Utensils, XCircle } from "lucide-react";
import { useCurrentUser, useStore } from "@/lib/store";
import { addOns } from "@/lib/data/tours";
import { downloadInvoice, downloadVoucher } from "@/lib/documents";
import { daysUntil, formatDate, formatDateTime, formatMoney, img } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, KeyValue } from "@/components/ui/primitives";
import { AccordionItem } from "@/components/ui/disclosure";
import { ConfirmDialog } from "@/components/ui/overlay";
import { ErrorState } from "@/components/ui/states";
import { Timeline } from "@/components/ui/widgets";
import { useToast } from "@/components/ui/toast";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, actions } = useStore();
  const user = useCurrentUser()!;
  const toast = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const b = state.bookings.find((x) => x.id === decodeURIComponent(id) && x.customerId === user.id);
  const tour = state.tours.find((t) => t.id === b?.tourId);

  if (!b || !tour)
    return <ErrorState icon={<Ticket />} title="Booking not found" description="This booking doesn't exist or belongs to another account." actions={<ButtonLink href="/dashboard/bookings">Back to bookings</ButtonLink>} />;

  const days = daysUntil(b.date);
  const refundPct = days >= 30 ? 100 : days >= 14 ? 50 : 0;
  const canCancel = (b.status === "Confirmed" || b.status === "Pending") && days > 0;
  const docs = state.documents.filter((d) => d.customerId === user.id && d.fileName.includes(b.id));

  return (
    <div className="space-y-6">
      <Link href="/dashboard/bookings" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> My bookings
      </Link>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="relative h-40 md:h-52">
          <Image src={img(tour.image, 1600)} alt={tour.title} fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 text-white md:p-6">
            <div>
              <p className="flex items-center gap-1.5 text-sm text-white/80">
                <MapPin className="size-4" /> {tour.location}
              </p>
              <h1 className="mt-1 text-2xl font-bold md:text-3xl">{tour.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-white/15 px-3 py-1.5 font-mono text-sm backdrop-blur">{b.id}</span>
              <StatusBadge status={b.status} className="bg-white" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-line p-4">
          <Button variant="outline" size="sm" onClick={() => (downloadInvoice(b, tour, user), toast({ title: "Invoice downloaded" }))}>
            <Download /> Download Invoice
          </Button>
          <Button variant="outline" size="sm" onClick={() => (downloadVoucher(b, tour), toast({ title: "Voucher downloaded" }))} disabled={b.status === "Cancelled" || b.paymentStatus === "Pending"}>
            <Ticket /> Download Voucher
          </Button>
          <ButtonLink href={`/dashboard/messages?new=1&booking=${b.id}`} variant="outline" size="sm">
            <Headphones /> Contact Support
          </ButtonLink>
          {canCancel && (
            <Button variant="danger-outline" size="sm" className="sm:ml-auto" onClick={() => setCancelOpen(true)}>
              <XCircle /> Cancel Booking
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Booking information" />
            <dl className="grid grid-cols-2 gap-5 p-5 md:grid-cols-3">
              <KeyValue label="Departure" value={<span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-muted" /> {formatDate(b.date, "long")}</span>} />
              <KeyValue label="Duration" value={`${tour.days} days / ${tour.nights} nights`} />
              <KeyValue label="Travellers" value={<span className="flex items-center gap-1.5"><Users className="size-4 text-muted" /> {b.adults} adults{b.children ? `, ${b.children} children` : ""}{b.infants ? `, ${b.infants} infants` : ""}</span>} />
              <KeyValue label="Booked on" value={formatDate(b.createdAt)} />
              <KeyValue label="Meeting point" value={tour.meetingPoint} className="col-span-2" />
              <KeyValue label="Add-ons" value={b.addOns.length ? b.addOns.map((a) => addOns.find((x) => x.id === a)?.name).join(", ") : "None"} className="col-span-2 md:col-span-3" />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Travellers" description={`${b.travelers.length} on this booking`} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-slate-50/70 text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-2.5 font-semibold">Name</th>
                    <th className="px-5 py-2.5 font-semibold">Type</th>
                    <th className="px-5 py-2.5 font-semibold">Passport</th>
                    <th className="px-5 py-2.5 font-semibold">Nationality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {b.travelers.map((t) => (
                    <tr key={t.id}>
                      <td className="px-5 py-3 font-medium">
                        {t.firstName} {t.lastName}
                      </td>
                      <td className="px-5 py-3 text-muted">{t.type}</td>
                      <td className="px-5 py-3 font-mono text-[13px]">{t.passport.replace(/.(?=.{3})/g, "•")}</td>
                      <td className="px-5 py-3 text-muted">{t.nationality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="Itinerary" />
            <div className="px-5">
              {tour.itinerary.map((d) => (
                <AccordionItem key={d.day} title={<span><span className="mr-2 font-mono text-xs text-secondary">DAY {String(d.day).padStart(2, "0")}</span>{d.title}</span>}>
                  <p className="text-sm text-slate-700">{d.description}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                    <span className="flex items-center gap-1.5"><Utensils className="size-3.5" /> {d.meals.join(", ") || "No meals"}</span>
                    {d.accommodation && <span className="flex items-center gap-1.5"><BedDouble className="size-3.5" /> {d.accommodation}</span>}
                  </div>
                </AccordionItem>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Payment" action={<StatusBadge status={b.paymentStatus} />} />
            <div className="space-y-2.5 p-5 text-sm">
              <div className="flex justify-between text-muted"><span>Tour price</span><span className="text-ink">{formatMoney(b.subtotal)}</span></div>
              <div className="flex justify-between text-muted"><span>Add-ons</span><span className="text-ink">{formatMoney(b.addOnsTotal)}</span></div>
              <div className="flex justify-between text-muted"><span>Taxes & fees</span><span className="text-ink">{formatMoney(b.taxes)}</span></div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-display text-xl font-bold text-primary">{formatMoney(b.total)}</span>
              </div>
              <p className="flex items-center gap-2 pt-2 text-muted"><CreditCard className="size-4" /> {b.paymentMethod}</p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Documents" />
            <ul className="divide-y divide-line">
              {[{ name: `Invoice_${b.id}.pdf`, act: () => downloadInvoice(b, tour, user) }, { name: `Voucher_${b.id}.pdf`, act: () => downloadVoucher(b, tour) }, ...docs.filter((d) => !d.fileName.startsWith("Invoice")).map((d) => ({ name: d.fileName, act: () => downloadVoucher(b, tour) }))].map((d) => (
                <li key={d.name} className="flex items-center gap-3 px-5 py-3">
                  <FileText className="size-5 text-secondary" />
                  <span className="flex-1 truncate text-sm">{d.name}</span>
                  <button onClick={d.act} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink" aria-label={`Download ${d.name}`}>
                    <Download className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Booking timeline" />
            <div className="p-5">
              <Timeline items={[...b.timeline].reverse().map((e) => ({ id: e.id, title: e.label, meta: `${formatDateTime(e.at)}${e.by ? ` · ${e.by}` : ""}`, state: e.label.toLowerCase().includes("cancel") ? "failed" : "done" }))} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Cancellation policy" />
            <ul className="space-y-2 p-5 text-sm text-slate-700">
              {tour.cancellationPolicy.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-secondary" /> {p}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        tone="danger"
        title="Cancel this booking?"
        confirmLabel="Yes, cancel booking"
        onConfirm={() => {
          actions.requestCancellation(b.id);
          toast({ title: "Booking cancelled", description: refundPct ? `A ${refundPct}% refund will be reviewed by our team.` : "This booking was not eligible for a refund.", tone: "info" });
        }}
      >
        <div className="space-y-3 text-sm">
          <p className="text-muted">Departure is in {days} days. Under this tour&apos;s policy you&apos;re eligible for:</p>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-display text-2xl font-bold text-primary">{formatMoney((b.total * refundPct) / 100)}</p>
            <p className="text-muted">{refundPct}% refund of {formatMoney(b.total)}</p>
          </div>
          <p className="text-muted">This action can&apos;t be undone.</p>
        </div>
      </ConfirmDialog>
    </div>
  );
}
