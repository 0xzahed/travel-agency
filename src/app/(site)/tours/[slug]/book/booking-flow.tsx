"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, Building2, CalendarDays, Check, ChevronLeft, Clock, CreditCard, Lock, LogIn, ShieldCheck, Users } from "lucide-react";
import { addOns } from "@/lib/data/tours";
import { CHILD_RATE, quote } from "@/lib/pricing";
import { useCurrentUser, useStore } from "@/lib/store";
import type { Traveler } from "@/lib/types";
import { cn, formatDate, formatMoney, img } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Input, Select, Stepper } from "@/components/ui/field";
import { Calendar, StepIndicator } from "@/components/ui/widgets";
import { ErrorState } from "@/components/ui/states";
import { AppleIcon } from "@/components/shared/brand-icons";
import { Compass } from "lucide-react";

const STEPS = ["Date", "Travelers", "Add-ons", "Details", "Review", "Payment"];
const NATIONALITIES = ["British", "American", "Bangladeshi", "Canadian", "French", "German", "Indian", "Jordanian", "Portuguese", "South Korean", "Emirati", "Other"];

type TravelerForm = Omit<Traveler, "id">;

const blankTraveler = (type: Traveler["type"]): TravelerForm => ({ firstName: "", lastName: "", passport: "", nationality: "", dob: "", type, email: "", phone: "" });

// Deterministic seat availability for the calendar.
const seatsFor = (key: string) => {
  const d = new Date(key);
  const h = (d.getDate() * 7 + d.getMonth() * 13) % 17;
  if (h === 0) return null;
  return h < 4 ? h + 1 : 12;
};

export function BookingFlow({ slug }: { slug: string }) {
  const { state, actions, hydrated } = useStore();
  const user = useCurrentUser();
  const router = useRouter();
  const params = useSearchParams();
  const tour = state.tours.find((t) => t.slug === slug);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [date, setDate] = useState(params.get("date") ?? "");
  const [adults, setAdults] = useState(Number(params.get("adults") ?? 2));
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [travelers, setTravelers] = useState<TravelerForm[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<"card" | "paypal" | "apple" | "bank">("card");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" });
  const [agree, setAgree] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState("");

  const [minDate] = useState(() => new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
  const q = useMemo(() => (tour ? quote(tour, adults, children, infants, selected) : null), [tour, adults, children, infants, selected]);

  if (!tour || !q) {
    if (!hydrated) return <div className="min-h-screen" />;
    return (
      <div className="pt-24">
        <ErrorState icon={<Compass />} code="404" title="Tour not found" description="We couldn't find this tour to book." actions={<ButtonLink href="/tours">Browse tours</ButtonLink>} />
      </div>
    );
  }

  const syncTravelers = () => {
    const want: Traveler["type"][] = [...Array(adults).fill("Adult"), ...Array(children).fill("Child"), ...Array(infants).fill("Infant")];
    setTravelers((prev) =>
      want.map((type, i) => {
        if (prev[i] && prev[i].type === type) return prev[i];
        if (i === 0 && user) {
          const [first, ...rest] = user.name.split(" ");
          return { firstName: first, lastName: rest.join(" "), email: user.email, phone: user.phone, passport: user.passport, nationality: user.nationality, dob: user.dob, type };
        }
        return blankTraveler(type);
      }),
    );
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0 && !date) e.date = "Please choose a departure date.";
    if (step === 1 && adults < 1) e.adults = "At least one adult is required.";
    if (step === 1 && adults + children > tour.groupSize) e.adults = `This tour allows up to ${tour.groupSize} travellers.`;
    if (step === 3) {
      travelers.forEach((t, i) => {
        if (!t.firstName.trim()) e[`${i}.firstName`] = "Required";
        if (!t.lastName.trim()) e[`${i}.lastName`] = "Required";
        if (!/^[A-Z0-9]{6,9}$/i.test(t.passport)) e[`${i}.passport`] = "6–9 letters or digits";
        if (!t.nationality) e[`${i}.nationality`] = "Required";
        if (!t.dob) e[`${i}.dob`] = "Required";
        if (i === 0 && !/^\S+@\S+\.\S+$/.test(t.email ?? "")) e[`${i}.email`] = "Enter a valid email";
        if (i === 0 && (t.phone ?? "").replace(/\D/g, "").length < 7) e[`${i}.phone`] = "Enter a valid phone number";
      });
    }
    if (step === 5) {
      if (method === "card") {
        if (card.name.trim().length < 3) e.cardName = "Name as shown on card";
        if (card.number.replace(/\s/g, "").length !== 16) e.cardNumber = "Enter a 16-digit card number";
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) e.cardExpiry = "MM/YY";
        if (!/^\d{3,4}$/.test(card.cvc)) e.cardCvc = "3–4 digits";
      }
      if (!agree) e.agree = "Please accept the booking terms.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step === 2) syncTravelers();
    setDir(1);
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    setErrors({});
    setDir(-1);
    setStep((s) => s - 1);
  };

  const pay = () => {
    if (!validate() || !user) return;
    setPayError("");
    setProcessing(true);
    setTimeout(() => {
      // Demo: card ending 0002 simulates a decline.
      if (method === "card" && card.number.replace(/\s/g, "").endsWith("0002")) {
        setProcessing(false);
        setPayError("Your card was declined by the issuing bank. No money has been taken — try another card or payment method.");
        return;
      }
      const booking = actions.createBooking(
        {
          tourId: tour.id,
          customerId: user.id,
          date,
          adults,
          children,
          infants,
          addOns: selected,
          travelers: travelers.map((t, i) => ({ ...t, id: `tr-${i}` })),
          ...q,
          paymentMethod: method === "card" ? `Visa •••• ${card.number.replace(/\s/g, "").slice(-4)}` : method === "paypal" ? "PayPal" : method === "apple" ? "Apple Pay" : "Bank Transfer",
        },
        method !== "bank",
      );
      router.push(`/booking/confirmation/${booking.id}`);
    }, 1600);
  };

  const setT = (i: number, k: keyof TravelerForm, v: string) => setTravelers((all) => all.map((t, j) => (j === i ? { ...t, [k]: v } : t)));

  return (
    <div className="bg-canvas pb-20 pt-16 md:pt-[76px]">
      <div className="border-b border-line bg-white">
        <div className="container-x py-6">
          <Link href={`/tours/${tour.slug}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ChevronLeft className="size-4" /> Back to tour
          </Link>
          <StepIndicator steps={STEPS} current={step} />
        </div>
      </div>

      <div className="container-x mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          {!user && (
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-accent/40 bg-accent-50 p-5 sm:flex-row sm:items-center">
              <LogIn className="size-5 shrink-0 text-accent-600" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-ink">Log in to complete your booking</p>
                <p className="text-muted">Your booking, vouchers and invoices will be saved to your dashboard.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => actions.login()}>
                  Continue as Alex (demo)
                </Button>
                <ButtonLink href={`/login?next=/tours/${tour.slug}/book`} size="sm" variant="outline">
                  Log in
                </ButtonLink>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                initial={{ opacity: 0, x: dir * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -24 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="p-5 md:p-8"
              >
                {step === 0 && (
                  <StepShell title="Select your departure date" desc="Dots mark dates with fewer than 6 seats left. Crossed-out dates are sold out.">
                    <div className="grid gap-8 md:grid-cols-[1fr_220px]">
                      <Calendar value={date} onChange={setDate} minDate={minDate} availability={seatsFor} />
                      <div className="space-y-3 text-sm">
                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs text-muted">Departure</p>
                          <p className="mt-1 font-semibold">{date ? formatDate(date, "long") : "Not selected"}</p>
                          {date && (
                            <>
                              <p className="mt-3 text-xs text-muted">Return</p>
                              <p className="mt-1 font-semibold">{formatDate(new Date(new Date(date).getTime() + tour.nights * 86400000), "long")}</p>
                              {seatsFor(date)! < 6 && <p className="mt-3 text-xs font-medium text-accent-600">Only {seatsFor(date)} seats left</p>}
                            </>
                          )}
                        </div>
                        {errors.date && <p className="text-sm text-danger" role="alert">{errors.date}</p>}
                      </div>
                    </div>
                  </StepShell>
                )}

                {step === 1 && (
                  <StepShell title="Who's travelling?" desc={`Children (2–11) are charged at ${CHILD_RATE * 100}% of the adult price. Infants under 2 travel free.`}>
                    <div className="max-w-md divide-y divide-line">
                      <Stepper label="Adults" sub="Age 12+" value={adults} onChange={setAdults} min={1} max={tour.groupSize} />
                      <Stepper label="Children" sub="Age 2–11" value={children} onChange={setChildren} max={Math.max(0, tour.groupSize - adults)} />
                      <Stepper label="Infants" sub="Under 2" value={infants} onChange={setInfants} max={4} />
                    </div>
                    {errors.adults && <p className="mt-3 text-sm text-danger" role="alert">{errors.adults}</p>}
                  </StepShell>
                )}

                {step === 2 && (
                  <StepShell title="Enhance your trip" desc="Optional extras — add or remove any time before departure.">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {addOns.map((a) => {
                        const on = selected.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => setSelected(on ? selected.filter((x) => x !== a.id) : [...selected, a.id])}
                            className={cn("flex items-start gap-3 rounded-xl border p-4 text-left transition-colors", on ? "border-primary bg-primary-50/60 ring-1 ring-primary" : "border-line hover:border-slate-300")}
                          >
                            <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border", on ? "border-primary bg-primary text-white" : "border-slate-300")}>{on && <Check className="size-3.5" strokeWidth={3} />}</span>
                            <span className="flex-1">
                              <span className="block text-sm font-semibold text-ink">{a.name}</span>
                              <span className="mt-0.5 block text-xs text-muted">{a.description}</span>
                              <span className="mt-2 block text-sm font-semibold text-primary">
                                +{formatMoney(a.price)} <span className="text-xs font-normal text-muted">/ {a.per}</span>
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </StepShell>
                )}

                {step === 3 && (
                  <StepShell title="Traveller information" desc="Names must match passports exactly.">
                    <div className="space-y-6">
                      {travelers.map((t, i) => (
                        <fieldset key={i} className="rounded-xl border border-line p-5">
                          <legend className="px-2 text-sm font-semibold">
                            Traveller {i + 1} · {t.type}
                            {i === 0 && <span className="ml-2 text-xs font-normal text-muted">(lead contact)</span>}
                          </legend>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Input label="First name" value={t.firstName} onChange={(e) => setT(i, "firstName", e.target.value)} error={errors[`${i}.firstName`]} required />
                            <Input label="Last name" value={t.lastName} onChange={(e) => setT(i, "lastName", e.target.value)} error={errors[`${i}.lastName`]} required />
                            {i === 0 && (
                              <>
                                <Input label="Email" type="email" value={t.email} onChange={(e) => setT(i, "email", e.target.value)} error={errors[`${i}.email`]} required />
                                <Input label="Phone" type="tel" value={t.phone} onChange={(e) => setT(i, "phone", e.target.value)} error={errors[`${i}.phone`]} required />
                              </>
                            )}
                            <Input label="Passport number" value={t.passport} onChange={(e) => setT(i, "passport", e.target.value.toUpperCase())} error={errors[`${i}.passport`]} required />
                            <Select label="Nationality" value={t.nationality} onChange={(e) => setT(i, "nationality", e.target.value)} options={NATIONALITIES} placeholder="Select nationality" error={errors[`${i}.nationality`]} required />
                            <Input label="Date of birth" type="date" value={t.dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setT(i, "dob", e.target.value)} error={errors[`${i}.dob`]} required />
                          </div>
                        </fieldset>
                      ))}
                    </div>
                  </StepShell>
                )}

                {step === 4 && (
                  <StepShell title="Review your booking" desc="Please check everything before continuing to payment.">
                    <div className="divide-y divide-line rounded-xl border border-line">
                      <ReviewRow label="Tour" value={tour.title} onEdit={() => setStep(0)} />
                      <ReviewRow label="Date" value={`${formatDate(date, "long")} · ${tour.days} days`} onEdit={() => setStep(0)} />
                      <ReviewRow label="Travellers" value={[`${adults} adult${adults > 1 ? "s" : ""}`, children && `${children} child${children > 1 ? "ren" : ""}`, infants && `${infants} infant${infants > 1 ? "s" : ""}`].filter(Boolean).join(", ")} onEdit={() => setStep(1)} />
                      <ReviewRow label="Add-ons" value={selected.length ? selected.map((s) => addOns.find((a) => a.id === s)?.name).join(", ") : "None"} onEdit={() => setStep(2)} />
                      <ReviewRow
                        label="Names"
                        value={
                          <ul className="space-y-0.5">
                            {travelers.map((t, i) => (
                              <li key={i}>
                                {t.firstName} {t.lastName} <span className="text-muted">· {t.passport}</span>
                              </li>
                            ))}
                          </ul>
                        }
                        onEdit={() => setStep(3)}
                      />
                      <ReviewRow label="Total" value={<span className="font-display text-lg font-bold text-primary">{formatMoney(q.total)}</span>} />
                    </div>
                  </StepShell>
                )}

                {step === 5 && (
                  <StepShell title="Payment" desc="This is a demo checkout — no real payment is processed.">
                    <div role="radiogroup" aria-label="Payment method" className="grid gap-2.5 sm:grid-cols-4">
                      {[
                        ["card", "Card", <CreditCard key="c" />],
                        ["paypal", "PayPal", <span key="p" className="text-xs font-extrabold italic text-[#003087]">Pay<span className="text-[#009CDE]">Pal</span></span>],
                        ["apple", "Apple Pay", <AppleIcon key="a" className="size-4" />],
                        ["bank", "Bank transfer", <Building2 key="b" />],
                      ].map(([id, label, icon]) => (
                        <button
                          key={id as string}
                          role="radio"
                          aria-checked={method === id}
                          onClick={() => setMethod(id as typeof method)}
                          className={cn("flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-colors [&_svg]:size-4", method === id ? "border-primary bg-primary-50/60 ring-1 ring-primary" : "border-line hover:border-slate-300")}
                        >
                          {icon}
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-6">
                      {method === "card" && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input wrapperClassName="sm:col-span-2" label="Name on card" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} error={errors.cardName} autoComplete="cc-name" />
                          <Input
                            wrapperClassName="sm:col-span-2"
                            label="Card number"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            placeholder="4242 4242 4242 4242"
                            value={card.number}
                            onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() })}
                            error={errors.cardNumber}
                            hint="Demo: any 16 digits succeed; a number ending 0002 is declined."
                            icon={<CreditCard />}
                          />
                          <Input
                            label="Expiry"
                            placeholder="MM/YY"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            value={card.expiry}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                              setCard({ ...card, expiry: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v });
                            }}
                            error={errors.cardExpiry}
                          />
                          <Input label="CVC" placeholder="123" inputMode="numeric" autoComplete="cc-csc" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} error={errors.cardCvc} />
                        </div>
                      )}
                      {(method === "paypal" || method === "apple") && (
                        <div className="rounded-xl bg-slate-50 p-5 text-sm text-muted">You&apos;ll be redirected to {method === "paypal" ? "PayPal" : "Apple Pay"} to authorise {formatMoney(q.total)} securely.</div>
                      )}
                      {method === "bank" && (
                        <div className="rounded-xl bg-slate-50 p-5 text-sm">
                          <p className="font-semibold text-ink">Pay by bank transfer within 48 hours</p>
                          <dl className="mt-3 grid grid-cols-2 gap-2 text-muted">
                            <dt>Account</dt>
                            <dd className="text-ink">Voyara Travel Ltd.</dd>
                            <dt>IBAN</dt>
                            <dd className="text-ink">GB33 BUKB 2020 1555 5555 55</dd>
                            <dt>Reference</dt>
                            <dd className="text-ink">Your booking ID</dd>
                          </dl>
                          <p className="mt-3 text-xs text-muted">Your booking will show as Pending until payment arrives.</p>
                        </div>
                      )}
                    </div>

                    <Checkbox
                      className="mt-6"
                      checked={agree}
                      onChange={setAgree}
                      label={
                        <>
                          I agree to the <Link href="/legal/terms" className="font-medium text-secondary underline">booking terms</Link> and <Link href="/legal/cancellation" className="font-medium text-secondary underline">cancellation policy</Link>.
                        </>
                      }
                    />
                    {errors.agree && <p className="mt-2 text-sm text-danger">{errors.agree}</p>}

                    {payError && (
                      <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-danger-50 p-4 text-sm">
                        <AlertCircle className="size-5 shrink-0 text-danger" />
                        <div>
                          <p className="font-semibold text-red-800">Payment failed</p>
                          <p className="mt-0.5 text-red-700">{payError}</p>
                        </div>
                      </div>
                    )}

                    <p className="mt-6 flex items-center gap-2 text-xs text-muted">
                      <Lock className="size-3.5" /> 256-bit TLS encryption · PCI-DSS compliant processor
                    </p>
                  </StepShell>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between gap-3 border-t border-line bg-slate-50/60 px-5 py-4 md:px-8">
              <Button variant="ghost" onClick={back} disabled={step === 0 || processing}>
                <ArrowLeft /> Back
              </Button>
              {step < 5 ? (
                <Button onClick={next} disabled={step === 3 && !user}>
                  Continue <ArrowRight />
                </Button>
              ) : (
                <Button variant="accent" size="lg" onClick={pay} loading={processing} disabled={!user}>
                  {processing ? "Processing payment…" : method === "bank" ? "Confirm booking" : `Pay ${formatMoney(q.total)}`}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside>
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex gap-4 border-b border-line p-5">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                <Image src={img(tour.image, 300)} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">{tour.location}</p>
                <p className="mt-0.5 font-semibold leading-snug text-ink">{tour.title}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <Clock className="size-3.5" /> {tour.days} days
                </p>
              </div>
            </div>
            <div className="space-y-3 p-5 text-sm">
              <SummaryLine icon={<CalendarDays />} label="Date" value={date ? formatDate(date) : "—"} />
              <SummaryLine icon={<Users />} label="Travellers" value={`${adults + children + infants}`} />
              <div className="space-y-2 border-t border-line pt-3">
                <Line label={`Adults × ${adults}`} value={formatMoney(tour.price * adults)} />
                {children > 0 && <Line label={`Children × ${children}`} value={formatMoney(Math.round(tour.price * CHILD_RATE * children))} />}
                {infants > 0 && <Line label={`Infants × ${infants}`} value="Free" />}
                {selected.map((s) => {
                  const a = addOns.find((x) => x.id === s)!;
                  return <Line key={s} label={a.name} value={formatMoney(a.per === "person" ? a.price * (adults + children) : a.price)} />;
                })}
                <Line label="Taxes & fees (5%)" value={formatMoney(q.taxes)} />
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-extrabold text-primary">{formatMoney(q.total)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-success-50 px-5 py-3 text-xs font-medium text-green-800">
              <ShieldCheck className="size-4" /> Free cancellation until 30 days before departure
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StepShell({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
      {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="flex items-start gap-4 px-4 py-3.5 text-sm">
      <span className="w-24 shrink-0 text-muted">{label}</span>
      <span className="flex-1 font-medium text-ink">{value}</span>
      {onEdit && (
        <button onClick={onEdit} className="text-sm font-medium text-secondary hover:text-primary">
          Edit
        </button>
      )}
    </div>
  );
}

function SummaryLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted [&_svg]:size-4">
        {icon} {label}
      </span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span>
      <span className="tabular-nums text-ink">{value}</span>
    </div>
  );
}
