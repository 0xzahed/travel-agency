"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarX2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Booking, BookingStatus } from "@/lib/types";
import { downloadCsv } from "@/lib/documents";
import { formatDate, formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, Card, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { Input, Select } from "@/components/ui/field";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/states";
import { Toolbar } from "@/components/admin/toolbar";

type S = "All" | BookingStatus;

export function BookingsAdmin() {
  const { state } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = (params.get("status") as S) || "All";
  const [q, setQ] = useState("");
  const [dest, setDest] = useState("");
  const [tour, setTour] = useState("");
  const [pay, setPay] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const setStatus = (s: S) => router.replace(s === "All" ? pathname : `${pathname}?status=${s}`, { scroll: false });
  const cust = (b: Booking) => state.customers.find((c) => c.id === b.customerId)!;
  const tourOf = (b: Booking) => state.tours.find((t) => t.id === b.tourId);

  const base = useMemo(
    () =>
      state.bookings.filter((b) => {
        const t = tourOf(b);
        const c = cust(b);
        return (
          (!q || `${b.id} ${c?.name} ${c?.email} ${t?.title}`.toLowerCase().includes(q.toLowerCase())) &&
          (!dest || t?.destinationId === dest) &&
          (!tour || b.tourId === tour) &&
          (!pay || b.paymentStatus === pay) &&
          (!from || b.date >= from) &&
          (!to || b.date <= to)
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.bookings, q, dest, tour, pay, from, to],
  );
  const rows = base.filter((b) => status === "All" || b.status === status);

  const columns: Column<Booking>[] = [
    { key: "id", header: "Booking ID", cell: (b) => <span className="font-mono text-[13px] font-medium text-primary">{b.id}</span>, sort: (b) => b.id },
    {
      key: "customer",
      header: "Customer",
      cell: (b) => (
        <span className="flex items-center gap-2.5">
          <Avatar src={cust(b).avatar} name={cust(b).name} size={30} />
          <span>
            <span className="block font-medium">{cust(b).name}</span>
            <span className="block text-xs text-muted">{cust(b).email}</span>
          </span>
        </span>
      ),
      sort: (b) => cust(b).name,
    },
    { key: "tour", header: "Tour", cell: (b) => <span className="block max-w-[200px] truncate">{tourOf(b)?.title}</span>, sort: (b) => tourOf(b)?.title ?? "" },
    { key: "date", header: "Travel date", cell: (b) => formatDate(b.date), sort: (b) => b.date },
    { key: "pax", header: "Pax", cell: (b) => b.adults + b.children + b.infants },
    { key: "amount", header: "Amount", cell: (b) => <span className="font-semibold">{formatMoney(b.total)}</span>, sort: (b) => b.total },
    { key: "payment", header: "Payment", cell: (b) => <StatusBadge status={b.paymentStatus} /> },
    { key: "status", header: "Status", cell: (b) => <StatusBadge status={b.status} /> },
    { key: "created", header: "Created", cell: (b) => <span className="text-muted">{formatDate(b.createdAt)}</span>, sort: (b) => b.createdAt },
  ];

  const active = [dest, tour, pay, from, to].filter(Boolean).length;

  return (
    <>
      <PageHeader title="Bookings" description="Manage and action every tour booking." />
      <Card>
        <div className="px-5 pt-3">
          <Tabs value={status} onChange={setStatus} tabs={(["All", "Pending", "Confirmed", "Completed", "Cancelled"] as S[]).map((s) => ({ value: s, label: s, count: s === "All" ? base.length : base.filter((b) => b.status === s).length }))} />
        </div>
        <Toolbar
          query={q}
          onQuery={setQ}
          placeholder="Search ID, customer, tour…"
          activeFilters={active}
          onClear={() => (setDest(""), setTour(""), setPay(""), setFrom(""), setTo(""))}
          onExport={() => downloadCsv("bookings.csv", [["ID", "Customer", "Tour", "Date", "Pax", "Amount", "Payment", "Status"], ...rows.map((b) => [b.id, cust(b).name, tourOf(b)?.title ?? "", b.date, b.adults + b.children, b.total, b.paymentStatus, b.status])])}
          filters={
            <>
              <Input type="date" aria-label="Travel from" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 w-40" />
              <Input type="date" aria-label="Travel to" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 w-40" />
              <Select aria-label="Destination" value={dest} onChange={(e) => setDest(e.target.value)} options={[{ value: "", label: "All destinations" }, ...state.destinations.map((d) => ({ value: d.id, label: d.name }))]} />
              <Select aria-label="Tour" value={tour} onChange={(e) => setTour(e.target.value)} options={[{ value: "", label: "All tours" }, ...state.tours.map((t) => ({ value: t.id, label: t.title }))]} className="max-w-48" />
              <Select aria-label="Payment status" value={pay} onChange={(e) => setPay(e.target.value)} options={[{ value: "", label: "Any payment" }, "Paid", "Pending", "Refunded"]} />
            </>
          }
        />
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(b) => b.id}
          onRowClick={(b) => router.push(`/admin/bookings/${b.id}`)}
          initialSort={{ key: "created", dir: "desc" }}
          caption="Bookings"
          pageSize={12}
          mobileCard={(b) => (
            <button onClick={() => router.push(`/admin/bookings/${b.id}`)} className="w-full p-4 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-primary">{b.id}</span>
                <StatusBadge status={b.status} />
              </div>
              <p className="mt-1.5 font-semibold">{cust(b).name}</p>
              <p className="truncate text-sm text-muted">{tourOf(b)?.title}</p>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted">{formatDate(b.date)}</span>
                <span className="font-semibold">{formatMoney(b.total)}</span>
              </div>
            </button>
          )}
          empty={<EmptyState icon={<CalendarX2 />} title="No bookings found" description="Try adjusting the filters or search." />}
        />
      </Card>
    </>
  );
}
