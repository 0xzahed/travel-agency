"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, LifeBuoy, Mail } from "lucide-react";
import { useStore } from "@/lib/store";
import { adminUsers, CURRENT_ADMIN_ID, supportAgents } from "@/lib/data/people";
import type { Priority, TicketStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, Card, CardHeader, KeyValue } from "@/components/ui/primitives";
import { Select } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { TicketThread } from "@/components/shared/ticket-thread";

export default function AdminTicket({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, actions } = useStore();
  const toast = useToast();
  const t = state.tickets.find((x) => x.id === id);
  if (!t) return <ErrorState icon={<LifeBuoy />} title="Ticket not found" description="It may have been deleted." actions={<ButtonLink href="/admin/support">All tickets</ButtonLink>} />;
  const c = state.customers.find((x) => x.id === t.customerId);
  const me = adminUsers.find((a) => a.id === CURRENT_ADMIN_ID)!;

  return (
    <div className="space-y-5">
      <Link href="/admin/support" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> Support tickets
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{t.subject}</h1>
        <StatusBadge status={t.status} />
        <StatusBadge status={t.priority} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card className="flex h-[min(680px,calc(100dvh-240px))] min-h-[440px] flex-col overflow-hidden">
          <TicketThread
            ticket={t}
            viewer="agent"
            onSend={(text, att) => {
              actions.replyTicket(t.id, "agent", t.assignedTo ?? me.name, text, att);
              if (!t.assignedTo) actions.updateTicket(t.id, { assignedTo: me.name });
              toast({ title: "Reply sent", description: `${c?.name} has been notified.` });
            }}
          />
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Ticket" />
            <div className="space-y-4 p-5">
              <Select label="Status" value={t.status} onChange={(e) => (actions.updateTicket(t.id, { status: e.target.value as TicketStatus }), toast({ title: `Marked ${e.target.value}` }))} options={["Open", "In Progress", "Waiting", "Resolved", "Closed"]} />
              <Select label="Priority" value={t.priority} onChange={(e) => actions.updateTicket(t.id, { priority: e.target.value as Priority })} options={["Low", "Medium", "High", "Urgent"]} />
              <Select label="Assigned agent" value={t.assignedTo ?? ""} onChange={(e) => (actions.updateTicket(t.id, { assignedTo: e.target.value || undefined }), toast({ title: e.target.value ? `Assigned to ${e.target.value}` : "Unassigned" }))} options={[{ value: "", label: "Unassigned" }, ...supportAgents, me.name].filter((v, i, a) => a.indexOf(v) === i)} />
              <dl className="grid grid-cols-2 gap-4 border-t border-line pt-4">
                <KeyValue label="ID" value={<span className="font-mono">{t.id}</span>} />
                <KeyValue label="Category" value={t.category} />
                <KeyValue label="Opened" value={formatDateTime(t.createdAt)} className="col-span-2" />
                {t.relatedId && <KeyValue label="Related booking" value={<Link className="text-secondary hover:underline" href={`/admin/bookings/${t.relatedId}`}>{t.relatedId}</Link>} className="col-span-2" />}
              </dl>
            </div>
          </Card>
          {c && (
            <Card>
              <CardHeader title="Customer" />
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar src={c.avatar} name={c.name} size={40} />
                  <div>
                    <Link href={`/admin/customers/${c.id}`} className="font-semibold hover:text-primary">
                      {c.name}
                    </Link>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <Mail className="size-3" /> {c.email}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted">
                  {state.bookings.filter((b) => b.customerId === c.id).length} bookings · {state.tickets.filter((x) => x.customerId === c.id).length} tickets
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
