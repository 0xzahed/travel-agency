"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, FileSearch, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { trackingProgress, trackingSteps, visaCountries } from "@/lib/data/visa";
import type { VisaApplication } from "@/lib/types";
import { flag, formatDate, formatDateTime } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/badge";
import { Timeline } from "@/components/ui/widgets";
import { EmptyState } from "@/components/ui/states";

export function VisaTracker() {
  const { state, hydrated } = useStore();
  const params = useSearchParams();
  const [id, setId] = useState(params.get("id") ?? "");
  const [passport, setPassport] = useState(params.get("passport") ?? "");
  const [loading, setLoading] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const lookup = (appId: string, pp: string) => {
    setLoading(true);
    setNotFound(false);
    setTimeout(() => {
      const found = state.visaApplications.find((v) => v.id.toLowerCase() === appId.trim().toLowerCase() && (!pp || v.applicant.passport.toLowerCase() === pp.trim().toLowerCase()));
      setResultId(found?.id ?? null);
      setNotFound(!found);
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    if (!hydrated || !params.get("id")) return;
    const t = setTimeout(() => lookup(params.get("id")!, params.get("passport") ?? ""), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const app = state.visaApplications.find((v) => v.id === resultId);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^VISA-\d{4}-\d{5}$/i.test(id.trim())) return setError("Application IDs look like VISA-2026-00452.");
          if (passport.trim().length < 6) return setError("Enter the passport number used on the application.");
          setError("");
          lookup(id, passport);
        }}
        className="mt-10 rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-soft)] md:p-6"
      >
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <Input label="Application ID" placeholder="VISA-2026-00452" value={id} onChange={(e) => setId(e.target.value.toUpperCase())} />
          <Input label="Passport number" placeholder="GB5520918" value={passport} onChange={(e) => setPassport(e.target.value.toUpperCase())} />
          <Button type="submit" size="lg" loading={loading} className="h-11">
            <Search /> Track Application
          </Button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <p className="mt-3 text-xs text-muted">
          Demo: try{" "}
          <button type="button" className="font-medium text-secondary underline" onClick={() => (setId("VISA-2026-00452"), setPassport("GB5520918"), lookup("VISA-2026-00452", "GB5520918"))}>
            VISA-2026-00452 / GB5520918
          </button>
        </p>
      </form>

      <div aria-live="polite">
        <AnimatePresence mode="wait">
          {app && !loading && (
            <motion.div key={app.id + app.status} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8">
              <Result app={app} />
            </motion.div>
          )}
          {notFound && !loading && (
            <motion.div key="nf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 rounded-2xl border border-line bg-white">
              <EmptyState icon={<FileSearch />} title="No application found" description="Double-check the application ID and passport number. IDs are in your confirmation email." action={<ButtonLink href="/contact?topic=visa" variant="outline">Contact visa desk</ButtonLink>} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function Result({ app }: { app: VisaApplication }) {
  const country = visaCountries.find((c) => c.id === app.countryId)!;
  const done = trackingProgress(app.status);
  const rejected = app.status === "Rejected";
  const items = trackingSteps.map((s, i) => {
    const event = app.timeline.find((e) => e.label.toLowerCase().includes(s.key.toLowerCase().split(" ")[0]));
    let st: "done" | "current" | "upcoming" | "failed" = i < done ? "done" : i === done ? "current" : "upcoming";
    if (rejected && i === 4) st = "failed";
    if (rejected && i === 5) st = "upcoming";
    return {
      id: s.key,
      title: rejected && i === 4 ? "Decision — Refused" : s.label,
      meta: st === "done" || st === "failed" ? (event ? formatDateTime(event.at) : "Completed") : st === "current" ? "In progress" : "Pending",
      body: st === "current" ? s.desc : undefined,
      state: st,
    };
  });
  const needsAction = app.documents.filter((d) => d.status === "Re-upload Requested" || d.status === "Rejected");

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5 md:p-6">
        <div className="flex items-center gap-3">
          <span className="relative h-9 w-12 overflow-hidden rounded ring-1 ring-black/5">
            <Image src={flag(country.code)} alt="" fill sizes="48px" className="object-cover" />
          </span>
          <div>
            <p className="font-semibold">
              {country.name} · {app.type} visa
            </p>
            <p className="text-sm text-muted">
              {app.id} · {app.applicant.fullName}
            </p>
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {needsAction.length > 0 && (
        <div className="flex gap-3 border-b border-amber-200 bg-warning-50 p-5 text-sm">
          <AlertTriangle className="size-5 shrink-0 text-warning" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900">Action required</p>
            {needsAction.map((d) => (
              <p key={d.id} className="mt-0.5 text-amber-800">
                {d.kind}: {d.note ?? "Please upload a new copy."}
              </p>
            ))}
          </div>
          <ButtonLink href="/dashboard/visa" size="sm" variant="accent">
            Re-upload
          </ButtonLink>
        </div>
      )}

      <div className="grid gap-8 p-5 md:grid-cols-[1fr_240px] md:p-6">
        <Timeline items={items} />
        <div className="space-y-4 text-sm">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-muted">Submitted</p>
            <p className="mt-0.5 font-medium">{formatDate(app.submittedAt, "long")}</p>
            <p className="mt-3 text-xs text-muted">Assigned agent</p>
            <p className="mt-0.5 font-medium">{app.assignedAgent ?? "Awaiting assignment"}</p>
            <p className="mt-3 text-xs text-muted">Typical processing</p>
            <p className="mt-0.5 font-medium">{country.processing}</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Documents</p>
            <ul className="space-y-2">
              {app.documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{d.kind}</span>
                  <StatusBadge status={d.status} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
