"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Eye, EyeOff, KeyRound, Lock, Mail, MailCheck, Phone, User } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/field";
import { AppleIcon, GoogleIcon } from "@/components/shared/brand-icons";
import { useToast } from "@/components/ui/toast";

function PasswordInput({ label, value, onChange, error, autoComplete }: { label: string; value: string; onChange: (v: string) => void; error?: string; autoComplete?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input label={label} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} error={error} icon={<Lock />} autoComplete={autoComplete} className="pr-11" required />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-[34px] grid size-7 place-items-center rounded text-muted hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function StrengthMeter({ pw }: { pw: string }) {
  const s = strength(pw);
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-danger", "bg-danger", "bg-warning", "bg-secondary", "bg-success"];
  if (!pw) return null;
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full", i < s ? colors[s] : "bg-slate-200")} />
        ))}
      </div>
      <p className="mt-1 text-xs text-muted">
        Password strength: <span className="font-medium text-ink">{labels[s]}</span>
      </p>
    </div>
  );
}

function SocialButtons() {
  const toast = useToast();
  const notice = () => toast({ title: "Social sign-in is a demo placeholder", tone: "info" });
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={notice}>
          <GoogleIcon className="size-4" /> Google
        </Button>
        <Button variant="outline" onClick={notice}>
          <AppleIcon className="size-4" /> Apple
        </Button>
      </div>
      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> or continue with email <span className="h-px flex-1 bg-line" />
      </div>
    </>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { actions } = useStore();
  const [email, setEmail] = useState("alex.morgan@example.com");
  const [password, setPassword] = useState("Voyara!2026");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const expired = params.get("reason") === "expired";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6) return setError("Enter a valid email and password.");
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (password === "wrong") {
        setLoading(false);
        return setError("Email or password is incorrect. 4 attempts remaining.");
      }
      actions.login();
      router.push(params.get("next") ?? (email.endsWith("@voyara.travel") ? "/admin" : "/dashboard"));
    }, 700);
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-muted">Log in to manage bookings, visas and documents.</p>
      {expired && (
        <p className="mt-5 rounded-xl border border-amber-200 bg-warning-50 p-3 text-sm text-amber-800" role="alert">
          Your session expired for security. Please log in again.
        </p>
      )}
      <div className="mt-8">
        <SocialButtons />
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail />} autoComplete="email" required />
          <PasswordInput label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
          <div className="flex items-center justify-between">
            <Checkbox checked={remember} onChange={setRemember} label="Remember me" />
            <Link href="/forgot-password" className="text-sm font-medium text-secondary hover:text-primary">
              Forgot password?
            </Link>
          </div>
          {error && (
            <p className="rounded-lg bg-danger-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Log in
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          New to Voyara?{" "}
          <Link href="/register" className="font-semibold text-secondary hover:text-primary">
            Create an account
          </Link>
        </p>
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-center text-xs text-muted">
          Demo: any password works · use an <span className="font-medium text-ink">@voyara.travel</span> email to land in the admin panel.
        </p>
      </div>
    </>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { actions } = useStore();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Enter a valid email";
    if (f.phone.replace(/\D/g, "").length < 7) er.phone = "Enter a valid phone number";
    if (strength(f.password) < 3) er.password = "Use 8+ characters with upper & lower case and a number";
    if (f.confirm !== f.password) er.confirm = "Passwords don't match";
    if (!terms) er.terms = "Please accept the terms to continue";
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    setTimeout(() => {
      actions.login();
      router.push("/dashboard?welcome=1");
    }, 800);
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-muted">Save tours, book faster and track visas in one place.</p>
      <div className="mt-8">
        <SocialButtons />
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Input label="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} icon={<User />} error={errors.name} autoComplete="name" required />
          <Input label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} icon={<Mail />} error={errors.email} autoComplete="email" required />
          <Input label="Phone" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} icon={<Phone />} error={errors.phone} autoComplete="tel" required />
          <div>
            <PasswordInput label="Password" value={f.password} onChange={(v) => setF({ ...f, password: v })} error={errors.password} autoComplete="new-password" />
            <StrengthMeter pw={f.password} />
          </div>
          <PasswordInput label="Confirm password" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} error={errors.confirm} autoComplete="new-password" />
          <div>
            <Checkbox
              checked={terms}
              onChange={setTerms}
              label={
                <>
                  I agree to the <Link href="/legal/terms" className="font-medium text-secondary underline">Terms</Link> and <Link href="/legal/privacy" className="font-medium text-secondary underline">Privacy Policy</Link>
                </>
              }
            />
            {errors.terms && <p className="mt-1.5 text-xs text-danger">{errors.terms}</p>}
          </div>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-secondary hover:text-primary">
            Log in
          </Link>
        </p>
      </div>
    </>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (sent)
    return (
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-50 text-primary">
          <MailCheck className="size-6" />
        </span>
        <h1 className="mt-6 text-2xl font-bold">Check your inbox</h1>
        <p className="mt-2 text-muted">
          If an account exists for <span className="font-medium text-ink">{email}</span>, we&apos;ve sent a reset link. It expires in 30 minutes.
        </p>
        <ButtonLink href="/reset-password?token=demo" className="mt-8 w-full" size="lg">
          Open reset link (demo)
        </ButtonLink>
        <button onClick={() => setSent(false)} className="mt-4 text-sm font-medium text-secondary">
          Didn&apos;t get it? Resend
        </button>
      </div>
    );
  return (
    <>
      <Link href="/login" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Back to login
      </Link>
      <span className="grid size-12 place-items-center rounded-2xl bg-primary-50 text-primary">
        <KeyRound className="size-5" />
      </span>
      <h1 className="mt-6 text-3xl font-bold">Forgot password?</h1>
      <p className="mt-2 text-muted">Enter your email and we&apos;ll send you a secure reset link.</p>
      <form
        className="mt-8 space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address");
          setError("");
          setLoading(true);
          setTimeout(() => (setLoading(false), setSent(true)), 700);
        }}
      >
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail />} error={error} autoComplete="email" required />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Send reset link
        </Button>
      </form>
    </>
  );
}

export function ResetForm() {
  const router = useRouter();
  const toast = useToast();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const rules = [
    ["At least 8 characters", pw.length >= 8],
    ["Upper & lower case letters", /[A-Z]/.test(pw) && /[a-z]/.test(pw)],
    ["At least one number", /\d/.test(pw)],
  ] as const;
  return (
    <>
      <span className="grid size-12 place-items-center rounded-2xl bg-primary-50 text-primary">
        <Lock className="size-5" />
      </span>
      <h1 className="mt-6 text-3xl font-bold">Set a new password</h1>
      <p className="mt-2 text-muted">Choose a strong password you haven&apos;t used before.</p>
      <form
        className="mt-8 space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const er: Record<string, string> = {};
          if (!rules.every(([, ok]) => ok)) er.pw = "Password doesn't meet all requirements";
          if (confirm !== pw) er.confirm = "Passwords don't match";
          setErrors(er);
          if (Object.keys(er).length) return;
          setLoading(true);
          setTimeout(() => {
            toast({ title: "Password updated", description: "All other sessions have been signed out." });
            router.push("/login");
          }, 700);
        }}
      >
        <PasswordInput label="New password" value={pw} onChange={setPw} error={errors.pw} autoComplete="new-password" />
        <ul className="space-y-1.5 text-sm">
          {rules.map(([label, ok]) => (
            <li key={label} className={cn("flex items-center gap-2", ok ? "text-success" : "text-muted")}>
              <Check className={cn("size-4", !ok && "opacity-30")} /> {label}
            </li>
          ))}
        </ul>
        <PasswordInput label="Confirm password" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Update password
        </Button>
      </form>
    </>
  );
}
