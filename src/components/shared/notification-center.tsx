"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff, CalendarCheck, CheckCheck, CreditCard, FileCheck2, LifeBuoy, Settings2, XCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Notification } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/ui/states";

const ICONS: Record<Notification["kind"], { icon: React.ReactNode; cls: string }> = {
  booking: { icon: <CalendarCheck />, cls: "bg-primary-50 text-primary" },
  visa: { icon: <FileCheck2 />, cls: "bg-sky-50 text-sky-700" },
  payment: { icon: <CreditCard />, cls: "bg-success-50 text-success" },
  support: { icon: <LifeBuoy />, cls: "bg-violet-50 text-violet-700" },
  cancellation: { icon: <XCircle />, cls: "bg-danger-50 text-danger" },
  system: { icon: <Settings2 />, cls: "bg-slate-100 text-slate-600" },
};

export function NotificationItem({ n, onClick, compact }: { n: Notification; onClick?: () => void; compact?: boolean }) {
  const meta = ICONS[n.kind];
  return (
    <button onClick={onClick} className={cn("flex w-full gap-3 text-left transition-colors hover:bg-slate-50", compact ? "px-4 py-3" : "rounded-xl p-4", !n.read && "bg-primary-50/40")}>
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg [&_svg]:size-4", meta.cls)}>{meta.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={cn("text-sm", n.read ? "font-medium text-ink" : "font-semibold text-ink")}>{n.title}</span>
          <span className="shrink-0 text-[11px] text-muted">{timeAgo(n.at)}</span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[13px] text-muted">{n.body}</span>
      </span>
      {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
    </button>
  );
}

export function NotificationBell({ audience, allHref }: { audience: Notification["audience"]; allHref?: string }) {
  const { state, actions } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const ref = useRef<HTMLDivElement>(null);
  const items = state.notifications.filter((n) => n.audience === audience);
  const unread = items.filter((n) => !n.read).length;
  const shown = tab === "unread" ? items.filter((n) => !n.read) : items;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative grid size-10 place-items-center rounded-[10px] text-slate-600 hover:bg-slate-100">
        <Bell className="size-[18px]" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-ink ring-2 ring-white">{unread}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-lift)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[400px]"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="font-semibold">Notifications</p>
              <button onClick={() => actions.markAllRead(audience)} disabled={!unread} className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-primary disabled:opacity-40">
                <CheckCheck className="size-3.5" /> Mark all read
              </button>
            </div>
            <div className="flex gap-1 border-b border-line px-3 py-2">
              {(["all", "unread"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={cn("rounded-md px-2.5 py-1 text-xs font-medium capitalize", tab === t ? "bg-primary-50 text-primary" : "text-muted hover:text-ink")}>
                  {t} {t === "unread" && unread > 0 && `(${unread})`}
                </button>
              ))}
            </div>
            <div className="max-h-[420px] divide-y divide-line overflow-y-auto">
              {shown.length ? (
                shown.map((n) => (
                  <NotificationItem
                    key={n.id}
                    n={n}
                    compact
                    onClick={() => {
                      actions.markRead(n.id);
                      setOpen(false);
                      if (n.href) router.push(n.href);
                    }}
                  />
                ))
              ) : (
                <EmptyState icon={<BellOff />} title="No notifications" description="You're all caught up." className="py-10" />
              )}
            </div>
            {allHref && (
              <button onClick={() => (setOpen(false), router.push(allHref))} className="w-full border-t border-line py-3 text-center text-sm font-medium text-secondary hover:bg-slate-50">
                View all notifications
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
