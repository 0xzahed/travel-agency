"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, CalendarCheck, CreditCard, FileCheck2, FolderOpen, Home, LayoutDashboard, LogIn, LogOut, MessageSquare, Settings, User as UserIcon } from "lucide-react";
import { useCurrentUser, useStore } from "@/lib/store";
import { AppShell, type NavSection } from "@/components/shared/app-shell";
import { NotificationBell } from "@/components/shared/notification-center";
import { Dropdown } from "@/components/ui/disclosure";
import { Avatar, Skeleton } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { SiteSearch } from "@/components/site/site-search";
import { LogoMark } from "@/components/shared/logo";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const { state, actions, hydrated } = useStore();
  const user = useCurrentUser();
  const router = useRouter();
  const [search, setSearch] = useState(false);

  if (!hydrated)
    return (
      <div className="flex min-h-dvh">
        <div className="hidden w-[264px] border-r border-line bg-white lg:block" />
        <div className="flex-1 space-y-4 p-8">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-72" />
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas px-4">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 text-center">
          <LogoMark className="mx-auto size-10" />
          <h1 className="mt-5 text-xl font-bold">Log in to your dashboard</h1>
          <p className="mt-2 text-sm text-muted">Your bookings, visas and documents are waiting for you.</p>
          <div className="mt-6 space-y-2">
            <ButtonLink href="/login?next=/dashboard" className="w-full">
              <LogIn /> Log in
            </ButtonLink>
            <button onClick={() => actions.login()} className="w-full py-2 text-sm font-medium text-secondary">
              Continue as Alex (demo)
            </button>
          </div>
        </div>
      </div>
    );

  const myBookings = state.bookings.filter((b) => b.customerId === user.id);
  const myVisa = state.visaApplications.filter((v) => v.customerId === user.id);
  const actionVisa = myVisa.filter((v) => v.status === "Documents Required").length;
  const openTickets = state.tickets.filter((t) => t.customerId === user.id && t.messages.at(-1)?.from === "agent" && !["Resolved", "Closed"].includes(t.status)).length;

  const sections: NavSection[] = [
    {
      items: [
        { href: "/dashboard", label: "Overview", icon: <LayoutDashboard />, exact: true },
        { href: "/dashboard/bookings", label: "My Bookings", icon: <CalendarCheck />, badge: myBookings.filter((b) => b.status === "Pending").length },
        { href: "/dashboard/visa", label: "Visa Applications", icon: <FileCheck2 />, badge: actionVisa },
        { href: "/dashboard/saved", label: "Saved Tours", icon: <Bookmark />, badge: user.savedTours.length },
        { href: "/dashboard/documents", label: "Documents", icon: <FolderOpen /> },
        { href: "/dashboard/payments", label: "Payments", icon: <CreditCard /> },
        { href: "/dashboard/messages", label: "Messages", icon: <MessageSquare />, badge: openTickets },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/dashboard/profile", label: "Profile", icon: <UserIcon /> },
        { href: "/dashboard/settings", label: "Settings", icon: <Settings /> },
      ],
    },
  ];

  return (
    <>
      <AppShell
        sections={sections}
        logoHref="/"
        onSearch={() => setSearch(true)}
        searchLabel="Search tours, visas…"
        bottomNav={[
          { href: "/dashboard", label: "Home", icon: <Home />, exact: true },
          { href: "/dashboard/bookings", label: "Bookings", icon: <CalendarCheck /> },
          { href: "/dashboard/visa", label: "Visa", icon: <FileCheck2 /> },
          { href: "/dashboard/messages", label: "Messages", icon: <MessageSquare /> },
          { href: "/dashboard/profile", label: "Profile", icon: <UserIcon /> },
        ]}
        sidebarFooter={
          <div className="rounded-xl bg-primary p-4 text-white">
            <p className="text-sm font-semibold">Need help on the road?</p>
            <p className="mt-1 text-xs text-white/70">Our team is available 24/7.</p>
            <ButtonLink href="/dashboard/messages?new=1" size="sm" variant="accent" className="mt-3 w-full">
              Contact support
            </ButtonLink>
          </div>
        }
        headerRight={
          <>
            <NotificationBell audience="customer" />
            <Dropdown
              label="Account menu"
              trigger={
                <span className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100">
                  <Avatar src={user.avatar} name={user.name} size={32} />
                  <span className="hidden text-sm font-medium sm:block">{user.name}</span>
                </span>
              }
              items={[
                { label: "Back to website", icon: <Home />, onClick: () => router.push("/") },
                { label: "Profile", icon: <UserIcon />, onClick: () => router.push("/dashboard/profile") },
                { label: "Settings", icon: <Settings />, onClick: () => router.push("/dashboard/settings") },
                { divider: true, label: "" },
                { label: "Log out", icon: <LogOut />, danger: true, onClick: () => (actions.logout(), router.push("/login")) },
              ]}
            />
          </>
        }
      >
        {children}
      </AppShell>
      <SiteSearch open={search} onClose={() => setSearch(false)} />
    </>
  );
}
