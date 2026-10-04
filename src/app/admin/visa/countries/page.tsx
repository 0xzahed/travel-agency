"use client";

import { Suspense } from "react";
import Image from "next/image";
import { useQueryTab } from "@/lib/use-query-tab";
import { Briefcase, GraduationCap, Palmtree, PlaneTakeoff } from "lucide-react";
import { useStore } from "@/lib/store";
import { visaCountries } from "@/lib/data/visa";
import type { VisaType } from "@/lib/types";
import { flag, formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";

const TYPES: { t: VisaType; icon: React.ReactNode; desc: string; docs: string[] }[] = [
  { t: "Tourist", icon: <Palmtree />, desc: "Leisure travel and visiting friends", docs: ["Passport", "Photograph", "Bank Statement", "Hotel booking"] },
  { t: "Business", icon: <Briefcase />, desc: "Meetings, conferences, trade fairs", docs: ["Passport", "Photograph", "Invitation Letter", "Employer NOC"] },
  { t: "Student", icon: <GraduationCap />, desc: "Full-time study and exchanges", docs: ["Passport", "Photograph", "Admission letter", "Proof of funds"] },
  { t: "Transit", icon: <PlaneTakeoff />, desc: "Connecting through another country", docs: ["Passport", "Onward ticket"] },
];

function Inner() {
  const { state } = useStore();
  const [tab, setTab] = useQueryTab("tab", ["countries", "types"] as const, "countries");
  return (
    <>
      <PageHeader title="Visa catalogue" description="Countries, visa types and document requirements offered by the visa desk." />
      <Tabs className="mb-6" value={tab} onChange={setTab} tabs={[{ value: "countries", label: "Countries", count: visaCountries.length }, { value: "types", label: "Visa types", count: TYPES.length }]} />
      {tab === "countries" ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-slate-50/70 text-xs uppercase tracking-wide text-muted">
                {["Country", "Visa types", "Processing", "Validity", "Service fee", "Applications"].map((h) => (
                  <th key={h} className="px-5 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visaCountries.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2.5 font-medium">
                      <span className="relative h-5 w-7 overflow-hidden rounded-sm ring-1 ring-black/5">
                        <Image src={flag(c.code)} alt="" fill sizes="28px" className="object-cover" />
                      </span>
                      {c.name}
                      {c.popular && <Badge tone="accent">Popular</Badge>}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex flex-wrap gap-1">
                      {c.types.map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">{c.processing}</td>
                  <td className="px-5 py-3.5">{c.validity}</td>
                  <td className="px-5 py-3.5 font-semibold">{formatMoney(c.fromPrice)}</td>
                  <td className="px-5 py-3.5">{state.visaApplications.filter((v) => v.countryId === c.id).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {TYPES.map((v) => (
            <Card key={v.t} className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-primary-50 text-primary [&_svg]:size-5">{v.icon}</span>
                <div>
                  <h2 className="font-semibold">{v.t} visa</h2>
                  <p className="text-sm text-muted">{v.desc}</p>
                </div>
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">Required documents</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {v.docs.map((d) => (
                  <Badge key={d} tone="primary">{d}</Badge>
                ))}
              </div>
              <p className="mt-4 border-t border-line pt-3 text-sm text-muted">
                Offered in {visaCountries.filter((c) => c.types.includes(v.t)).length} countries · {state.visaApplications.filter((a) => a.type === v.t).length} applications
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
