"use client";

import { Suspense, useState } from "react";
import { BadgeCheck, CalendarCheck, DollarSign, Download, Repeat, TrendingUp, UserPlus, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { dailyRevenue, destinationPerformance, monthlySeries, tourPerformance, visaStatusCounts, weeklyRevenue, yearlyRevenue } from "@/lib/analytics";
import { downloadCsv } from "@/lib/documents";
import { useQueryTab } from "@/lib/use-query-tab";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { StatsCard } from "@/components/shared/stats-card";
import { BarList, ChartCard, ColumnChart, StatusBreakdown, TrendChart } from "@/components/admin/charts";

const TYPES = ["sales", "bookings", "visa", "customers"] as const;

function Inner() {
  const { state } = useStore();
  const [type, setType] = useQueryTab("type", TYPES, "sales");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const months = monthlySeries(state);

  const sales = { daily: dailyRevenue(), weekly: weeklyRevenue(), monthly: months.map((m) => ({ label: m.label, revenue: m.revenue })), yearly: yearlyRevenue() }[period];
  const total = sales.reduce((s, r) => s + r.revenue, 0);

  return (
    <>
      <PageHeader
        title="Reports"
        description="Performance analytics across sales, bookings, visas and customers."
        actions={
          <Button variant="outline" onClick={() => downloadCsv(`report-${type}.csv`, [["Month", "Revenue", "Bookings", "Cancelled", "Visa fees", "New customers"], ...months.map((m) => [m.label, m.revenue, m.bookings, m.cancelled, m.visa, m.newCustomers])])}>
            <Download /> Export CSV
          </Button>
        }
      />
      <Tabs className="mb-6" value={type} onChange={setType} tabs={[{ value: "sales", label: "Revenue" }, { value: "bookings", label: "Bookings" }, { value: "visa", label: "Visa" }, { value: "customers", label: "Customers" }]} />

      {type === "sales" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatsCard label={`Revenue (${period})`} value={formatMoney(total, { compact: true })} icon={<DollarSign />} />
            <StatsCard label="Average order" value={formatMoney(Math.round(state.bookings.reduce((s, b) => s + b.total, 0) / state.bookings.length))} icon={<TrendingUp />} tone="info" />
            <StatsCard label="Best month" value={[...months].sort((a, b) => b.revenue - a.revenue)[0].label} icon={<CalendarCheck />} tone="success" />
            <StatsCard label="Visa revenue share" value={`${Math.round((months.reduce((s, m) => s + m.visa, 0) / months.reduce((s, m) => s + m.revenue, 0)) * 100)}%`} icon={<BadgeCheck />} tone="violet" />
          </div>
          <ChartCard
            title="Revenue"
            description="Gross revenue, USD"
            action={<Tabs size="sm" variant="pill" value={period} onChange={setPeriod} tabs={[{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]} />}
            table={{ head: ["Period", "Revenue"], rows: sales.map((r) => [r.label, formatMoney(r.revenue)]) }}
          >
            {period === "yearly" || period === "weekly" ? <ColumnChart data={sales} x="label" series={[{ key: "revenue", label: "Revenue" }]} format="money" height={320} /> : <TrendChart data={sales} x="label" series={[{ key: "revenue", label: "Revenue" }]} format="money" height={320} />}
          </ChartCard>
        </div>
      )}

      {type === "bookings" && <BookingsReport />}
      {type === "visa" && <VisaReport />}
      {type === "customers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatsCard label="Total customers" value={state.customers.length} icon={<Users />} />
            <StatsCard label="New this year" value={state.customers.filter((c) => c.joinedAt.startsWith("2026")).length} icon={<UserPlus />} tone="success" />
            <StatsCard label="Returning" value={state.customers.filter((c) => state.bookings.filter((b) => b.customerId === c.id).length > 1).length} icon={<Repeat />} tone="info" hint="2+ bookings" />
            <StatsCard label="Repeat rate" value={`${Math.round((state.customers.filter((c) => state.bookings.filter((b) => b.customerId === c.id).length > 1).length / state.customers.length) * 100)}%`} icon={<TrendingUp />} tone="violet" />
          </div>
          <ChartCard
            title="New vs returning customers"
            description="Customers placing a booking each month"
            table={{ head: ["Month", "New", "Returning"], rows: months.map((m, i) => [m.label, 18 + ((i * 7) % 13) + m.newCustomers, 9 + ((i * 5) % 9)]) }}
          >
            <ColumnChart
              data={months.map((m, i) => ({ label: m.label, new: 18 + ((i * 7) % 13) + m.newCustomers, returning: 9 + ((i * 5) % 9) }))}
              x="label"
              stacked
              series={[{ key: "new", label: "New" }, { key: "returning", label: "Returning" }]}
              height={300}
            />
          </ChartCard>
        </div>
      )}
    </>
  );
}

function BookingsReport() {
  const { state } = useStore();
  const dest = destinationPerformance(state);
  const tours = tourPerformance(state).slice(0, 8);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Destination performance" description="Bookings by destination" table={{ head: ["Destination", "Bookings", "Revenue"], rows: dest.map((d) => [d.name, d.bookings, formatMoney(d.revenue)]) }}>
          <BarList items={dest.map((d) => ({ label: d.name, value: d.bookings, sub: formatMoney(d.revenue, { compact: true }) }))} />
        </ChartCard>
        <ChartCard title="Revenue by destination" description="Paid bookings, USD" table={{ head: ["Destination", "Revenue"], rows: dest.map((d) => [d.name, formatMoney(d.revenue)]) }}>
          <ColumnChart data={dest.map((d) => ({ label: d.name, revenue: d.revenue }))} x="label" series={[{ key: "revenue", label: "Revenue" }]} format="money" height={280} />
        </ChartCard>
      </div>
      <Card>
        <CardHeader title="Tour performance" description="Top tours by all-time bookings" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-slate-50/70 text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-semibold">#</th>
                <th className="px-5 py-3 font-semibold">Tour</th>
                <th className="px-5 py-3 text-right font-semibold">Bookings</th>
                <th className="px-5 py-3 text-right font-semibold">Revenue (sample)</th>
                <th className="px-5 py-3 text-right font-semibold">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tours.map((t, i) => (
                <tr key={t.id}>
                  <td className="px-5 py-3 text-muted">{i + 1}</td>
                  <td className="px-5 py-3 font-medium">{t.name}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{t.bookings}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatMoney(t.revenue)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{t.rating.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function VisaReport() {
  const { state } = useStore();
  const apps = state.visaApplications;
  const decided = apps.filter((v) => ["Approved", "Completed", "Rejected"].includes(v.status));
  const approved = decided.filter((v) => v.status !== "Rejected").length;
  const months = monthlySeries(state).map((m, i) => ({ label: m.label, applications: 14 + ((i * 11) % 17) + Math.round(m.visa / 120) }));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard label="Applications" value={apps.length} icon={<BadgeCheck />} />
        <StatsCard label="Approval rate" value={`${Math.round((approved / Math.max(1, decided.length)) * 100)}%`} icon={<TrendingUp />} tone="success" hint={`${decided.length} decided`} />
        <StatsCard label="In progress" value={apps.filter((v) => !["Approved", "Completed", "Rejected"].includes(v.status)).length} icon={<CalendarCheck />} tone="info" />
        <StatsCard label="Avg. processing" value="6.2 days" icon={<Repeat />} tone="violet" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard title="Applications per month" table={{ head: ["Month", "Applications"], rows: months.map((m) => [m.label, m.applications]) }}>
          <ColumnChart data={months} x="label" series={[{ key: "applications", label: "Applications" }]} height={280} />
        </ChartCard>
        <ChartCard title="Processing status" table={{ head: ["Status", "Count"], rows: visaStatusCounts(state).map((v) => [v.status, v.count]) }}>
          <StatusBreakdown items={visaStatusCounts(state)} />
        </ChartCard>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
