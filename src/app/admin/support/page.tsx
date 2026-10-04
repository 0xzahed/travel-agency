"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Inbox, LifeBuoy, MessageCircleReply, Timer } from "lucide-react";
import { useStore } from "@/lib/store";
import { supportAgents } from "@/lib/data/people";
import type { SupportTicket, TicketStatus } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, Card, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { Select } from "@/components/ui/field";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/states";
import { StatsCard } from "@/components/shared/stats-card";
import { Toolbar } from "@/components/admin/toolbar";

type S = "All" | TicketStatus;

function Inner() {
  const { state } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const messagesView = params.get("view") === "messages";
  const [tab, setTab] = useState<S>("All");
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState("");
  const [agent, setAgent] = useState("");
  const cust = (t: SupportTicket) => state.customers.find((c) => c.id === t.customerId);

  const base = useMemo(
    () =>
      state.tickets
        .filter((t) => (!messagesView || t.messages.at(-1)?.from === "customer") && (!q || `${t.id} ${t.subject} ${cust(t)?.name}`.toLowerCase().includes(q.toLowerCase())) && (!priority || t.priority === priority) && (!agent || (agent === "none" ? !t.assignedTo : t.assignedTo === agent)))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.tickets, q, priority, agent, messagesView],
  );
  const rows = base.filter((t) => tab === "All" || t.status === tab);

  const columns: Column<SupportTicket>[] = [
    { key: "id", header: "Ticket", cell: (t) => <span className="font-mono text-[13px] text-primary">{t.id}</span>, sort: (t) => t.id },
    { key: "subject", header: "Subject", cell: (t) => <span><span className="block max-w-[260px] truncate font-medium">{t.subject}</span><span className="block text-xs text-muted">{t.category}</span></span> },
    { key: "customer", header: "Customer", cell: (t) => <span className="flex items-center gap-2"><Avatar src={cust(t)?.avatar} name={cust(t)?.name ?? "?"} size={26} />{cust(t)?.name}</span> },
    { key: "priority", header: "Priority", cell: (t) => <StatusBadge status={t.priority} />, sort: (t) => ["Low", "Medium", "High", "Urgent"].indexOf(t.priority) },
    { key: "status", header: "Status", cell: (t) => <StatusBadge status={t.status} /> },
    { key: "agent", header: "Assigned", cell: (t) => t.assignedTo ?? <span className="text-muted">Unassigned</span> },
    { key: "updated", header: "Updated", cell: (t) => <span className="text-muted">{timeAgo(t.updatedAt)}</span>, sort: (t) => t.updatedAt },
  ];

  return (
    <>
      <PageHeader title={messagesView ? "Messages" : "Support tickets"} description={messagesView ? "Conversations waiting on a reply from our team." : "Every customer request across bookings, visas and payments."} />
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard label="Open" value={state.tickets.filter((t) => t.status === "Open").length} icon={<Inbox />} />
        <StatsCard label="Awaiting reply" value={state.tickets.filter((t) => t.messages.at(-1)?.from === "customer" && !["Resolved", "Closed"].includes(t.status)).length} icon={<MessageCircleReply />} tone="accent" href="/admin/support?view=messages" />
        <StatsCard label="Avg. first response" value="1h 45m" icon={<Timer />} tone="info" delta={-12} hint="faster than last month" />
        <StatsCard label="Resolved (30d)" value={state.tickets.filter((t) => ["Resolved", "Closed"].includes(t.status)).length + 46} icon={<LifeBuoy />} tone="success" />
      </div>
      <Card>
        <div className="px-5 pt-3">
          <Tabs value={tab} onChange={setTab} tabs={(["All", "Open", "In Progress", "Waiting", "Resolved", "Closed"] as S[]).map((s) => ({ value: s, label: s, count: s === "All" ? base.length : base.filter((t) => t.status === s).length }))} />
        </div>
        <Toolbar
          query={q}
          onQuery={setQ}
          placeholder="Search tickets…"
          activeFilters={[priority, agent].filter(Boolean).length}
          onClear={() => (setPriority(""), setAgent(""))}
          filters={
            <>
              <Select aria-label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} options={[{ value: "", label: "Any priority" }, "Low", "Medium", "High", "Urgent"]} />
              <Select aria-label="Assigned agent" value={agent} onChange={(e) => setAgent(e.target.value)} options={[{ value: "", label: "All agents" }, { value: "none", label: "Unassigned" }, ...supportAgents]} />
            </>
          }
        />
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(t) => t.id}
          onRowClick={(t) => router.push(`/admin/support/${t.id}`)}
          mobileCard={(t) => (
            <button onClick={() => router.push(`/admin/support/${t.id}`)} className="w-full p-4 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-primary">{t.id}</span>
                <StatusBadge status={t.status} />
              </div>
              <p className="mt-1 font-semibold">{t.subject}</p>
              <p className="text-sm text-muted">
                {cust(t)?.name} · {t.priority} · {timeAgo(t.updatedAt)}
              </p>
            </button>
          )}
          empty={<EmptyState icon={<LifeBuoy />} title="Inbox zero" description="No tickets match. Nice work." />}
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
