"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronLeft, FileQuestion, FileText, Mail, Phone, RefreshCw, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { visaCountries } from "@/lib/data/visa";
import { visaAgents } from "@/lib/data/people";
import type { DocStatus, VisaStatus } from "@/lib/types";
import { cn, flag, formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, KeyValue } from "@/components/ui/primitives";
import { Select, Textarea } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { Timeline } from "@/components/ui/widgets";
import { useToast } from "@/components/ui/toast";
import { DocPreview } from "@/components/admin/doc-preview";
import { VISA_STATUSES } from "../visa-admin";

export default function VisaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, actions } = useStore();
  const toast = useToast();
  const app = state.visaApplications.find((v) => v.id === id);
  const [docId, setDocId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [nextStatus, setNextStatus] = useState<VisaStatus | "">("");

  if (!app) return <ErrorState icon={<FileQuestion />} title="Application not found" description="Check the application ID." actions={<ButtonLink href="/admin/visa">All applications</ButtonLink>} />;
  const country = visaCountries.find((c) => c.id === app.countryId)!;
  const doc = app.documents.find((d) => d.id === docId) ?? app.documents[0];
  const customer = state.customers.find((c) => c.id === app.customerId);

  const review = (status: DocStatus) => {
    if (status !== "Verified" && !note.trim()) {
      toast({ title: "Add a note for the applicant", description: "Explain what needs to change.", tone: "warning" });
      return;
    }
    actions.setVisaDocStatus(app.id, doc.id, status, note.trim() || undefined);
    setNote("");
    toast({ title: status === "Verified" ? `${doc.kind} approved` : status === "Rejected" ? `${doc.kind} rejected` : "New document requested", description: status === "Verified" ? undefined : "The applicant has been notified." });
    const next = app.documents.find((d) => d.id !== doc.id && d.status === "Pending");
    if (next) setDocId(next.id);
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/visa" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> Visa applications
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="relative h-10 w-14 overflow-hidden rounded ring-1 ring-black/5">
            <Image src={flag(country.code)} alt="" fill sizes="56px" className="object-cover" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-2xl font-bold">{app.id}</h1>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-sm text-muted">
              {country.name} · {app.type} visa · submitted {formatDateTime(app.submittedAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Select label="Assigned agent" value={app.assignedAgent ?? ""} onChange={(e) => (actions.assignVisaAgent(app.id, e.target.value), toast({ title: `Assigned to ${e.target.value}` }))} options={[{ value: "", label: "Unassigned" }, ...visaAgents]} wrapperClassName="w-44" />
          <Select label="Update status" value={nextStatus} onChange={(e) => setNextStatus(e.target.value as VisaStatus)} placeholder="Choose status" options={VISA_STATUSES.filter((s) => s !== app.status)} wrapperClassName="w-48" />
          <Button disabled={!nextStatus} onClick={() => (actions.setVisaStatus(app.id, nextStatus as VisaStatus, app.assignedAgent ?? "Admin"), toast({ title: `Status → ${nextStatus}`, description: "Applicant notified by email & dashboard." }), setNextStatus(""))}>
            Update
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader title="Document review" description={`${app.documents.filter((d) => d.status === "Verified").length} of ${app.documents.length} verified`} />
          <div className="grid md:grid-cols-[220px_1fr]">
            <ul className="flex gap-2 overflow-x-auto border-b border-line p-3 md:block md:space-y-1 md:border-b-0 md:border-r" role="tablist" aria-label="Documents">
              {app.documents.map((d) => (
                <li key={d.id} className="shrink-0">
                  <button
                    role="tab"
                    aria-selected={d.id === doc.id}
                    onClick={() => setDocId(d.id)}
                    className={cn("flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-sm", d.id === doc.id ? "bg-primary-50" : "hover:bg-slate-50")}
                  >
                    <FileText className="size-4 shrink-0 text-secondary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{d.kind}</span>
                      <span className="mt-0.5 block">
                        <StatusBadge status={d.status} />
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div>
              <div className="h-80 border-b border-line">
                <DocPreview doc={doc} name={app.applicant.fullName} passport={app.applicant.passport} nationality={app.applicant.nationality} />
              </div>
              <div className="space-y-4 p-5">
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <KeyValue label="Document" value={doc.kind} />
                  <KeyValue label="File" value={<span className="break-all">{doc.fileName}</span>} />
                  <KeyValue label="Uploaded" value={formatDate(doc.uploadedAt)} />
                  <KeyValue label="Status" value={<StatusBadge status={doc.status} />} />
                </dl>
                {doc.note && <p className="rounded-lg bg-warning-50 p-3 text-sm text-amber-800">Last note: {doc.note}</p>}
                <Textarea label="Admin note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Required when rejecting or requesting a new document — shown to the applicant" className="min-h-0" />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => review("Verified")} disabled={doc.status === "Verified"}>
                    <Check /> Approve
                  </Button>
                  <Button variant="danger-outline" onClick={() => review("Rejected")}>
                    <X /> Reject
                  </Button>
                  <Button variant="outline" onClick={() => review("Re-upload Requested")}>
                    <RefreshCw /> Request New Document
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Applicant" />
            <dl className="grid grid-cols-2 gap-4 p-5">
              <KeyValue label="Name" value={app.applicant.fullName} className="col-span-2" />
              <KeyValue label="Passport" value={<span className="font-mono">{app.applicant.passport}</span>} />
              <KeyValue label="Expiry" value={formatDate(app.applicant.passportExpiry)} />
              <KeyValue label="Nationality" value={app.applicant.nationality} />
              <KeyValue label="Date of birth" value={formatDate(app.applicant.dob)} />
              <KeyValue label="Occupation" value={app.applicant.occupation} className="col-span-2" />
            </dl>
            <div className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
              <p className="flex items-center gap-2"><Mail className="size-4 text-muted" /> {app.applicant.email}</p>
              <p className="flex items-center gap-2"><Phone className="size-4 text-muted" /> {app.applicant.phone}</p>
              {customer && <Link href={`/admin/customers/${customer.id}`} className="inline-block pt-1 font-medium text-secondary">View customer profile →</Link>}
            </div>
          </Card>
          <Card>
            <CardHeader title="Travel" />
            <dl className="grid grid-cols-2 gap-4 p-5">
              <KeyValue label="Entry" value={formatDate(app.travel.entryDate)} />
              <KeyValue label="Exit" value={formatDate(app.travel.exitDate)} />
              <KeyValue label="Purpose" value={app.travel.purpose} />
              <KeyValue label="Fee paid" value={formatMoney(app.fee)} />
              <KeyValue label="Accommodation" value={app.travel.accommodation} className="col-span-2" />
            </dl>
          </Card>
          <Card>
            <CardHeader title="Activity" />
            <div className="p-5">
              <Timeline items={[...app.timeline].reverse().map((e) => ({ id: e.id, title: e.label, meta: `${formatDateTime(e.at)}${e.by ? ` · ${e.by}` : ""}`, body: e.note, state: /reject|request/i.test(e.label) ? "failed" : "done" }))} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
