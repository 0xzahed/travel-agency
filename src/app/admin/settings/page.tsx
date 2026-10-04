"use client";

import { Suspense, useState } from "react";
import { useQueryTab } from "@/lib/use-query-tab";
import { company } from "@/lib/data/content";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { Input, Select, Switch } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

const EVENTS = [
  ["New booking received", "booking"],
  ["Visa document uploaded", "visa"],
  ["Payment completed", "payment"],
  ["Payment failed", "payment"],
  ["Customer requested support", "support"],
  ["Booking cancellation requested", "cancellation"],
] as const;

function Inner() {
  const toast = useToast();
  const [tab, setTab] = useQueryTab("tab", ["general", "notifications", "security"] as const, "general");
  const [g, setG] = useState({ name: "Voyara Travel", email: company.email, phone: company.phone, currency: "USD", timezone: "Europe/London", tax: "5" });
  const [matrix, setMatrix] = useState<Record<string, { email: boolean; app: boolean; sms: boolean }>>(Object.fromEntries(EVENTS.map(([e]) => [e, { email: true, app: true, sms: e.includes("failed") || e.includes("cancellation") }])));
  const [sec, setSec] = useState({ enforce2fa: true, sessionTimeout: "30", ipAllow: false, audit: true });

  return (
    <>
      <PageHeader title="Settings" description="Company details, notifications and security policies." />
      <Tabs className="mb-6" value={tab} onChange={setTab} tabs={[{ value: "general", label: "General" }, { value: "notifications", label: "Notifications" }, { value: "security", label: "Security" }]} />
      {tab === "general" && (
        <Card className="max-w-3xl">
          <CardHeader title="Company" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Input label="Company name" value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} />
            <Input label="Support email" value={g.email} onChange={(e) => setG({ ...g, email: e.target.value })} />
            <Input label="Phone" value={g.phone} onChange={(e) => setG({ ...g, phone: e.target.value })} />
            <Select label="Default currency" value={g.currency} onChange={(e) => setG({ ...g, currency: e.target.value })} options={["USD", "GBP", "EUR", "AED"]} />
            <Select label="Time zone" value={g.timezone} onChange={(e) => setG({ ...g, timezone: e.target.value })} options={["Europe/London", "Asia/Dubai", "Asia/Kuala_Lumpur"]} />
            <Input label="Tax rate (%)" type="number" value={g.tax} onChange={(e) => setG({ ...g, tax: e.target.value })} />
          </div>
          <div className="flex justify-end border-t border-line px-5 py-3">
            <Button onClick={() => toast({ title: "Settings saved" })}>Save changes</Button>
          </div>
        </Card>
      )}
      {tab === "notifications" && (
        <Card className="max-w-3xl overflow-x-auto">
          <CardHeader title="Staff notifications" description="Choose channels for each event" />
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-line bg-slate-50/70 text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left font-semibold">Event</th>
                {["In-app", "Email", "SMS"].map((h) => (
                  <th key={h} className="px-5 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {EVENTS.map(([e]) => (
                <tr key={e}>
                  <td className="px-5 py-3.5 font-medium">{e}</td>
                  {(["app", "email", "sms"] as const).map((ch) => (
                    <td key={ch} className="px-5 py-3.5">
                      <div className="flex justify-center">
                        <Switch checked={matrix[e][ch]} onChange={(v) => setMatrix({ ...matrix, [e]: { ...matrix[e], [ch]: v } })} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end border-t border-line px-5 py-3">
            <Button onClick={() => toast({ title: "Notification preferences saved" })}>Save</Button>
          </div>
        </Card>
      )}
      {tab === "security" && (
        <Card className="max-w-3xl">
          <CardHeader title="Security policies" />
          <div className="divide-y divide-line">
            <div className="p-5">
              <Switch label="Require 2FA for all staff" description="Staff without 2FA are prompted at next login" checked={sec.enforce2fa} onChange={(v) => setSec({ ...sec, enforce2fa: v })} />
            </div>
            <div className="p-5">
              <Switch label="Restrict admin access by IP" description="Only allow office and VPN IP ranges" checked={sec.ipAllow} onChange={(v) => setSec({ ...sec, ipAllow: v })} />
            </div>
            <div className="p-5">
              <Switch label="Audit log" description="Record every create, edit, delete and approval" checked={sec.audit} onChange={(v) => setSec({ ...sec, audit: v })} />
            </div>
            <div className="p-5">
              <Select label="Session timeout" value={sec.sessionTimeout} onChange={(e) => setSec({ ...sec, sessionTimeout: e.target.value })} options={[{ value: "15", label: "15 minutes" }, { value: "30", label: "30 minutes" }, { value: "60", label: "1 hour" }, { value: "240", label: "4 hours" }]} wrapperClassName="max-w-xs" />
            </div>
          </div>
          <div className="flex justify-end border-t border-line px-5 py-3">
            <Button onClick={() => toast({ title: "Security policies updated" })}>Save</Button>
          </div>
        </Card>
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
