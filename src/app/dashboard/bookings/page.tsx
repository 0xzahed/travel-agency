"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, CalendarX2, Eye, Users } from "lucide-react";
import { useCurrentUser, useStore } from "@/lib/store";
import type { Booking, BookingStatus } from "@/lib/types";
import { formatDate, formatMoney, img } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/states";

type F = "All" | BookingStatus;

export default function BookingsPage() {
  const { state } = useStore();
  const user = useCurrentUser()!;
  const router = useRouter();
  const [tab, setTab] = useState<F>("All");
  const mine = state.bookings.filter((b) => b.customerId === user.id);
  const rows = mine.filter((b) => tab === "All" || b.status === tab);
  const tour = (b: Booking) => state.tours.find((t) => t.id === b.tourId);

  const columns: Column<Booking>[] = [
    { key: "id", header: "Booking ID", cell: (b) => <span className="font-mono text-[13px] font-medium text-primary">{b.id}</span>, sort: (b) => b.id },
    {
      key: "tour",
      header: "Tour",
      cell: (b) => (
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
            <Image src={img(tour(b)?.image ?? "", 120)} alt="" fill sizes="40px" className="object-cover" />
          </div>
          <div className="max-w-[220px]">
            <p className="truncate font-medium">{tour(b)?.title}</p>
            <p className="truncate text-xs text-muted">{tour(b)?.location}</p>
          </div>
        </div>
      ),
    },
    { key: "date", header: "Date", cell: (b) => formatDate(b.date), sort: (b) => b.date },
    { key: "travelers", header: "Travelers", cell: (b) => b.adults + b.children + b.infants },
    { key: "amount", header: "Amount", cell: (b) => <span className="font-semibold">{formatMoney(b.total)}</span>, sort: (b) => b.total },
    { key: "status", header: "Status", cell: (b) => <StatusBadge status={b.status} /> },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (b) => (
        <Link href={`/dashboard/bookings/${b.id}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-secondary hover:bg-primary-50">
          <Eye className="size-4" /> View
        </Link>
      ),
      className: "text-right",
    },
  ];

  return (
    <>
      <PageHeader title="My Bookings" description="All your tour bookings, past and upcoming." actions={<ButtonLink href="/tours">Book a new tour</ButtonLink>} />
      <Card>
        <div className="px-5 pt-3">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={(["All", "Confirmed", "Pending", "Completed", "Cancelled"] as F[]).map((s) => ({ value: s, label: s, count: s === "All" ? mine.length : mine.filter((b) => b.status === s).length }))}
          />
        </div>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(b) => b.id}
          caption="Your bookings"
          initialSort={{ key: "date", dir: "desc" }}
          onRowClick={(b) => router.push(`/dashboard/bookings/${b.id}`)}
          mobileCard={(b) => (
            <Link href={`/dashboard/bookings/${b.id}`} className="flex gap-4 p-4 active:bg-slate-50">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                <Image src={img(tour(b)?.image ?? "", 200)} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-semibold">{tour(b)?.title}</p>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-0.5 font-mono text-xs text-muted">{b.id}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3.5" /> {formatDate(b.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" /> {b.adults + b.children + b.infants}
                  </span>
                  <span className="ml-auto text-sm font-semibold text-ink">{formatMoney(b.total)}</span>
                </div>
              </div>
            </Link>
          )}
          empty={
            <EmptyState
              icon={<CalendarX2 />}
              title={tab === "All" ? "No bookings yet" : `No ${tab.toLowerCase()} bookings`}
              description="Your adventures will show up here once you book a tour."
              action={<ButtonLink href="/tours">Explore tours</ButtonLink>}
            />
          }
        />
      </Card>
    </>
  );
}
