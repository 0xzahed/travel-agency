"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, CalendarDays, Download, FileCheck2, MapPinned, Plus, UserRound } from "lucide-react";
import { useCurrentUser, useStore } from "@/lib/store";
import { trackingProgress, visaCountries } from "@/lib/data/visa";
import type { VisaApplication, VisaDocument } from "@/lib/types";
import { downloadVisaReceipt } from "@/lib/documents";
import { cn, flag, formatDate } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/states";
import { Modal } from "@/components/ui/overlay";
import { FileUploader, type UploadedFile } from "@/components/ui/widgets";
import { useToast } from "@/components/ui/toast";

export default function VisaDashboard() {
  const { state } = useStore();
  const user = useCurrentUser()!;
  const apps = state.visaApplications.filter((v) => v.customerId === user.id);

  return (
    <>
      <PageHeader
        title="Visa Applications"
        description="Track progress and respond to requests from your visa agent."
        actions={
          <ButtonLink href="/visa/apply">
            <Plus /> New application
          </ButtonLink>
        }
      />
      {apps.length === 0 ? (
        <Card>
          <EmptyState icon={<FileCheck2 />} title="No visa applications" description="Apply online in minutes — a dedicated agent will check every document." action={<ButtonLink href="/visa/apply">Start an application</ButtonLink>} />
        </Card>
      ) : (
        <div className="space-y-5">
          {apps.map((a) => (
            <VisaAppCard key={a.id} app={a} />
          ))}
        </div>
      )}
    </>
  );
}

function VisaAppCard({ app }: { app: VisaApplication }) {
  const { actions } = useStore();
  const toast = useToast();
  const c = visaCountries.find((x) => x.id === app.countryId)!;
  const step = trackingProgress(app.status);
  const steps = ["Submitted", "Verified", "Processing", "Embassy", "Decision", "Completed"];
  const flagged = app.documents.filter((d) => d.status === "Re-upload Requested" || d.status === "Rejected");
  const [reupload, setReupload] = useState<VisaDocument | null>(null);
  const [file, setFile] = useState<UploadedFile | null>(null);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5">
        <div className="flex items-center gap-3">
          <span className="relative h-9 w-12 overflow-hidden rounded ring-1 ring-black/5">
            <Image src={flag(c.code)} alt="" fill sizes="48px" className="object-cover" />
          </span>
          <div>
            <p className="font-semibold">
              {c.name} · {app.type} visa
            </p>
            <p className="font-mono text-xs text-muted">{app.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={app.status} />
          <Button size="sm" variant="ghost" onClick={() => downloadVisaReceipt(app, c.name)} aria-label="Download receipt">
            <Download />
          </Button>
          <ButtonLink href={`/visa/track?id=${app.id}&passport=${app.applicant.passport}`} size="sm" variant="outline">
            Track
          </ButtonLink>
        </div>
      </div>

      {flagged.length > 0 && (
        <div className="flex flex-col gap-3 border-b border-amber-200 bg-warning-50 p-5 sm:flex-row sm:items-center">
          <AlertTriangle className="size-5 shrink-0 text-warning" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-900">Your agent needs a new document</p>
            {flagged.map((d) => (
              <p key={d.id} className="text-amber-800">
                <span className="font-medium">{d.kind}:</span> {d.note ?? "Please upload a clearer copy."}
              </p>
            ))}
          </div>
          <Button variant="accent" size="sm" onClick={() => (setFile(null), setReupload(flagged[0]))}>
            Upload now
          </Button>
        </div>
      )}

      <div className="p-5">
        <ol className="grid grid-cols-6 gap-1.5" aria-label="Application progress">
          {steps.map((s, i) => (
            <li key={s}>
              <span className={cn("block h-1.5 rounded-full", app.status === "Rejected" && i === 4 ? "bg-danger" : i < step ? "bg-primary" : i === step ? "bg-accent" : "bg-slate-200")} />
              <span className={cn("mt-2 hidden text-[11px] font-medium sm:block", i <= step ? "text-ink" : "text-muted")}>{s}</span>
            </li>
          ))}
        </ol>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted"><UserRound className="size-3.5" /> Applicant</dt>
            <dd className="mt-0.5 font-medium">{app.applicant.fullName}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted"><CalendarDays className="size-3.5" /> Submitted</dt>
            <dd className="mt-0.5 font-medium">{formatDate(app.submittedAt)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted"><MapPinned className="size-3.5" /> Travel</dt>
            <dd className="mt-0.5 font-medium">{formatDate(app.travel.entryDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Agent</dt>
            <dd className="mt-0.5 font-medium">{app.assignedAgent ?? "Assigning…"}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          {app.documents.map((d) => (
            <span key={d.id} className="inline-flex items-center gap-2 rounded-lg border border-line bg-slate-50 py-1 pl-2.5 pr-1.5 text-xs">
              {d.kind}
              <StatusBadge status={d.status} />
            </span>
          ))}
        </div>
      </div>

      <Modal
        open={!!reupload}
        onClose={() => setReupload(null)}
        title={`Re-upload ${reupload?.kind}`}
        description={reupload?.note}
        footer={
          <>
            <Button variant="outline" onClick={() => setReupload(null)}>
              Cancel
            </Button>
            <Button
              disabled={file?.status !== "done"}
              onClick={() => {
                actions.reuploadVisaDoc(app.id, reupload!.id, file!.name, file!.size);
                toast({ title: "Document uploaded", description: "Your agent has been notified." });
                setReupload(null);
              }}
            >
              Submit document
            </Button>
          </>
        }
      >
        <FileUploader label={reupload?.kind ?? "Document"} file={file} onChange={setFile} required />
        <button className="mt-3 text-xs font-medium text-secondary" onClick={() => setFile({ name: "bank_statement_stamped.pdf", size: "3.1 MB", status: "done", progress: 100 })}>
          Use a sample file (demo)
        </button>
      </Modal>
    </Card>
  );
}
