"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileCheck2, FileText } from "lucide-react";
import { useStore } from "@/lib/store";
import { visaCountries } from "@/lib/data/visa";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { EmptyState } from "@/components/ui/states";

type F = "Pending" | "Re-upload Requested" | "Verified" | "Rejected";

export default function DocumentsQueue() {
  const { state } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState<F>("Pending");
  const all = state.visaApplications.flatMap((a) => a.documents.map((d) => ({ app: a, doc: d })));
  const list = all.filter((x) => x.doc.status === tab).sort((a, b) => b.doc.uploadedAt.localeCompare(a.doc.uploadedAt));

  return (
    <>
      <PageHeader title="Document queue" description="Every uploaded visa document awaiting or past verification." />
      <Card>
        <div className="px-5 pt-3">
          <Tabs value={tab} onChange={setTab} tabs={(["Pending", "Re-upload Requested", "Verified", "Rejected"] as F[]).map((s) => ({ value: s, label: s, count: all.filter((x) => x.doc.status === s).length }))} />
        </div>
        {list.length === 0 ? (
          <EmptyState icon={<FileCheck2 />} title="Queue is clear" description="No documents in this state." />
        ) : (
          <ul className="divide-y divide-line">
            {list.map(({ app, doc }) => (
              <li key={doc.id}>
                <button onClick={() => router.push(`/admin/visa/${app.id}`)} className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-left hover:bg-slate-50">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {doc.kind} — {app.applicant.fullName}
                    </p>
                    <p className="text-xs text-muted">
                      {doc.fileName} · {doc.size} · {visaCountries.find((c) => c.id === app.countryId)?.name} · {app.id}
                    </p>
                  </div>
                  <span className="text-xs text-muted">{formatDate(doc.uploadedAt)}</span>
                  <StatusBadge status={doc.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
