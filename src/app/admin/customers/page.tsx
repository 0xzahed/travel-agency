"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Eye, MoreHorizontal, Pencil, UserCheck, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { downloadCsv } from "@/lib/documents";
import { formatDate, formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, Card, PageHeader } from "@/components/ui/primitives";
import { Dropdown } from "@/components/ui/disclosure";
import { Select } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/overlay";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { Toolbar } from "@/components/admin/toolbar";

export default function CustomersAdmin() {
  const { state, actions } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [suspend, setSuspend] = useState<User | null>(null);

  const stats = (c: User) => {
    const bs = state.bookings.filter((b) => b.customerId === c.id);
    return {
      bookings: bs.length,
      visa: state.visaApplications.filter((v) => v.customerId === c.id).length,
      spent: state.payments.filter((p) => p.customerId === c.id && p.kind === "Payment" && p.status === "Completed").reduce((s, p) => s + p.amount, 0),
    };
  };
  const rows = useMemo(() => state.customers.filter((c) => (!q || `${c.name} ${c.email} ${c.phone} ${c.id}`.toLowerCase().includes(q.toLowerCase())) && (!status || c.status === status)), [state.customers, q, status]);

  const menu = (c: User) => (
    <Dropdown
      label={`Actions for ${c.name}`}
      trigger={
        <span className="grid size-8 place-items-center rounded-lg text-muted hover:bg-slate-100">
          <MoreHorizontal className="size-4" />
        </span>
      }
      items={[
        { label: "View", icon: <Eye />, onClick: () => router.push(`/admin/customers/${c.id}`) },
        { label: "Edit", icon: <Pencil />, onClick: () => router.push(`/admin/customers/${c.id}?edit=1`) },
        c.status === "Active"
          ? { label: "Suspend", icon: <Ban />, danger: true, onClick: () => setSuspend(c) }
          : { label: "Reactivate", icon: <UserCheck />, onClick: () => (actions.updateCustomer(c.id, { status: "Active" }), toast({ title: `${c.name} reactivated` })) },
      ]}
    />
  );

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Customer",
      cell: (c) => (
        <span className="flex items-center gap-3">
          <Avatar src={c.avatar} name={c.name} size={34} />
          <span>
            <span className="block font-medium">{c.name}</span>
            <span className="block text-xs text-muted">{c.id}</span>
          </span>
        </span>
      ),
      sort: (c) => c.name,
    },
    { key: "email", header: "Email", cell: (c) => c.email },
    { key: "phone", header: "Phone", cell: (c) => <span className="text-muted">{c.phone}</span> },
    { key: "bookings", header: "Bookings", cell: (c) => stats(c).bookings, sort: (c) => stats(c).bookings },
    { key: "visa", header: "Visa apps", cell: (c) => stats(c).visa, sort: (c) => stats(c).visa },
    { key: "spent", header: "Total spent", cell: (c) => <span className="font-semibold">{formatMoney(stats(c).spent)}</span>, sort: (c) => stats(c).spent },
    { key: "status", header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
    { key: "joined", header: "Joined", cell: (c) => formatDate(c.joinedAt), sort: (c) => c.joinedAt },
    { key: "actions", header: <span className="sr-only">Actions</span>, cell: (c) => <div onClick={(e) => e.stopPropagation()}>{menu(c)}</div>, className: "text-right" },
  ];

  return (
    <>
      <PageHeader title="Customers" description={`${state.customers.length} customers · ${state.customers.filter((c) => c.status === "Suspended").length} suspended`} />
      <Card>
        <Toolbar
          query={q}
          onQuery={setQ}
          placeholder="Search name, email, phone…"
          activeFilters={status ? 1 : 0}
          onClear={() => setStatus("")}
          onExport={() => downloadCsv("customers.csv", [["ID", "Name", "Email", "Phone", "Bookings", "Visa", "Spent", "Status", "Joined"], ...rows.map((c) => [c.id, c.name, c.email, c.phone, stats(c).bookings, stats(c).visa, stats(c).spent, c.status, c.joinedAt])])}
          filters={<Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "", label: "All statuses" }, "Active", "Suspended"]} />}
        />
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(c) => c.id}
          onRowClick={(c) => router.push(`/admin/customers/${c.id}`)}
          mobileCard={(c) => (
            <div className="flex items-center gap-3 p-4" onClick={() => router.push(`/admin/customers/${c.id}`)}>
              <Avatar src={c.avatar} name={c.name} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c.name}</p>
                <p className="truncate text-xs text-muted">{c.email}</p>
                <p className="mt-1 text-xs text-muted">
                  {stats(c).bookings} bookings · {formatMoney(stats(c).spent)}
                </p>
              </div>
              <StatusBadge status={c.status} />
            </div>
          )}
          empty={<EmptyState icon={<Users />} title="No customers found" description="Try a different search." />}
        />
      </Card>
      <ConfirmDialog
        open={!!suspend}
        onClose={() => setSuspend(null)}
        tone="danger"
        title={`Suspend ${suspend?.name}?`}
        description="They won't be able to log in or make new bookings. Existing bookings are unaffected."
        confirmLabel="Suspend"
        onConfirm={() => (actions.updateCustomer(suspend!.id, { status: "Suspended" }), toast({ title: "Customer suspended", tone: "warning" }))}
      />
    </>
  );
}
