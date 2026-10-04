"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CalendarCheck, Compass, DollarSign, FileCheck2, Hourglass, LifeBuoy, Plus, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { destinationPerformance, monthlySeries, visaStatusCounts } from "@/lib/analytics";
import { formatDate, formatMoney, timeAgo } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { StatSkeleton } from "@/components/ui/states";
import { StatsCard } from "@/components/shared/stats-card";
import { BarList, ChartCard, ColumnChart, StatusBreakdown, TrendChart } from "@/components/admin/charts";

export default function AdminHome() {
  const { state, hydrated } = useStore();
  const router = useRouter();
  const [range, setRange] = useState<"6m" | "10m">("10m");
  const series = monthlySeries(state);
  const shown = range === "6m" ? series.slice(-6) : series;
  const revenue = series.reduce((s, r) => s + r.revenue, 0);
  const pendingPay = state.payments.filter((p) => p.status === "Pending");
  const dest = destinationPerformance(state).slice(0, 6);
  const visa = visaStatusCounts(state);
  const recent = state.bookings.slice(0, 6);
  const tasks = [
    { icon: <FileCheck2 />, label: "Visa applications awaiting review", count: state.visaApplications.filter((v) => ["Submitted", "Under Review"].includes(v.status)).length, href: "/admin/visa?status=Submitted" },
    { icon: <CalendarCheck />, label: "Bookings pending confirmation", count: state.bookings.filter((b) => b.status === "Pending").length, href: "/admin/bookings?status=Pending" },
    { icon: <LifeBuoy />, label: "Open support tickets", count: state.tickets.filter((t) => t.status === "Open").length, href: "/admin/support" },
    { icon: <AlertCircle />, label: "Documents to verify", count: state.visaApplications.flatMap((v) => v.documents).filter((d) => d.status === "Pending").length, href: "/admin/visa/documents" },
  ];

  if (!hydrated)
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    );

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Overview for ${formatDate(new Date(), "long")}`}
        actions={
          <>
            <ButtonLink href="/admin/reports" variant="outline">
              View reports
            </ButtonLink>
            <ButtonLink href="/admin/tours/new">
              <Plus /> Add tour
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        <StatsCard label="Total Revenue" value={formatMoney(revenue, { compact: true })} icon={<DollarSign />} delta={12.4} hint="vs last year" href="/admin/reports?type=sales" />
        <StatsCard label="Total Bookings" value={series.reduce((s, r) => s + r.bookings, 0)} icon={<CalendarCheck />} tone="success" delta={8.1} hint="YTD" href="/admin/bookings" />
        <StatsCard label="Active Tours" value={state.tours.filter((t) => t.status === "published").length} icon={<Compass />} tone="info" hint={`${state.tours.filter((t) => t.status === "draft").length} drafts`} href="/admin/tours" />
        <StatsCard label="Visa Applications" value={state.visaApplications.length} icon={<FileCheck2 />} tone="violet" delta={21} hint="this quarter" href="/admin/visa" />
        <StatsCard label="Customers" value={state.customers.length} icon={<Users />} tone="accent" delta={5.6} hint="registered" href="/admin/customers" />
        <StatsCard label="Pending Payments" value={formatMoney(pendingPay.reduce((s, p) => s + p.amount, 0), { compact: true })} icon={<Hourglass />} tone="warning" hint={`${pendingPay.length} invoices`} href="/admin/payments?status=Pending" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <ChartCard
          title="Revenue Overview"
          description="Tour packages + visa services, 2026"
          action={<Tabs size="sm" variant="pill" value={range} onChange={setRange} tabs={[{ value: "6m", label: "6M" }, { value: "10m", label: "YTD" }]} />}
          table={{ head: ["Month", "Tours", "Visa", "Total"], rows: shown.map((r) => [r.label, formatMoney(r.tours), formatMoney(r.visa), formatMoney(r.revenue)]) }}
        >
          <TrendChart data={shown} x="label" series={[{ key: "tours", label: "Tours" }, { key: "visa", label: "Visa services" }]} format="money" height={280} />
        </ChartCard>
        <Card>
          <CardHeader title="Needs attention" description="Work queues across the team" />
          <ul className="divide-y divide-line">
            {tasks.map((t) => (
              <li key={t.label}>
                <Link href={t.href} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50">
                  <span className="grid size-9 place-items-center rounded-lg bg-accent-50 text-accent-600 [&_svg]:size-4">{t.icon}</span>
                  <span className="flex-1 text-sm">{t.label}</span>
                  <span className="font-display text-lg font-bold tabular-nums">{t.count}</span>
                  <ArrowRight className="size-4 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <ChartCard title="Booking Statistics" description="New vs cancelled bookings per month" table={{ head: ["Month", "Bookings", "Cancelled"], rows: series.map((r) => [r.label, r.bookings, r.cancelled]) }}>
          <ColumnChart data={series} x="label" series={[{ key: "bookings", label: "Bookings" }, { key: "cancelled", label: "Cancelled" }]} />
        </ChartCard>
        <ChartCard title="Popular Destinations" description="By number of bookings" table={{ head: ["Destination", "Bookings", "Revenue"], rows: dest.map((d) => [d.name, d.bookings, formatMoney(d.revenue)]) }}>
          <BarList items={dest.map((d) => ({ label: d.name, value: d.bookings, sub: formatMoney(d.revenue, { compact: true }) }))} />
        </ChartCard>
        <ChartCard title="Visa Applications" description="Current status of all applications" table={{ head: ["Status", "Count"], rows: visa.map((v) => [v.status, v.count]) }} className="lg:col-span-2 2xl:col-span-1">
          <StatusBreakdown items={visa} />
        </ChartCard>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent bookings" action={<Link href="/admin/bookings" className="text-sm font-medium text-secondary hover:text-primary">View all</Link>} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-slate-50/70 text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-semibold">Booking</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Tour</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recent.map((b) => {
                const c = state.customers.find((x) => x.id === b.customerId)!;
                const t = state.tours.find((x) => x.id === b.tourId);
                return (
                  <tr key={b.id} onClick={() => router.push(`/admin/bookings/${b.id}`)} className="cursor-pointer hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-[13px] text-primary">{b.id}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2.5">
                        <Avatar src={c.avatar} name={c.name} size={28} />
                        {c.name}
                      </span>
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-3">{t?.title}</td>
                    <td className="px-5 py-3 font-semibold">{formatMoney(b.total)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-3 text-right text-muted">{timeAgo(b.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
