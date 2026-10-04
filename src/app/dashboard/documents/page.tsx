"use client";

import { useState } from "react";
import { Download, FileText, FolderOpen, Trash2, Upload } from "lucide-react";
import { useCurrentUser, useStore } from "@/lib/store";
import type { CustomerDocument } from "@/lib/types";
import { downloadPlaceholder } from "@/lib/documents";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { ConfirmDialog, Modal } from "@/components/ui/overlay";
import { Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { FileUploader, type UploadedFile } from "@/components/ui/widgets";
import { useToast } from "@/components/ui/toast";

const CATS = ["All", "Passport", "Visa", "Tickets", "Invoices", "Travel Insurance"] as const;

export default function DocumentsPage() {
  const { state, actions } = useStore();
  const user = useCurrentUser()!;
  const toast = useToast();
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [upload, setUpload] = useState(false);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [newCat, setNewCat] = useState<CustomerDocument["category"]>("Passport");
  const [del, setDel] = useState<CustomerDocument | null>(null);
  const mine = state.documents.filter((d) => d.customerId === user.id);
  const list = mine.filter((d) => cat === "All" || d.category === cat);

  return (
    <>
      <PageHeader
        title="Documents"
        description="Passports, visas, tickets and invoices — securely in one place."
        actions={
          <Button onClick={() => (setFile(null), setUpload(true))}>
            <Upload /> Upload document
          </Button>
        }
      />
      <Card>
        <div className="px-5 pt-3">
          <Tabs value={cat} onChange={setCat} tabs={CATS.map((c) => ({ value: c, label: c, count: c === "All" ? mine.length : mine.filter((d) => d.category === c).length }))} />
        </div>
        {list.length === 0 ? (
          <EmptyState icon={<FolderOpen />} title="No documents here" description="Upload a scan or it will appear automatically after your next booking." action={<Button onClick={() => setUpload(true)}>Upload document</Button>} />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.fileName}</p>
                  <p className="text-xs text-muted">
                    {d.category} · {d.size} · Uploaded {formatDate(d.uploadedAt)}
                  </p>
                </div>
                <StatusBadge status={d.status} />
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label={`Download ${d.fileName}`} onClick={() => downloadPlaceholder(d.fileName)}>
                    <Download />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`Delete ${d.fileName}`} onClick={() => setDel(d)}>
                    <Trash2 className="text-danger" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={upload}
        onClose={() => setUpload(false)}
        title="Upload document"
        footer={
          <>
            <Button variant="outline" onClick={() => setUpload(false)}>
              Cancel
            </Button>
            <Button
              disabled={file?.status !== "done"}
              onClick={() => {
                actions.addDocument({ customerId: user.id, category: newCat, fileName: file!.name, size: file!.size, uploadedAt: new Date().toISOString().slice(0, 10), status: "Pending" });
                toast({ title: "Document uploaded", description: "We'll verify it shortly." });
                setUpload(false);
              }}
            >
              Save document
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Category" value={newCat} onChange={(e) => setNewCat(e.target.value as CustomerDocument["category"])} options={CATS.filter((c) => c !== "All") as unknown as string[]} />
          <FileUploader label="Document" file={file} onChange={setFile} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        tone="danger"
        title="Delete document?"
        description={`“${del?.fileName}” will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={() => {
          actions.deleteDocument(del!.id);
          toast({ title: "Document deleted", tone: "info" });
        }}
      />
    </>
  );
}
