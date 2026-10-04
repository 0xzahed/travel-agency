"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Ban, CheckCircle2, ChevronLeft, Download, FileText, Mail, Phone, RotateCcw, Send, Ticket, XCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { addOns } from "@/lib/data/tours";
import { downloadInvoice, downloadVoucher } from "@/lib/documents";
import { formatDate, formatDateTime, formatMoney, img, timeAgo } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, Card, CardHeader, KeyValue } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/overlay";
import { Textarea } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { Timeline } from "@/components/ui/widgets";
import { useToast } from "@/components/ui/toast";

type Action = "confirm" | "reject" | "cancel" | "refund" | null;

export default function AdminBookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, actions } = useStore();
  const toast = useToast();
  const [act, setAct] = useState<Action>(null);
  const [note, setNote] = useState("");
  const b = state.bookings.find((x) => x.id === decodeURIComponent(id));
  const tour = state.tours.find((t) => t.id === b?.tourId);
  const c = state.customers.find((x) => x.id === b?.customerId);
  if (!b || !tour || !c) return <ErrorState icon={<Ticket />} title="Booking not found" description="Check the booking ID." actions={<ButtonLink href="/admin/bookings">All bookings</ButtonLink>} />;

  const tickets = state.tickets.filter((t) => t.relatedId === b.id);
  const visa = state.visaApplications.filter((v) => v.customerId === c.id);
  const ACT: Record<Exclude<Action, null>, { title: string; desc: string; label: string; tone: "primary" | "danger"; run: () => void }> = {
    confirm: { title: "Confirm booking?", desc: "The customer will be notified and vouchers released.", label: "Confirm booking", tone: "primary", run: () => (actions.setBookingStatus(b.id, "Confirmed", "Nadia Rahman"), toast({ title: "Booking confirmed", description: `${c.name} has been notified.` })) },
    reject: { title: "Reject booking?", desc: "Use this when the departure can't be fulfilled. The booking will be cancelled.", label: "Reject", tone: "danger", run: () => (actions.setBookingStatus(b.id, "Cancelled", "Nadia Rahman"), toast({ title: "Booking rejected", tone: "info" })) },
    cancel: { title: "Cancel booking?", desc: "The booking will be cancelled. Issue a refund separately if eligible.", label: "Cancel booking", tone: "danger", run: () => (actions.setBookingStatus(b.id, "Cancelled", "Nadia Rahman"), toast({ title: "Booking cancelled", tone: "info" })) },
    refund: { title: `Refund ${formatMoney(b.total)}?`, desc: `The full amount will be returned to ${b.paymentMethod}. This also cancels the booking.`, label: "Issue refund", tone: "danger", run: () => (actions.refundBooking(b.id, "Nadia Rahman"), toast({ title: "Refund issued", description: "5–7 working days to arrive." })) },
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> Bookings
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-2xl font-bold">{b.id}</h1>
            <StatusBadge status={b.status} />
            <StatusBadge status={b.paymentStatus} />
          </div>
          <p className="mt-1 text-sm text-muted">
            Created {formatDateTime(b.createdAt)} · {tour.title}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {b.status === "Pending" && (
            <>
              <Button onClick={() => setAct("confirm")}>
                <CheckCircle2 /> Confirm
              </Button>
              <Button variant="danger-outline" onClick={() => setAct("reject")}>
                <XCircle /> Reject
              </Button>
            </>
          )}
          {b.paymentStatus === "Pending" && (
            <Button variant="outline" onClick={() => (actions.markBookingPaid(b.id), toast({ title: "Marked as paid" }))}>
              Mark as paid
            </Button>
          )}
          {b.status === "Confirmed" && (
            <Button variant="danger-outline" onClick={() => setAct("cancel")}>
              <Ban /> Cancel
            </Button>
          )}
          {b.paymentStatus === "Paid" && (
            <Button variant="danger-outline" onClick={() => setAct("refund")}>
              <RotateCcw /> Refund
            </Button>
          )}
          <Button variant="outline" onClick={() => (actions.sendBookingConfirmation(b.id), toast({ title: "Confirmation sent", description: `Emailed to ${c.email}` }))}>
            <Send /> Send confirmation
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Tour information" action={<Link href={`/admin/tours/${tour.id}`} className="text-sm font-medium text-secondary">Edit tour</Link>} />
            <div className="flex flex-col gap-5 p-5 sm:flex-row">
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl sm:w-44">
                <Image src={img(tour.image, 400)} alt="" fill sizes="176px" className="object-cover" />
              </div>
              <dl className="grid flex-1 grid-cols-2 gap-4">
                <KeyValue label="Tour" value={tour.title} className="col-span-2" />
                <KeyValue label="Travel date" value={formatDate(b.date, "long")} />
                <KeyValue label="Duration" value={`${tour.days} days`} />
                <KeyValue label="Guests" value={`${b.adults} adults, ${b.children} children, ${b.infants} infants`} />
                <KeyValue label="Add-ons" value={b.addOns.map((a) => addOns.find((x) => x.id === a)?.name).join(", ") || "None"} />
              </dl>
            </div>
          </Card>

          <Card>
            <CardHeader title="Traveller list" description={`${b.travelers.length} travellers`} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-slate-50/70 text-xs uppercase tracking-wide text-muted">
                    {["Name", "Type", "Passport", "Nationality", "Date of birth"].map((h) => (
                      <th key={h} className="px-5 py-2.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {b.travelers.map((t) => (
                    <tr key={t.id}>
                      <td className="px-5 py-3 font-medium">
                        {t.firstName} {t.lastName}
                      </td>
                      <td className="px-5 py-3">{t.type}</td>
                      <td className="px-5 py-3 font-mono text-[13px]">{t.passport}</td>
                      <td className="px-5 py-3">{t.nationality}</td>
                      <td className="px-5 py-3">{formatDate(t.dob)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="Payment" />
            <dl className="grid grid-cols-2 gap-4 p-5 md:grid-cols-4">
              <KeyValue label="Subtotal" value={formatMoney(b.subtotal)} />
              <KeyValue label="Add-ons" value={formatMoney(b.addOnsTotal)} />
              <KeyValue label="Taxes" value={formatMoney(b.taxes)} />
              <KeyValue label="Total" value={<span className="font-display text-lg text-primary">{formatMoney(b.total)}</span>} />
              <KeyValue label="Method" value={b.paymentMethod} className="col-span-2" />
              <KeyValue label="Status" value={<StatusBadge status={b.paymentStatus} />} />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Internal notes" description="Visible to staff only" />
            <div className="space-y-4 p-5">
              {b.notes.length === 0 && <p className="text-sm text-muted">No notes yet.</p>}
              {b.notes.map((n) => (
                <div key={n.id} className="rounded-xl bg-warning-50/60 p-3.5 text-sm ring-1 ring-amber-100">
                  <p>{n.text}</p>
                  <p className="mt-1.5 text-xs text-muted">
                    {n.author} · {timeAgo(n.at)}
                  </p>
                </div>
              ))}
              <Textarea aria-label="Add a note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for the team…" />
              <div className="flex justify-end">
                <Button size="sm" disabled={!note.trim()} onClick={() => (actions.addBookingNote(b.id, note.trim()), setNote(""), toast({ title: "Note added" }))}>
                  Add note
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" action={<Link href={`/admin/customers/${c.id}`} className="text-sm font-medium text-secondary">Profile</Link>} />
            <div className="p-5">
              <div className="flex items-center gap-3">
                <Avatar src={c.avatar} name={c.name} size={48} />
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted">{c.id} · {c.nationality}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2"><Mail className="size-4 text-muted" /> {c.email}</li>
                <li className="flex items-center gap-2"><Phone className="size-4 text-muted" /> {c.phone}</li>
              </ul>
              <p className="mt-4 text-xs text-muted">
                {state.bookings.filter((x) => x.customerId === c.id).length} bookings · {visa.length} visa applications · {tickets.length} tickets on this booking
              </p>
            </div>
          </Card>
          <Card>
            <CardHeader title="Documents" />
            <ul className="divide-y divide-line">
              {[
                [`Invoice_${b.id}.pdf`, () => downloadInvoice(b, tour, c)],
                [`Voucher_${b.id}.pdf`, () => downloadVoucher(b, tour)],
              ].map(([n, fn]) => (
                <li key={n as string} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <FileText className="size-4 text-secondary" />
                  <span className="flex-1 truncate">{n as string}</span>
                  <button onClick={fn as () => void} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-slate-100" aria-label={`Download ${n}`}>
                    <Download className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Timeline" />
            <div className="p-5">
              <Timeline items={[...b.timeline].reverse().map((e) => ({ id: e.id, title: e.label, meta: `${formatDateTime(e.at)}${e.by ? ` · ${e.by}` : ""}`, state: /cancel|reject/i.test(e.label) ? "failed" : "done" }))} />
            </div>
          </Card>
        </div>
      </div>

      {act && <ConfirmDialog open onClose={() => setAct(null)} title={ACT[act].title} description={ACT[act].desc} confirmLabel={ACT[act].label} tone={ACT[act].tone} onConfirm={ACT[act].run} />}
    </div>
  );
}
