"use client";

import Link from "next/link";
import { CreditCard, Receipt, RotateCcw, Wallet } from "lucide-react";
import { useCurrentUser, useStore } from "@/lib/store";
import type { Payment } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/states";
import { StatsCard } from "@/components/shared/stats-card";

export default function PaymentsPage() {
  const { state } = useStore();
  const user = useCurrentUser()!;
  const mine = state.payments.filter((p) => p.customerId === user.id);
  const paid = mine.filter((p) => p.kind === "Payment" && p.status === "Completed").reduce((s, p) => s + p.amount, 0);
  const pending = mine.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0);
  const refunded = mine.filter((p) => p.kind === "Refund").reduce((s, p) => s + p.amount, 0);

  const columns: Column<Payment>[] = [
    { key: "id", header: "Transaction", cell: (p) => <span className="font-mono text-[13px]">{p.id}</span> },
    {
      key: "for",
      header: "For",
      cell: (p) =>
        p.bookingId ? (
          <Link href={`/dashboard/bookings/${p.bookingId}`} className="font-medium text-secondary hover:underline">
            {p.bookingId}
          </Link>
        ) : (
          <span className="font-medium">{p.visaId}</span>
        ),
    },
    { key: "date", header: "Date", cell: (p) => formatDate(p.date), sort: (p) => p.date },
    { key: "method", header: "Method", cell: (p) => <span className="flex items-center gap-2 text-muted"><CreditCard className="size-4" /> {p.method}</span> },
    { key: "amount", header: "Amount", cell: (p) => <span className={p.kind === "Refund" ? "font-semibold text-success" : "font-semibold"}>{p.kind === "Refund" ? "+" : ""}{formatMoney(p.amount)}</span>, sort: (p) => p.amount },
    { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <>
      <PageHeader title="Payments" description="Your transactions, refunds and saved payment methods." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total paid" value={formatMoney(paid)} icon={<Wallet />} />
        <StatsCard label="Pending" value={formatMoney(pending)} icon={<Receipt />} tone="warning" />
        <StatsCard label="Refunded" value={formatMoney(refunded)} icon={<RotateCcw />} tone="success" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Transaction history" />
          <DataTable
            rows={mine}
            columns={columns}
            rowKey={(p) => p.id}
            initialSort={{ key: "date", dir: "desc" }}
            mobileCard={(p) => (
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.bookingId ?? p.visaId}</p>
                  <p className="text-xs text-muted">{formatDate(p.date)} · {p.method}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatMoney(p.amount)}</p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            )}
            empty={<EmptyState icon={<Receipt />} title="No payments yet" description="Transactions will appear after your first booking." />}
          />
        </Card>
        <Card className="h-fit">
          <CardHeader title="Saved methods" />
          <div className="space-y-3 p-5">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-5 text-white">
              <p className="text-xs text-white/70">Default card</p>
              <p className="mt-6 font-mono text-lg tracking-widest">•••• •••• •••• 4242</p>
              <div className="mt-4 flex justify-between text-xs">
                <span>{user.name.toUpperCase()}</span>
                <span>09/29</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-line p-3 text-sm">
              <span className="flex items-center gap-2"><CreditCard className="size-4 text-muted" /> Mastercard •••• 8812</span>
              <span className="text-xs text-muted">Exp 03/28</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
