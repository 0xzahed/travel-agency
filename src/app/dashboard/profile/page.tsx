"use client";

import { useRef, useState } from "react";
import { Camera, CheckCircle2, KeyRound, Laptop, LogOut, MapPin, ShieldCheck, Smartphone, Tablet } from "lucide-react";
import { useCurrentUser, useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { Input, Select, Switch, Textarea } from "@/components/ui/field";
import { ConfirmDialog, Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";

const SESSIONS = [
  { id: "s1", device: "MacBook Pro · Chrome", icon: <Laptop />, location: "London, UK", last: "Active now", current: true },
  { id: "s2", device: "iPhone 16 · Voyara app", icon: <Smartphone />, location: "London, UK", last: "2 hours ago", current: false },
  { id: "s3", device: "iPad Air · Safari", icon: <Tablet />, location: "Lisbon, Portugal", last: "12 Sep 2026", current: false },
];
const ACTIVITY = [
  ["Successful login", "Chrome on macOS · London, UK", "Today, 08:14"],
  ["Password changed", "Chrome on macOS · London, UK", "02 Aug 2026"],
  ["Two-factor enabled", "Voyara app on iOS", "02 Aug 2026"],
  ["Failed login attempt", "Unknown device · Frankfurt, DE", "28 Jul 2026"],
];

export default function ProfilePage() {
  const user = useCurrentUser()!;
  const { actions } = useStore();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({ name: user.name, email: user.email, phone: user.phone, dob: user.dob, nationality: user.nationality, passport: user.passport, passportExpiry: user.passportExpiry, address: user.address });
  const [saving, setSaving] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [tfaOpen, setTfaOpen] = useState(false);
  const [code, setCode] = useState("");
  const [sessions, setSessions] = useState(SESSIONS);
  const [logoutAll, setLogoutAll] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErr, setPwErr] = useState("");
  const [soon] = useState(() => Date.now() + 365 * 86400000);
  const dirty = JSON.stringify(f) !== JSON.stringify({ name: user.name, email: user.email, phone: user.phone, dob: user.dob, nationality: user.nationality, passport: user.passport, passportExpiry: user.passportExpiry, address: user.address });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      actions.updateCustomer(user.id, f);
      setSaving(false);
      toast({ title: "Profile updated" });
    }, 600);
  };

  return (
    <>
      <PageHeader title="Profile" description="Your personal details, passport information and account security." />
      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <form onSubmit={save} className="space-y-6">
          <Card>
            <CardHeader title="Personal information" />
            <div className="p-5">
              <div className="mb-6 flex items-center gap-5">
                <div className="relative">
                  <Avatar src={user.avatar} name={user.name} size={80} />
                  <button type="button" onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-2 border-white bg-primary text-white" aria-label="Change profile photo">
                    <Camera className="size-4" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        actions.updateCustomer(user.id, { avatar: String(reader.result) });
                        toast({ title: "Photo updated" });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted">Member since {formatDate(user.joinedAt, "long")}</p>
                  <Badge tone="success" className="mt-2">
                    <CheckCircle2 className="size-3" /> Verified traveller
                  </Badge>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                <Input label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
                <Input label="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                <Input label="Date of birth" type="date" value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} />
                <Select label="Nationality" value={f.nationality} onChange={(e) => setF({ ...f, nationality: e.target.value })} options={["British", "American", "Bangladeshi", "Canadian", "French", "German", "Indian", "Jordanian", "Portuguese", "South Korean"]} />
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Passport information" description="Used to pre-fill bookings and visa applications." />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Input label="Passport number" value={f.passport} onChange={(e) => setF({ ...f, passport: e.target.value.toUpperCase() })} />
              <Input label="Expiry date" type="date" value={f.passportExpiry} onChange={(e) => setF({ ...f, passportExpiry: e.target.value })} hint={new Date(f.passportExpiry).getTime() < soon ? "Expires within a year — consider renewing." : "Valid for travel"} />
            </div>
          </Card>
          <Card>
            <CardHeader title="Address" />
            <div className="p-5">
              <Textarea label="Home address" rows={2} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} className="min-h-0" />
            </div>
          </Card>
          <div className="sticky bottom-20 z-10 flex justify-end gap-2 lg:bottom-4">
            {dirty && (
              <Button variant="outline" onClick={() => setF({ name: user.name, email: user.email, phone: user.phone, dob: user.dob, nationality: user.nationality, passport: user.passport, passportExpiry: user.passportExpiry, address: user.address })}>
                Discard
              </Button>
            )}
            <Button type="submit" loading={saving} disabled={!dirty}>
              Save changes
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Security" />
            <div className="divide-y divide-line">
              <div className="flex items-center justify-between gap-4 p-5">
                <div className="flex gap-3">
                  <KeyRound className="mt-0.5 size-5 text-secondary" />
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-xs text-muted">Last changed 2 Aug 2026</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setPwOpen(true)}>
                  Change Password
                </Button>
              </div>
              <div className="p-5">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-5 text-secondary" />
                  <div className="flex-1">
                    <Switch
                      label="Two-Factor Authentication"
                      description={user.twoFactor ? "Enabled via authenticator app" : "Add an extra layer of security"}
                      checked={user.twoFactor}
                      onChange={(v) => (v ? (setCode(""), setTfaOpen(true)) : (actions.updateCustomer(user.id, { twoFactor: false }), toast({ title: "2FA disabled", tone: "warning" })))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Active sessions" action={<Button size="sm" variant="danger-outline" onClick={() => setLogoutAll(true)} disabled={sessions.length < 2}><LogOut /> Logout all devices</Button>} />
            <ul className="divide-y divide-line">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-muted [&_svg]:size-4">{s.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.device}</p>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <MapPin className="size-3" /> {s.location} · {s.last}
                    </p>
                  </div>
                  {s.current ? (
                    <Badge tone="success">This device</Badge>
                  ) : (
                    <button onClick={() => (setSessions(sessions.filter((x) => x.id !== s.id)), toast({ title: "Session revoked" }))} className="text-xs font-medium text-danger hover:underline">
                      Revoke
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Login activity" />
            <ul className="divide-y divide-line">
              {ACTIVITY.map(([t, d, at]) => (
                <li key={t + at} className="px-5 py-3">
                  <div className="flex justify-between gap-2">
                    <p className={`text-sm font-medium ${t.startsWith("Failed") ? "text-danger" : ""}`}>{t}</p>
                    <p className="shrink-0 text-xs text-muted">{at}</p>
                  </div>
                  <p className="text-xs text-muted">{d}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Modal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        title="Change password"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setPwOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!pw.current) return setPwErr("Enter your current password");
                if (pw.next.length < 8 || !/\d/.test(pw.next) || !/[A-Z]/.test(pw.next)) return setPwErr("New password needs 8+ characters, a number and an uppercase letter");
                if (pw.next !== pw.confirm) return setPwErr("Passwords don't match");
                setPwErr("");
                setPwOpen(false);
                setPw({ current: "", next: "", confirm: "" });
                toast({ title: "Password changed", description: "Other devices have been signed out." });
              }}
            >
              Update password
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Current password" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
          <Input label="New password" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
          <Input label="Confirm new password" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
          {pwErr && <p className="text-sm text-danger" role="alert">{pwErr}</p>}
        </div>
      </Modal>

      <Modal
        open={tfaOpen}
        onClose={() => setTfaOpen(false)}
        title="Set up two-factor authentication"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setTfaOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={code.length !== 6}
              onClick={() => {
                actions.updateCustomer(user.id, { twoFactor: true });
                setTfaOpen(false);
                toast({ title: "Two-factor authentication enabled" });
              }}
            >
              Verify & enable
            </Button>
          </>
        }
      >
        <ol className="space-y-4 text-sm">
          <li>
            <p className="font-medium">1. Scan this QR code with your authenticator app</p>
            <div className="mt-3 grid size-36 grid-cols-9 gap-0.5 rounded-xl border border-line bg-white p-2" aria-label="QR code (demo)" role="img">
              {Array.from({ length: 81 }, (_, i) => (
                <span key={i} className={(i * 37) % 7 < 3 || [0, 1, 2, 9, 18, 6, 7, 8, 17, 26, 54, 63, 72, 73, 74].includes(i) ? "bg-ink" : ""} />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              Or enter key: <span className="font-mono text-ink">VOYA RA26 K7QM 3XPL</span>
            </p>
          </li>
          <li>
            <p className="mb-2 font-medium">2. Enter the 6-digit code</p>
            <Input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" className="text-center font-mono text-lg tracking-[0.5em]" aria-label="Verification code" />
          </li>
        </ol>
      </Modal>

      <ConfirmDialog
        open={logoutAll}
        onClose={() => setLogoutAll(false)}
        tone="danger"
        title="Log out of all other devices?"
        description="You'll stay signed in on this device. Everyone else will need to log in again."
        confirmLabel="Logout all"
        onConfirm={() => {
          setSessions(sessions.filter((s) => s.current));
          toast({ title: "Signed out of all other devices" });
        }}
      />
    </>
  );
}
