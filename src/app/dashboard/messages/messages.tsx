"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquarePlus, MessagesSquare } from "lucide-react";
import { useCurrentUser, useStore } from "@/lib/store";
import type { Priority, SupportTicket } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/overlay";
import { Input, Select, Textarea } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { FileUploader, type UploadedFile } from "@/components/ui/widgets";
import { useToast } from "@/components/ui/toast";

export function Messages() {
  const { state } = useStore();
  const user = useCurrentUser()!;
  const router = useRouter();
  const params = useSearchParams();
  const [creating, setCreating] = useState(params.get("new") === "1");
  const mine = state.tickets.filter((t) => t.customerId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <PageHeader
        title="Messages"
        description="Support tickets and conversations with our travel team."
        actions={
          <Button onClick={() => setCreating(true)}>
            <MessageSquarePlus /> Create Ticket
          </Button>
        }
      />
      <Card>
        {mine.length === 0 ? (
          <EmptyState icon={<MessagesSquare />} title="No messages yet" description="Questions about a booking or visa? Our team typically replies within 2 hours." action={<Button onClick={() => setCreating(true)}>Create a ticket</Button>} />
        ) : (
          <ul className="divide-y divide-line">
            {mine.map((t) => {
              const last = t.messages.at(-1)!;
              const unread = last.from === "agent" && !["Resolved", "Closed"].includes(t.status);
              return (
                <li key={t.id}>
                  <button onClick={() => router.push(`/dashboard/messages/${t.id}`)} className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-slate-50">
                    <span className={cn("mt-2 size-2 shrink-0 rounded-full", unread ? "bg-accent" : "bg-transparent")} aria-label={unread ? "New reply" : undefined} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={cn("truncate text-sm", unread ? "font-semibold" : "font-medium")}>{t.subject}</p>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-muted">
                        <span className="font-medium text-ink/70">{last.author}:</span> {last.text}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {t.id} · {t.category} · {t.priority} priority
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{timeAgo(t.updatedAt)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <NewTicketModal open={creating} onClose={() => setCreating(false)} relatedId={params.get("booking") ?? undefined} />
    </>
  );
}

function NewTicketModal({ open, onClose, relatedId }: { open: boolean; onClose: () => void; relatedId?: string }) {
  const { actions } = useStore();
  const user = useCurrentUser()!;
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState({ subject: relatedId ? `Question about booking ${relatedId}` : "", category: relatedId ? "Booking" : "General", priority: "Medium" as Priority, message: "" });
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (f.subject.trim().length < 4) e.subject = "Add a short subject";
    if (f.message.trim().length < 10) e.message = "Describe your request (10+ characters)";
    setErrors(e);
    if (Object.keys(e).length) return;
    const id = actions.createTicket({ customerId: user.id, subject: f.subject, category: f.category as SupportTicket["category"], priority: f.priority, message: f.message, relatedId, attachment: file?.status === "done" ? file.name : undefined, author: user.name });
    toast({ title: "Ticket created", description: `${id} — we'll reply shortly.` });
    onClose();
    router.push(`/dashboard/messages/${id}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create support ticket"
      description="Average first response: 1h 45m"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Submit ticket</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input wrapperClassName="sm:col-span-2" label="Subject" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} error={errors.subject} required />
        <Select label="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} options={["Booking", "Visa", "Payment", "Account", "General"]} />
        <Select label="Priority" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value as Priority })} options={["Low", "Medium", "High", "Urgent"]} />
        <Textarea wrapperClassName="sm:col-span-2" label="Message" rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} error={errors.message} required />
        <div className="sm:col-span-2">
          <FileUploader compact label="Attachment" hint="Optional · screenshot or document" file={file} onChange={setFile} />
        </div>
      </div>
    </Modal>
  );
}
