"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BellOff, CheckCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Notification } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { EmptyState } from "@/components/ui/states";
import { NotificationItem } from "@/components/shared/notification-center";

type F = "all" | "unread" | Notification["kind"];

export default function NotificationsPage() {
  const { state, actions } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState<F>("all");
  const all = state.notifications.filter((n) => n.audience === "admin");
  const list = all.filter((n) => (tab === "all" ? true : tab === "unread" ? !n.read : n.kind === tab));
  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${all.filter((n) => !n.read).length} unread`}
        actions={
          <Button variant="outline" onClick={() => actions.markAllRead("admin")}>
            <CheckCheck /> Mark all read
          </Button>
        }
      />
      <Card>
        <div className="px-5 pt-3">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={(["all", "unread", "booking", "visa", "payment", "support", "cancellation"] as F[]).map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1), count: t === "all" ? all.length : t === "unread" ? all.filter((n) => !n.read).length : all.filter((n) => n.kind === t).length }))}
          />
        </div>
        {list.length ? (
          <div className="space-y-1 p-3">
            {list.map((n) => (
              <NotificationItem key={n.id} n={n} onClick={() => (actions.markRead(n.id), n.href && router.push(n.href))} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<BellOff />} title="No notifications" description="You're all caught up." />
        )}
      </Card>
    </>
  );
}
