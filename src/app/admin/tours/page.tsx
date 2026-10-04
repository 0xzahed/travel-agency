"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Compass, Copy, Eye, EyeOff, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Tour } from "@/lib/types";
import { downloadCsv } from "@/lib/documents";
import { formatMoney, img } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, PageHeader, Rating } from "@/components/ui/primitives";
import { Dropdown } from "@/components/ui/disclosure";
import { Select } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/overlay";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { Toolbar } from "@/components/admin/toolbar";

export default function AdminTours() {
  const { state, actions } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [dest, setDest] = useState("");
  const [del, setDel] = useState<Tour | null>(null);

  const rows = useMemo(
    () =>
      state.tours.filter(
        (t) =>
          (!q || `${t.title} ${t.id} ${t.location}`.toLowerCase().includes(q.toLowerCase())) &&
          (!status || t.status === status) &&
          (!type || t.type === type) &&
          (!dest || t.destinationId === dest),
      ),
    [state.tours, q, status, type, dest],
  );
  const destName = (t: Tour) => state.destinations.find((d) => d.id === t.destinationId)?.name ?? t.country;

  const menu = (t: Tour) => (
    <Dropdown
      label={`Actions for ${t.title}`}
      trigger={
        <span className="grid size-8 place-items-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink">
          <MoreHorizontal className="size-4" />
        </span>
      }
      items={[
        { label: "View on site", icon: <Eye />, onClick: () => window.open(`/tours/${t.slug}`, "_blank") },
        { label: "Edit", icon: <Pencil />, onClick: () => router.push(`/admin/tours/${t.id}`) },
        { label: "Duplicate", icon: <Copy />, onClick: () => (actions.duplicateTour(t.id), toast({ title: "Tour duplicated", description: "Saved as a draft." })) },
        {
          label: t.status === "published" ? "Unpublish" : "Publish",
          icon: t.status === "published" ? <EyeOff /> : <Eye />,
          onClick: () => (actions.toggleTourStatus(t.id), toast({ title: t.status === "published" ? "Tour unpublished" : "Tour published", description: t.status === "published" ? "Hidden from the website." : "Now live on the website." })),
        },
        { divider: true, label: "" },
        { label: "Delete", icon: <Trash2 />, danger: true, onClick: () => setDel(t) },
      ]}
    />
  );

  const columns: Column<Tour>[] = [
    { key: "id", header: "Tour ID", cell: (t) => <span className="font-mono text-[13px] text-muted">{t.id}</span>, sort: (t) => t.id },
    {
      key: "name",
      header: "Tour",
      cell: (t) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
            <Image src={img(t.image, 160)} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <div className="max-w-[240px]">
            <p className="truncate font-medium">{t.title}</p>
            <Rating value={t.rating} className="text-xs" />
          </div>
        </div>
      ),
      sort: (t) => t.title,
    },
    { key: "dest", header: "Destination", cell: destName, sort: destName },
    { key: "duration", header: "Duration", cell: (t) => `${t.days}D / ${t.nights}N`, sort: (t) => t.days },
    { key: "price", header: "Price", cell: (t) => <span className="font-semibold">{formatMoney(t.price)}</span>, sort: (t) => t.price },
    { key: "bookings", header: "Bookings", cell: (t) => t.bookings, sort: (t) => t.bookings },
    { key: "status", header: "Status", cell: (t) => <StatusBadge status={t.status} /> },
    { key: "actions", header: <span className="sr-only">Actions</span>, cell: (t) => <div onClick={(e) => e.stopPropagation()}>{menu(t)}</div>, className: "text-right" },
  ];

  return (
    <>
      <PageHeader
        title="Tours"
        description={`${state.tours.length} tours · ${state.tours.filter((t) => t.status === "published").length} published`}
        actions={
          <ButtonLink href="/admin/tours/new">
            <Plus /> Add Tour
          </ButtonLink>
        }
      />
      <Card>
        <Toolbar
          query={q}
          onQuery={setQ}
          placeholder="Search tours…"
          activeFilters={[status, type, dest].filter(Boolean).length}
          onClear={() => (setStatus(""), setType(""), setDest(""))}
          onExport={() => downloadCsv("tours.csv", [["ID", "Title", "Destination", "Days", "Price", "Bookings", "Status"], ...rows.map((t) => [t.id, t.title, destName(t), t.days, t.price, t.bookings, t.status])])}
          filters={
            <>
              <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "", label: "All statuses" }, { value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} />
              <Select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)} options={[{ value: "", label: "All types" }, ...["Adventure", "Family", "Honeymoon", "Luxury", "Religious", "Cultural", "Beach", "City Tour"]]} />
              <Select aria-label="Destination" value={dest} onChange={(e) => setDest(e.target.value)} options={[{ value: "", label: "All destinations" }, ...state.destinations.map((d) => ({ value: d.id, label: d.name }))]} />
            </>
          }
        />
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(t) => t.id}
          onRowClick={(t) => router.push(`/admin/tours/${t.id}`)}
          caption="Tours"
          mobileCard={(t) => (
            <div className="flex gap-3 p-4" onClick={() => router.push(`/admin/tours/${t.id}`)}>
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                <Image src={img(t.image, 160)} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-semibold">{t.title}</p>
                  <div onClick={(e) => e.stopPropagation()}>{menu(t)}</div>
                </div>
                <p className="text-xs text-muted">
                  {t.id} · {destName(t)} · {t.days}D
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold">{formatMoney(t.price)}</span>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            </div>
          )}
          empty={<EmptyState icon={<Compass />} title="No tours match" description="Try different filters or add a new tour." action={<ButtonLink href="/admin/tours/new">Add Tour</ButtonLink>} />}
        />
      </Card>
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        tone="danger"
        title="Delete tour?"
        description={`“${del?.title}” will be removed from the catalogue. Existing bookings are kept.`}
        confirmLabel="Delete tour"
        onConfirm={() => (actions.deleteTour(del!.id), toast({ title: "Tour deleted", tone: "info" }))}
      />
    </>
  );
}
