"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Briefcase, Check, ChevronLeft, Download, GraduationCap, Info, LogIn, Palmtree, PlaneTakeoff, Send } from "lucide-react";
import { visaCountries } from "@/lib/data/visa";
import { useCurrentUser, useStore } from "@/lib/store";
import type { VisaApplication, VisaDocument, VisaType } from "@/lib/types";
import { downloadVisaReceipt } from "@/lib/documents";
import { cn, flag, formatDate, formatMoney } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { FileUploader, StepIndicator, sampleUpload, type UploadedFile } from "@/components/ui/widgets";

const STEPS = ["Country", "Visa type", "Applicant", "Travel", "Documents", "Review", "Submit"];
const TYPE_META: Record<VisaType, { icon: React.ReactNode; desc: string }> = {
  Tourist: { icon: <Palmtree />, desc: "Holidays, sightseeing and visiting friends." },
  Business: { icon: <Briefcase />, desc: "Meetings, conferences and trade events." },
  Student: { icon: <GraduationCap />, desc: "Full-time study or exchange programmes." },
  Transit: { icon: <PlaneTakeoff />, desc: "Passing through en route to another country." },
};
const DOCS: { kind: VisaDocument["kind"]; required: boolean; hint: string }[] = [
  { kind: "Passport", required: true, hint: "Bio page, colour scan, PDF/JPG" },
  { kind: "Photograph", required: true, hint: "35×45mm, white background, JPG" },
  { kind: "Bank Statement", required: true, hint: "Last 6 months, bank-stamped PDF" },
  { kind: "NID", required: false, hint: "National ID card, both sides" },
  { kind: "Invitation Letter", required: false, hint: "Required for business visas" },
  { kind: "Other", required: false, hint: "Any supporting documents" },
];

export function VisaApply() {
  const params = useSearchParams();
  const user = useCurrentUser();
  const { actions } = useStore();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [countryId, setCountryId] = useState(params.get("country") ?? "");
  const [type, setType] = useState<VisaType | "">((params.get("type") as VisaType) ?? "");
  const [applicant, setApplicant] = useState({
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    passport: user?.passport ?? "",
    passportExpiry: user?.passportExpiry ?? "",
    nationality: user?.nationality ?? "",
    dob: user?.dob ?? "",
    occupation: "",
  });
  const [travel, setTravel] = useState({ entryDate: "", exitDate: "", purpose: "Tourism", accommodation: "" });
  const [files, setFiles] = useState<Partial<Record<VisaDocument["kind"], UploadedFile | null>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<VisaApplication | null>(null);

  const country = visaCountries.find((c) => c.id === countryId);
  const needInvitation = type === "Business";

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0 && !country) e.country = "Choose a destination country.";
    if (step === 1 && !type) e.type = "Choose a visa type.";
    if (step === 2) {
      if (applicant.fullName.trim().length < 3) e.fullName = "Enter your full name as in passport";
      if (!/^\S+@\S+\.\S+$/.test(applicant.email)) e.email = "Enter a valid email";
      if (applicant.phone.replace(/\D/g, "").length < 7) e.phone = "Enter a valid phone";
      if (!/^[A-Z0-9]{6,9}$/i.test(applicant.passport)) e.passport = "6–9 letters or digits";
      if (!applicant.passportExpiry) e.passportExpiry = "Required";
      else if (new Date(applicant.passportExpiry) < new Date(Date.now() + 180 * 86400000)) e.passportExpiry = "Passport must be valid for 6+ months";
      if (!applicant.nationality) e.nationality = "Required";
      if (!applicant.dob) e.dob = "Required";
      if (!applicant.occupation) e.occupation = "Required";
    }
    if (step === 3) {
      if (!travel.entryDate) e.entryDate = "Required";
      if (!travel.exitDate) e.exitDate = "Required";
      if (travel.entryDate && travel.exitDate && travel.exitDate <= travel.entryDate) e.exitDate = "Must be after entry date";
      if (!travel.accommodation.trim()) e.accommodation = "Hotel name or host address";
    }
    if (step === 4) {
      DOCS.forEach((d) => {
        const req = d.required || (d.kind === "Invitation Letter" && needInvitation);
        if (req && files[d.kind]?.status !== "done") e[d.kind] = "Required";
      });
      if (Object.values(files).some((f) => f?.status === "uploading")) e.uploading = "Please wait for uploads to finish.";
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const go = (d: 1 | -1) => {
    if (d === 1 && !validate()) return;
    setErrors({});
    setDir(d);
    setStep((s) => s + d);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = () => {
    if (!user || !country || !type) return;
    setSubmitting(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      const documents: VisaDocument[] = (Object.entries(files) as [VisaDocument["kind"], UploadedFile | null][])
        .filter(([, f]) => f?.status === "done")
        .map(([kind, f], i) => ({ id: `d${i}-${Date.now()}`, kind, fileName: f!.name, size: f!.size, uploadedAt: now, status: "Pending" }));
      const app = actions.submitVisa({ customerId: user.id, countryId: country.id, type, applicant, travel, documents, fee: country.fromPrice });
      setSubmitted(app);
      setSubmitting(false);
      setDir(1);
      setStep(6);
    }, 1200);
  };

  const today = new Date().toISOString().slice(0, 10);
  const fillSamples = () =>
    setFiles({
      Passport: sampleUpload(`passport_${applicant.fullName.split(" ").pop()?.toLowerCase() || "scan"}.pdf`, "1.2 MB"),
      Photograph: sampleUpload("photo_35x45.jpg", "340 KB"),
      "Bank Statement": sampleUpload("bank_statement_6m.pdf", "2.8 MB"),
      ...(needInvitation ? { "Invitation Letter": sampleUpload("invitation_letter.pdf", "220 KB") } : {}),
    });

  return (
    <div className="bg-canvas pb-24 pt-16 md:pt-[76px]">
      <div className="border-b border-line bg-white">
        <div className="container-x py-6">
          <Link href="/visa" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ChevronLeft className="size-4" /> Visa services
          </Link>
          <StepIndicator steps={STEPS} current={step} />
        </div>
      </div>

      <div className="container-x mt-8 grid max-w-6xl gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {!user && step < 6 && (
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-accent/40 bg-accent-50 p-5 sm:flex-row sm:items-center">
              <LogIn className="size-5 shrink-0 text-accent-600" />
              <p className="flex-1 text-sm">
                <span className="font-semibold">Log in to submit</span> — your application and tracking will be saved to your dashboard.
              </p>
              <Button size="sm" onClick={() => actions.login()}>
                Continue as Alex (demo)
              </Button>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: dir * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -24 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="p-5 md:p-8"
              >
                {step === 0 && (
                  <Shell title="Where are you travelling?" desc="Choose the country you need a visa for.">
                    <div role="radiogroup" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {visaCountries.map((c) => (
                        <button
                          key={c.id}
                          role="radio"
                          aria-checked={countryId === c.id}
                          onClick={() => {
                            setCountryId(c.id);
                            if (type && !c.types.includes(type)) setType("");
                          }}
                          className={cn("flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors", countryId === c.id ? "border-primary bg-primary-50/60 ring-1 ring-primary" : "border-line hover:border-slate-300")}
                        >
                          <span className="relative h-7 w-10 shrink-0 overflow-hidden rounded ring-1 ring-black/5">
                            <Image src={flag(c.code)} alt="" fill sizes="40px" className="object-cover" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">{c.name}</span>
                            <span className="text-xs text-muted">from {formatMoney(c.fromPrice)}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.country && <Err>{errors.country}</Err>}
                  </Shell>
                )}

                {step === 1 && country && (
                  <Shell title="Select visa type" desc={`Available for ${country.name}`}>
                    <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                      {(Object.keys(TYPE_META) as VisaType[]).map((t) => {
                        const available = country.types.includes(t);
                        return (
                          <button
                            key={t}
                            role="radio"
                            aria-checked={type === t}
                            disabled={!available}
                            onClick={() => setType(t)}
                            className={cn(
                              "flex items-start gap-4 rounded-xl border p-5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                              type === t ? "border-primary bg-primary-50/60 ring-1 ring-primary" : "border-line hover:border-slate-300",
                            )}
                          >
                            <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl [&_svg]:size-5", type === t ? "bg-primary text-white" : "bg-slate-100 text-primary")}>{TYPE_META[t].icon}</span>
                            <span>
                              <span className="block font-semibold">{t} visa</span>
                              <span className="mt-0.5 block text-sm text-muted">{available ? TYPE_META[t].desc : "Not offered for this country"}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.type && <Err>{errors.type}</Err>}
                  </Shell>
                )}

                {step === 2 && (
                  <Shell title="Applicant information" desc="Enter details exactly as they appear in your passport.">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input wrapperClassName="sm:col-span-2" label="Full name" value={applicant.fullName} onChange={(e) => setApplicant({ ...applicant, fullName: e.target.value })} error={errors.fullName} required />
                      <Input label="Email" type="email" value={applicant.email} onChange={(e) => setApplicant({ ...applicant, email: e.target.value })} error={errors.email} required />
                      <Input label="Phone" type="tel" value={applicant.phone} onChange={(e) => setApplicant({ ...applicant, phone: e.target.value })} error={errors.phone} required />
                      <Input label="Passport number" value={applicant.passport} onChange={(e) => setApplicant({ ...applicant, passport: e.target.value.toUpperCase() })} error={errors.passport} required />
                      <Input label="Passport expiry" type="date" value={applicant.passportExpiry} onChange={(e) => setApplicant({ ...applicant, passportExpiry: e.target.value })} error={errors.passportExpiry} required />
                      <Select label="Nationality" value={applicant.nationality} onChange={(e) => setApplicant({ ...applicant, nationality: e.target.value })} placeholder="Select" options={["British", "American", "Bangladeshi", "Indian", "Jordanian", "Egyptian", "German", "French", "Portuguese", "South Korean", "Other"]} error={errors.nationality} required />
                      <Input label="Date of birth" type="date" max={today} value={applicant.dob} onChange={(e) => setApplicant({ ...applicant, dob: e.target.value })} error={errors.dob} required />
                      <Input wrapperClassName="sm:col-span-2" label="Occupation" value={applicant.occupation} onChange={(e) => setApplicant({ ...applicant, occupation: e.target.value })} error={errors.occupation} placeholder="e.g. Software Engineer" required />
                    </div>
                  </Shell>
                )}

                {step === 3 && (
                  <Shell title="Travel information" desc="Your intended dates and where you'll stay.">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Entry date" type="date" min={today} value={travel.entryDate} onChange={(e) => setTravel({ ...travel, entryDate: e.target.value })} error={errors.entryDate} required />
                      <Input label="Exit date" type="date" min={travel.entryDate || today} value={travel.exitDate} onChange={(e) => setTravel({ ...travel, exitDate: e.target.value })} error={errors.exitDate} required />
                      <Select wrapperClassName="sm:col-span-2" label="Purpose of visit" value={travel.purpose} onChange={(e) => setTravel({ ...travel, purpose: e.target.value })} options={["Tourism", "Visiting family/friends", "Business meeting", "Conference", "Study", "Transit"]} />
                      <Input wrapperClassName="sm:col-span-2" label="Accommodation" value={travel.accommodation} onChange={(e) => setTravel({ ...travel, accommodation: e.target.value })} error={errors.accommodation} placeholder="Hotel name and address, or host details" required />
                    </div>
                  </Shell>
                )}

                {step === 4 && (
                  <Shell
                    title="Upload documents"
                    desc="Clear colour scans speed up approval. Files are encrypted at rest."
                    action={
                      <Button size="sm" variant="subtle" onClick={fillSamples}>
                        Use sample files
                      </Button>
                    }
                  >
                    <div className="space-y-3">
                      {DOCS.map((d) => {
                        const req = d.required || (d.kind === "Invitation Letter" && needInvitation);
                        return (
                          <div key={d.kind}>
                            <FileUploader compact label={d.kind} hint={d.hint} required={req} file={files[d.kind]} onChange={(f) => setFiles((all) => ({ ...all, [d.kind]: f }))} />
                            {errors[d.kind] && <Err>{d.kind} is required</Err>}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                      <span className="text-muted">Upload status</span>
                      <span className="font-semibold">
                        {Object.values(files).filter((f) => f?.status === "done").length} of {DOCS.filter((d) => d.required || (d.kind === "Invitation Letter" && needInvitation)).length} required uploaded
                      </span>
                    </div>
                    {errors.uploading && <Err>{errors.uploading}</Err>}
                  </Shell>
                )}

                {step === 5 && country && (
                  <Shell title="Review application" desc="Check everything carefully — changes after submission may delay processing.">
                    <div className="space-y-4">
                      <ReviewBlock title="Visa" onEdit={() => setStep(0)} rows={[["Country", country.name], ["Type", `${type} visa`], ["Processing", country.processing], ["Service fee", formatMoney(country.fromPrice)]]} />
                      <ReviewBlock title="Applicant" onEdit={() => setStep(2)} rows={[["Name", applicant.fullName], ["Passport", `${applicant.passport} · exp. ${formatDate(applicant.passportExpiry)}`], ["Nationality", applicant.nationality], ["Contact", `${applicant.email} · ${applicant.phone}`]]} />
                      <ReviewBlock title="Travel" onEdit={() => setStep(3)} rows={[["Dates", `${formatDate(travel.entryDate)} → ${formatDate(travel.exitDate)}`], ["Purpose", travel.purpose], ["Stay", travel.accommodation]]} />
                      <ReviewBlock
                        title="Documents"
                        onEdit={() => setStep(4)}
                        rows={(Object.entries(files) as [string, UploadedFile | null][]).filter(([, f]) => f?.status === "done").map(([k, f]) => [k, f!.name])}
                      />
                    </div>
                    <p className="mt-5 flex gap-2 rounded-xl bg-primary-50 p-4 text-sm text-primary">
                      <Info className="mt-0.5 size-4 shrink-0" /> By submitting you confirm all information is accurate and authorise Voyara to lodge this application on your behalf.
                    </p>
                  </Shell>
                )}

                {step === 6 && submitted && country && (
                  <div className="py-6 text-center">
                    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="mx-auto grid size-16 place-items-center rounded-full bg-success text-white ring-8 ring-success-50">
                      <Check className="size-8" strokeWidth={3} />
                    </motion.div>
                    <h1 className="mt-6 text-2xl font-bold md:text-3xl">Visa Application Submitted</h1>
                    <p className="mt-2 text-muted">A visa agent will review your documents within 24 hours.</p>
                    <p className="mt-5 inline-flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-white px-4 py-2 text-sm">
                      Application ID <span className="font-mono font-semibold text-primary">{submitted.id}</span>
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                      <ButtonLink href={`/visa/track?id=${submitted.id}&passport=${submitted.applicant.passport}`}>Track Application</ButtonLink>
                      <Button variant="outline" onClick={() => downloadVisaReceipt(submitted, country.name)}>
                        <Download /> Download Receipt
                      </Button>
                      <ButtonLink href="/dashboard/visa" variant="outline">
                        Go to Dashboard
                      </ButtonLink>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {step < 6 && (
              <div className="flex items-center justify-between border-t border-line bg-slate-50/60 px-5 py-4 md:px-8">
                <Button variant="ghost" onClick={() => go(-1)} disabled={step === 0 || submitting}>
                  <ArrowLeft /> Back
                </Button>
                {step < 5 ? (
                  <Button onClick={() => go(1)}>
                    Continue <ArrowRight />
                  </Button>
                ) : (
                  <Button variant="accent" onClick={submit} loading={submitting} disabled={!user}>
                    <Send /> Submit Application
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          {country ? (
            <div className="sticky top-24 rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="relative h-8 w-11 overflow-hidden rounded ring-1 ring-black/5">
                  <Image src={flag(country.code)} alt="" fill sizes="44px" className="object-cover" />
                </span>
                <div>
                  <p className="font-semibold">{country.name}</p>
                  <p className="text-xs text-muted">{type ? `${type} visa` : "Select visa type"}</p>
                </div>
              </div>
              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Processing</dt>
                  <dd className="font-medium">{country.processing}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Validity</dt>
                  <dd className="font-medium">{country.validity}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2.5">
                  <dt className="text-muted">Service fee</dt>
                  <dd className="font-display text-lg font-bold text-primary">{formatMoney(country.fromPrice)}</dd>
                </div>
              </dl>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">Requirements</p>
              <ul className="mt-2 space-y-2 text-[13px] text-slate-700">
                {country.requirements.map((r) => (
                  <li key={r} className="flex gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-success" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-5 text-sm text-muted">Select a country to see requirements and fees.</div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Shell({ title, desc, action, children }: { title: string; desc?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
          {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Err({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-sm text-danger" role="alert">
      {children}
    </p>
  );
}

function ReviewBlock({ title, rows, onEdit }: { title: string; rows: string[][]; onEdit: () => void }) {
  return (
    <div className="rounded-xl border border-line">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <p className="text-sm font-semibold">{title}</p>
        <button onClick={onEdit} className="text-sm font-medium text-secondary hover:text-primary">
          Edit
        </button>
      </div>
      <dl className="divide-y divide-line text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-4 px-4 py-2.5">
            <dt className="w-28 shrink-0 text-muted">{k}</dt>
            <dd className="min-w-0 break-words font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
