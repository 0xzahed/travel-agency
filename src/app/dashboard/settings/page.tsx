"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { useCurrentUser, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { Input, Select, Switch } from "@/components/ui/field";
import { Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const user = useCurrentUser()!;
  const { actions } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [prefs, setPrefs] = useState({ bookingEmail: true, visaEmail: true, sms: true, marketing: false, push: true, priceAlerts: true });
  const [region, setRegion] = useState({ currency: "USD", language: "English (UK)", timezone: "Europe/London" });
  const [del, setDel] = useState(false);
  const [confirm, setConfirm] = useState("");
  const set = (k: keyof typeof prefs) => (v: boolean) => {
    setPrefs({ ...prefs, [k]: v });
    toast({ title: "Preference saved" });
  };

  return (
    <>
      <PageHeader title="Settings" description="Notifications, regional preferences and privacy." />
      <div className="grid max-w-4xl gap-6">
        <Card>
          <CardHeader title="Notifications" description="Choose how we keep you updated." />
          <div className="divide-y divide-line">
            {(
              [
                ["bookingEmail", "Booking updates", "Confirmations, changes and pre-departure info by email"],
                ["visaEmail", "Visa status", "Every status change on your visa applications"],
                ["sms", "SMS alerts", "Time-critical updates such as flight or pickup changes"],
                ["push", "Push notifications", "In-app alerts on the Voyara mobile app"],
                ["priceAlerts", "Price drop alerts", "When a saved tour goes on sale"],
                ["marketing", "Inspiration & offers", "Monthly newsletter and exclusive deals"],
              ] as const
            ).map(([k, l, d]) => (
              <div key={k} className="p-5">
                <Switch label={l} description={d} checked={prefs[k]} onChange={set(k)} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Regional preferences" />
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <Select label="Currency" value={region.currency} onChange={(e) => setRegion({ ...region, currency: e.target.value })} options={["USD", "GBP", "EUR", "AED", "BDT"]} />
            <Select label="Language" value={region.language} onChange={(e) => setRegion({ ...region, language: e.target.value })} options={["English (UK)", "English (US)", "العربية", "Français", "Deutsch"]} />
            <Select label="Time zone" value={region.timezone} onChange={(e) => setRegion({ ...region, timezone: e.target.value })} options={["Europe/London", "Asia/Dubai", "Asia/Dhaka", "America/New_York"]} />
          </div>
          <div className="flex justify-end border-t border-line px-5 py-3">
            <Button size="sm" onClick={() => toast({ title: "Preferences saved" })}>
              Save preferences
            </Button>
          </div>
        </Card>
        <Card>
          <CardHeader title="Privacy & data" />
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Export your data</p>
              <p className="text-sm text-muted">Download a copy of your bookings, documents and profile.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Export requested", description: `We'll email a download link to ${user.email}.` })}>
              <Download /> Request export
            </Button>
          </div>
          <div className="flex flex-col gap-4 border-t border-line bg-danger-50/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Delete account</p>
              <p className="text-sm text-red-700/80">Permanently remove your account. Active bookings must be cancelled first.</p>
            </div>
            <Button variant="danger-outline" size="sm" onClick={() => setDel(true)}>
              <Trash2 /> Delete account
            </Button>
          </div>
        </Card>
      </div>
      <Modal
        open={del}
        onClose={() => setDel(false)}
        title="Delete your account?"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDel(false)}>
              Keep account
            </Button>
            <Button
              variant="danger"
              disabled={confirm !== "DELETE"}
              onClick={() => {
                actions.logout();
                router.push("/");
                toast({ title: "Account scheduled for deletion", description: "You have 30 days to change your mind.", tone: "info" });
              }}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">This removes your profile, saved tours and documents after a 30-day grace period. Type DELETE to confirm.</p>
        <Input className="mt-4" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-label="Type DELETE to confirm" placeholder="DELETE" />
      </Modal>
    </>
  );
}
