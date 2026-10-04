"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, MessagesSquare } from "lucide-react";
import { useCurrentUser, useStore } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, KeyValue } from "@/components/ui/primitives";
import { ErrorState } from "@/components/ui/states";
import { TicketThread } from "@/components/shared/ticket-thread";

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, actions } = useStore();
  const user = useCurrentUser()!;
  const t = state.tickets.find((x) => x.id === id && x.customerId === user.id);
  if (!t) return <ErrorState icon={<MessagesSquare />} title="Ticket not found" description="It may have been archived." actions={<ButtonLink href="/dashboard/messages">All messages</ButtonLink>} />;
  const closed = t.status === "Closed";

  return (
    <div className="space-y-5">
      <Link href="/dashboard/messages" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> Messages
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{t.subject}</h1>
        <StatusBadge status={t.status} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <Card className="flex h-[min(640px,calc(100dvh-260px))] min-h-[420px] flex-col overflow-hidden">
          <TicketThread ticket={t} viewer="customer" disabled={closed} onSend={(text, att) => actions.replyTicket(t.id, "customer", user.name, text, att)} />
        </Card>
        <Card className="h-fit p-5">
          <dl className="space-y-4">
            <KeyValue label="Ticket" value={<span className="font-mono">{t.id}</span>} />
            <KeyValue label="Category" value={t.category} />
            <KeyValue label="Priority" value={<StatusBadge status={t.priority} />} />
            <KeyValue label="Assigned to" value={t.assignedTo ?? "Awaiting agent"} />
            <KeyValue label="Opened" value={formatDateTime(t.createdAt)} />
            {t.relatedId && (
              <KeyValue
                label="Related"
                value={
                  <Link href={`/dashboard/bookings/${t.relatedId}`} className="text-secondary hover:underline">
                    {t.relatedId}
                  </Link>
                }
              />
            )}
          </dl>
        </Card>
      </div>
    </div>
  );
}
