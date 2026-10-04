"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Send } from "lucide-react";
import { useCurrentUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/field";

const SUBJECTS: Record<string, string> = {
  plan: "Plan a custom trip",
  flights: "Flight quote",
  hotels: "Hotel booking",
  visa: "Visa enquiry",
  general: "General question",
};

export function ContactForm() {
  const params = useSearchParams();
  const user = useCurrentUser();
  const topic = params.get("topic") ?? "general";
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    subject: SUBJECTS[topic] ?? SUBJECTS.general,
    message:
      topic === "flights" || topic === "hotels"
        ? `I'd like a quote${params.get("to") ? ` for ${params.get("to")}` : ""}${params.get("date") ? ` around ${params.get("date")}` : ""}.`
        : "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.name.trim().length < 2) er.name = "Please enter your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = "Enter a valid email address";
    if (form.message.trim().length < 10) er.message = "Tell us a little more (10+ characters)";
    setErrors(er);
    if (Object.keys(er).length) return;
    setState("sending");
    setTimeout(() => setState("sent"), 900);
  };

  if (state === "sent")
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white p-10 text-center">
        <CheckCircle2 className="size-12 text-success" />
        <h2 className="mt-4 text-2xl font-bold">Message received</h2>
        <p className="mt-2 max-w-sm text-muted">Thanks, {form.name.split(" ")[0]}. A specialist will reply to {form.email} within 2 working hours.</p>
        <Button variant="outline" className="mt-6" onClick={() => (setState("idle"), setForm({ ...form, message: "" }))}>
          Send another message
        </Button>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl border border-line bg-white p-6 md:p-8">
      <h2 className="text-xl font-bold">Send us a message</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} required autoComplete="name" />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} required autoComplete="email" />
        <Input label="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} hint="Optional — for a quicker call back" autoComplete="tel" />
        <Select label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} options={Object.values(SUBJECTS)} />
        <Textarea wrapperClassName="sm:col-span-2" label="Message" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} error={errors.message} required placeholder="Where would you like to go, when, and who's travelling?" />
      </div>
      <div className="mt-6 flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-xs text-muted">We&apos;ll only use your details to respond to this enquiry.</p>
        <Button type="submit" size="lg" loading={state === "sending"}>
          <Send /> Send message
        </Button>
      </div>
    </form>
  );
}
