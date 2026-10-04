"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Ban, ChevronLeft, Mail, MapPin, Pencil, Phone, UserCheck, UserX } from "lucide-react";
import { useStore } from "@/lib/store";
import { visaCountries } from "@/lib/data/visa";
import { formatDate, formatMoney } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, Card, CardHeader, KeyValue } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { Input, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/overlay";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { StatsCard } from "@/components/shared/stats-card";
import { CalendarCheck, FileCheck2, LifeBuoy, Wallet } from "lucide-react";

function Inner({ id }: { id: string }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const params = useSearchParams();
  const c = state.customers.find((x) => x.id === id);
  const [tab, setTab] = useState<"bookings" | "visa" | "payments" | "tickets">("bookings");
  const [edit, setEdit] = useState(params.get("edit") === "1");
  const [f, setF] = useState(c ? { name: c.name, email: c.email, phone: c.phone, address: c.address } : null);
  if (!c || !f) return <ErrorState icon={<UserX />} title="Customer not found" description="This customer may have been removed." actions={<ButtonLink href="/admin/customers">All customers</ButtonLink>} />;

  const bookings = state.bookings.filter((b) => b.customerId === c.id);
  const visas = state.visaApplications.filter((v) => v.customerId === c.id);
  const pays = state.payments.filter((p) => p.customerId === c.id);
  const tickets = state.tickets.filter((t) => t.customerId === c.id);
  const spent = pays.filter((p) => p.kind === "Payment" && p.status === "Completed").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> Customers
      </Link>
      <Card className="p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <Avatar src={c.avatar} name={c.name} size={72} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{c.name}</h1>
              <StatusBadge status={c.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
              <span className="flex items-center gap-1.5"><Mail className="size-4" /> {c.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="size-4" /> {c.phone}</span>
              <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {c.address}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEdit(true)}>
              <Pencil /> Edit
            </Button>
            {c.status === "Active" ? (
              <Button variant="danger-outline" onClick={() => (actions.updateCustomer(c.id, { status: "Suspended" }), toast({ title: "Customer suspended", tone: "warning" }))}>
                <Ban /> Suspend
              </Button>
            ) : (
              <Button onClick={() => (actions.updateCustomer(c.id, { status: "Active" }), toast({ title: "Customer reactivated" }))}>
                <UserCheck /> Reactivate
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard label="Bookings" value={bookings.length} icon={<CalendarCheck />} />
        <StatsCard label="Total spent" value={formatMoney(spent)} icon={<Wallet />} tone="success" />
        <StatsCard label="Visa applications" value={visas.length} icon={<FileCheck2 />} tone="info" />
        <StatsCard label="Support tickets" value={tickets.length} icon={<LifeBuoy />} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card>
          <div className="px-5 pt-3">
            <Tabs value={tab} onChange={setTab} tabs={[{ value: "bookings", label: "Bookings", count: bookings.length }, { value: "visa", label: "Visa", count: visas.length }, { value: "payments", label: "Payments", count: pays.length }, { value: "tickets", label: "Tickets", count: tickets.length }]} />
          </div>
          <ul className="divide-y divide-line">
            {tab === "bookings" &&
              (bookings.length ? bookings.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/bookings/${b.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-slate-50">
                    <span className="font-mono text-[13px] text-primary">{b.id}</span>
                    <span className="min-w-0 flex-1 truncate text-sm">{state.tours.find((t) => t.id === b.tourId)?.title}</span>
                    <span className="text-sm text-muted">{formatDate(b.date)}</span>
                    <span className="text-sm font-semibold">{formatMoney(b.total)}</span>
                    <StatusBadge status={b.status} />
                  </Link>
                </li>
              )) : <EmptyState icon={<CalendarCheck />} title="No bookings yet" />)}
            {tab === "visa" &&
              (visas.length ? visas.map((v) => (
                <li key={v.id}>
                  <Link href={`/admin/visa/${v.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-slate-50">
                    <span className="font-mono text-[13px] text-primary">{v.id}</span>
                    <span className="flex-1 text-sm">{visaCountries.find((x) => x.id === v.countryId)?.name} · {v.type}</span>
                    <StatusBadge status={v.status} />
                  </Link>
                </li>
              )) : <EmptyState icon={<FileCheck2 />} title="No visa applications" />)}
            {tab === "payments" &&
              (pays.length ? pays.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <span className="font-mono text-[13px]">{p.id}</span>
                  <span className="flex-1 text-sm text-muted">{p.method} · {formatDate(p.date)}</span>
                  <span className="text-sm font-semibold">{formatMoney(p.amount)}</span>
                  <StatusBadge status={p.status} />
                </li>
              )) : <EmptyState icon={<Wallet />} title="No payments" />)}
            {tab === "tickets" &&
              (tickets.length ? tickets.map((t) => (
                <li key={t.id}>
                  <Link href={`/admin/support/${t.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-slate-50">
                    <span className="font-mono text-[13px]">{t.id}</span>
                    <span className="flex-1 truncate text-sm">{t.subject}</span>
                    <StatusBadge status={t.status} />
                  </Link>
                </li>
              )) : <EmptyState icon={<LifeBuoy />} title="No tickets" />)}
          </ul>
        </Card>
        <Card className="h-fit">
          <CardHeader title="Profile" />
          <dl className="grid grid-cols-2 gap-4 p-5">
            <KeyValue label="Customer ID" value={c.id} />
            <KeyValue label="Joined" value={formatDate(c.joinedAt)} />
            <KeyValue label="Nationality" value={c.nationality} />
            <KeyValue label="Date of birth" value={formatDate(c.dob)} />
            <KeyValue label="Passport" value={<span className="font-mono">{c.passport}</span>} />
            <KeyValue label="Expires" value={formatDate(c.passportExpiry)} />
            <KeyValue label="2FA" value={c.twoFactor ? "Enabled" : "Off"} />
            <KeyValue label="Saved tours" value={c.savedTours.length} />
          </dl>
        </Card>
      </div>

      <Modal
        open={edit}
        onClose={() => setEdit(false)}
        title="Edit customer"
        footer={
          <>
            <Button variant="outline" onClick={() => setEdit(false)}>
              Cancel
            </Button>
            <Button onClick={() => (actions.updateCustomer(c.id, f), setEdit(false), toast({ title: "Customer updated" }))}>Save</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Input label="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <Input label="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <Textarea wrapperClassName="sm:col-span-2" label="Address" rows={2} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} className="min-h-0" />
        </div>
      </Modal>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { hydrated } = useStore();
  if (!hydrated) return null;
  return (
    <Suspense>
      <Inner key={id} id={id} />
    </Suspense>
  );
}
