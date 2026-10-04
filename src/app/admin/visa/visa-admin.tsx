"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FileSearch } from "lucide-react";
import { useStore } from "@/lib/store";
import { visaCountries } from "@/lib/data/visa";
import { visaAgents } from "@/lib/data/people";
import type { VisaApplication, VisaStatus } from "@/lib/types";
import { downloadCsv } from "@/lib/documents";
import { flag, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/primitives";
import { Select } from "@/components/ui/field";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { Toolbar } from "@/components/admin/toolbar";
import { StatsCard } from "@/components/shared/stats-card";
import { CheckCircle2, Clock, FileWarning, Inbox } from "lucide-react";

export const VISA_STATUSES: VisaStatus[] = ["Submitted", "Under Review", "Documents Required", "Processing", "Approved", "Rejected", "Completed"];

export function VisaAdmin() {
  const { state, actions } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const toast = useToast();
  const status = params.get("status") ?? "";
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [agent, setAgent] = useState("");
  const setStatus = (s: string) => router.replace(s ? `${pathname}?status=${encodeURIComponent(s)}` : pathname, { scroll: false });

  const rows = useMemo(
    () =>
      state.visaApplications.filter(
        (v) =>
          (!q || `${v.id} ${v.applicant.fullName} ${v.applicant.passport}`.toLowerCase().includes(q.toLowerCase())) &&
          (!status || v.status === status) &&
          (!country || v.countryId === country) &&
          (!agent || (agent === "unassigned" ? !v.assignedAgent : v.assignedAgent === agent)),
      ),
    [state.visaApplications, q, status, country, agent],
  );
  const all = state.visaApplications;

  const columns: Column<VisaApplication>[] = [
    { key: "id", header: "Application ID", cell: (v) => <span className="font-mono text-[13px] font-medium text-primary">{v.id}</span>, sort: (v) => v.id },
    { key: "applicant", header: "Applicant", cell: (v) => <span><span className="block font-medium">{v.applicant.fullName}</span><span className="block text-xs text-muted">{v.applicant.passport}</span></span>, sort: (v) => v.applicant.fullName },
    {
      key: "country",
      header: "Country",
      cell: (v) => {
        const c = visaCountries.find((x) => x.id === v.countryId)!;
        return (
          <span className="flex items-center gap-2">
            <span className="relative h-4 w-6 overflow-hidden rounded-sm ring-1 ring-black/5">
              <Image src={flag(c.code)} alt="" fill sizes="24px" className="object-cover" />
            </span>
            {c.name}
          </span>
        );
      },
    },
    { key: "type", header: "Visa type", cell: (v) => v.type },
    { key: "submitted", header: "Submitted", cell: (v) => formatDate(v.submittedAt), sort: (v) => v.submittedAt },
    { key: "status", header: "Status", cell: (v) => <StatusBadge status={v.status} /> },
    {
      key: "agent",
      header: "Assigned agent",
      cell: (v) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            aria-label={`Assign agent for ${v.id}`}
            value={v.assignedAgent ?? ""}
            onChange={(e) => {
              actions.assignVisaAgent(v.id, e.target.value);
              toast({ title: `Assigned to ${e.target.value}` });
            }}
            options={[{ value: "", label: "Unassigned" }, ...visaAgents]}
            className="h-9 w-40 text-[13px]"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Visa applications" description="Review documents, assign agents and update statuses." />
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard label="New submissions" value={all.filter((v) => v.status === "Submitted").length} icon={<Inbox />} href="/admin/visa?status=Submitted" />
        <StatsCard label="In review / processing" value={all.filter((v) => ["Under Review", "Processing"].includes(v.status)).length} icon={<Clock />} tone="info" />
        <StatsCard label="Awaiting documents" value={all.filter((v) => v.status === "Documents Required").length} icon={<FileWarning />} tone="accent" href="/admin/visa?status=Documents%20Required" />
        <StatsCard label="Approval rate" value={`${Math.round((all.filter((v) => ["Approved", "Completed"].includes(v.status)).length / Math.max(1, all.filter((v) => ["Approved", "Completed", "Rejected"].includes(v.status)).length)) * 100)}%`} icon={<CheckCircle2 />} tone="success" />
      </div>
      <Card>
        <Toolbar
          query={q}
          onQuery={setQ}
          placeholder="Search ID, applicant, passport…"
          activeFilters={[status, country, agent].filter(Boolean).length}
          onClear={() => (setStatus(""), setCountry(""), setAgent(""))}
          onExport={() => downloadCsv("visa-applications.csv", [["ID", "Applicant", "Country", "Type", "Submitted", "Status", "Agent"], ...rows.map((v) => [v.id, v.applicant.fullName, v.countryId, v.type, v.submittedAt, v.status, v.assignedAgent ?? ""])])}
          filters={
            <>
              <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "", label: "All statuses" }, ...VISA_STATUSES]} />
              <Select aria-label="Country" value={country} onChange={(e) => setCountry(e.target.value)} options={[{ value: "", label: "All countries" }, ...visaCountries.map((c) => ({ value: c.id, label: c.name }))]} />
              <Select aria-label="Agent" value={agent} onChange={(e) => setAgent(e.target.value)} options={[{ value: "", label: "All agents" }, { value: "unassigned", label: "Unassigned" }, ...visaAgents]} />
            </>
          }
        />
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(v) => v.id}
          onRowClick={(v) => router.push(`/admin/visa/${v.id}`)}
          initialSort={{ key: "submitted", dir: "desc" }}
          mobileCard={(v) => (
            <button onClick={() => router.push(`/admin/visa/${v.id}`)} className="w-full p-4 text-left">
              <div className="flex justify-between gap-2">
                <span className="font-mono text-xs text-primary">{v.id}</span>
                <StatusBadge status={v.status} />
              </div>
              <p className="mt-1.5 font-semibold">{v.applicant.fullName}</p>
              <p className="text-sm text-muted">
                {visaCountries.find((c) => c.id === v.countryId)?.name} · {v.type} · {v.assignedAgent ?? "Unassigned"}
              </p>
            </button>
          )}
          empty={<EmptyState icon={<FileSearch />} title="No applications" description="Nothing matches these filters." />}
        />
      </Card>
    </>
  );
}
