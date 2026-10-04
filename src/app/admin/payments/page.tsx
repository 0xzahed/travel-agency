"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarClock, DollarSign, Hourglass, Receipt, RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Payment } from "@/lib/types";
import { downloadCsv } from "@/lib/documents";
import { useQueryTab } from "@/lib/use-query-tab";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { Select } from "@/components/ui/field";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/states";
import { StatsCard } from "@/components/shared/stats-card";
import { Toolbar } from "@/components/admin/toolbar";

function Inner() {
  const { state } = useStore();
  const params = useSearchParams();
  const [tab, setTab] = useQueryTab("tab", ["transactions", "refunds"] as const, "transactions");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [method, setMethod] = useState("");
  const cust = (p: Payment) => state.customers.find((c) => c.id === p.customerId);

  const payments = state.payments.filter((p) => p.kind === "Payment");
  const total = payments.filter((p) => p.status === "Completed").reduce((s, p) => s + p.amount, 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayRev = payments.filter((p) => p.status === "Completed" && p.date.startsWith(today)).reduce((s, p) => s + p.amount, 0);
  const pending = state.payments.filter((p) => p.status === "Pending");
  const refunds = state.payments.filter((p) => p.kind === "Refund");

  const rows = useMemo(
    () =>
      state.payments.filter(
        (p) =>
          (tab === "refunds" ? p.kind === "Refund" : true) &&
          (!q || `${p.id} ${p.bookingId ?? ""} ${p.visaId ?? ""} ${cust(p)?.name}`.toLowerCase().includes(q.toLowerCase())) &&
          (!status || p.status === status) &&
          (!method || p.method === method),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.payments, tab, q, status, method],
  );

  const columns: Column<Payment>[] = [
    { key: "id", header: "Transaction ID", cell: (p) => <span className="font-mono text-[13px]">{p.id}</span>, sort: (p) => p.id },
    { key: "customer", header: "Customer", cell: (p) => <Link href={`/admin/customers/${p.customerId}`} onClick={(e) => e.stopPropagation()} className="font-medium hover:text-primary">{cust(p)?.name}</Link>, sort: (p) => cust(p)?.name ?? "" },
    { key: "booking", header: "Booking", cell: (p) => (p.bookingId ? <Link href={`/admin/bookings/${p.bookingId}`} className="font-mono text-[13px] text-secondary hover:underline">{p.bookingId}</Link> : <Link href={`/admin/visa/${p.visaId}`} className="font-mono text-[13px] text-secondary hover:underline">{p.visaId}</Link>) },
    { key: "amount", header: "Amount", cell: (p) => <span className={p.kind === "Refund" ? "font-semibold text-danger" : "font-semibold"}>{p.kind === "Refund" ? "−" : ""}{formatMoney(p.amount)}</span>, sort: (p) => p.amount },
    { key: "method", header: "Method", cell: (p) => <span className="text-muted">{p.method}</span> },
    { key: "date", header: "Date", cell: (p) => <span className="text-muted">{formatDateTime(p.date)}</span>, sort: (p) => p.date },
    { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <>
      <PageHeader title="Payments" description="Transactions, pending invoices and refunds." />
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard label="Total Revenue" value={formatMoney(total, { compact: true })} icon={<DollarSign />} delta={12.4} hint="vs last year" />
        <StatsCard label="Today's Revenue" value={formatMoney(todayRev)} icon={<CalendarClock />} tone="info" hint={todayRev ? "Live" : "No payments yet today"} />
        <StatsCard label="Pending Payments" value={formatMoney(pending.reduce((s, p) => s + p.amount, 0), { compact: true })} icon={<Hourglass />} tone="warning" hint={`${pending.length} invoices`} />
        <StatsCard label="Refunds" value={formatMoney(refunds.reduce((s, p) => s + p.amount, 0), { compact: true })} icon={<RotateCcw />} tone="accent" hint={`${refunds.length} issued`} />
      </div>
      <Card>
        <div className="px-5 pt-3">
          <Tabs value={tab} onChange={setTab} tabs={[{ value: "transactions", label: "All transactions", count: state.payments.length }, { value: "refunds", label: "Refunds", count: refunds.length }]} />
        </div>
        <Toolbar
          query={q}
          onQuery={setQ}
          placeholder="Search transaction, booking, customer…"
          activeFilters={[status, method].filter(Boolean).length}
          onClear={() => (setStatus(""), setMethod(""))}
          onExport={() => downloadCsv("transactions.csv", [["ID", "Customer", "Reference", "Amount", "Method", "Date", "Status", "Kind"], ...rows.map((p) => [p.id, cust(p)?.name ?? "", p.bookingId ?? p.visaId ?? "", p.amount, p.method, p.date, p.status, p.kind])])}
          filters={
            <>
              <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "", label: "All statuses" }, "Completed", "Pending", "Refunded", "Failed"]} />
              <Select aria-label="Method" value={method} onChange={(e) => setMethod(e.target.value)} options={[{ value: "", label: "All methods" }, "Visa •••• 4242", "Mastercard •••• 8812", "PayPal", "Bank Transfer", "Apple Pay"]} />
            </>
          }
        />
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(p) => p.id}
          initialSort={{ key: "date", dir: "desc" }}
          pageSize={12}
          mobileCard={(p) => (
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-mono text-xs">{p.id}</p>
                <p className="truncate font-medium">{cust(p)?.name}</p>
                <p className="text-xs text-muted">{p.method}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatMoney(p.amount)}</p>
                <StatusBadge status={p.status} />
              </div>
            </div>
          )}
          empty={<EmptyState icon={<Receipt />} title="No transactions" description="Nothing matches these filters." />}
        />
      </Card>
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
