"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarCheck,
  Compass,
  CreditCard,
  ExternalLink,
  FileCheck2,
  FileText,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Receipt,
  RotateCcw,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { adminUsers, CURRENT_ADMIN_ID, roles } from "@/lib/data/people";
import { visaCountries } from "@/lib/data/visa";
import { formatMoney } from "@/lib/utils";
import { AppShell, type NavSection } from "@/components/shared/app-shell";
import { CommandPalette, type CommandGroup } from "@/components/shared/command-palette";
import { NotificationBell } from "@/components/shared/notification-center";
import { Dropdown } from "@/components/ui/disclosure";
import { Avatar } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { state, actions } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState(false);
  const me = adminUsers.find((a) => a.id === CURRENT_ADMIN_ID)!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const count = (pred: (b: (typeof state.bookings)[number]) => boolean) => state.bookings.filter(pred).length;
  const pendingVisa = state.visaApplications.filter((v) => ["Submitted", "Under Review"].includes(v.status)).length;
  const openTickets = state.tickets.filter((t) => ["Open", "Waiting"].includes(t.status)).length;
  const pendingDocs = state.visaApplications.flatMap((v) => v.documents).filter((d) => d.status === "Pending").length;

  const sections: NavSection[] = [
    { items: [{ href: "/admin", label: "Dashboard", icon: <LayoutDashboard />, exact: true }] },
    {
      title: "Operations",
      items: [
        {
          href: "/admin/tours",
          label: "Tours",
          icon: <Compass />,
          children: [
            { href: "/admin/tours", label: "All Tours" },
            { href: "/admin/tours/new", label: "Add Tour" },
            { href: "/admin/tours/categories", label: "Categories" },
            { href: "/admin/tours/destinations", label: "Destinations" },
          ],
        },
        {
          href: "/admin/bookings",
          label: "Bookings",
          icon: <CalendarCheck />,
          children: [
            { href: "/admin/bookings", label: "All Bookings" },
            { href: "/admin/bookings?status=Pending", label: "Pending", badge: count((b) => b.status === "Pending") },
            { href: "/admin/bookings?status=Confirmed", label: "Confirmed" },
            { href: "/admin/bookings?status=Cancelled", label: "Cancelled" },
            { href: "/admin/bookings?status=Completed", label: "Completed" },
          ],
        },
        {
          href: "/admin/visa",
          label: "Visa",
          icon: <FileCheck2 />,
          children: [
            { href: "/admin/visa", label: "Applications", badge: pendingVisa },
            { href: "/admin/visa/countries", label: "Countries" },
            { href: "/admin/visa/countries?tab=types", label: "Visa Types" },
            { href: "/admin/visa/documents", label: "Documents", badge: pendingDocs },
          ],
        },
        {
          href: "/admin/customers",
          label: "Customers",
          icon: <Users />,
          children: [
            { href: "/admin/customers", label: "All Customers" },
            { href: "/admin/customers/C-2001", label: "Customer Details" },
          ],
        },
        {
          href: "/admin/payments",
          label: "Payments",
          icon: <CreditCard />,
          children: [
            { href: "/admin/payments", label: "Transactions" },
            { href: "/admin/payments?tab=refunds", label: "Refunds" },
            { href: "/admin/reports?type=sales", label: "Payment Reports" },
          ],
        },
      ],
    },
    {
      title: "Engagement",
      items: [
        {
          href: "/admin/content",
          label: "Content",
          icon: <FileText />,
          children: [
            { href: "/admin/content?tab=blog", label: "Blog" },
            { href: "/admin/content?tab=testimonials", label: "Testimonials" },
            { href: "/admin/content?tab=faqs", label: "FAQs" },
            { href: "/admin/content?tab=banners", label: "Banners" },
          ],
        },
        {
          href: "/admin/support",
          label: "Support",
          icon: <LifeBuoy />,
          children: [
            { href: "/admin/support?view=messages", label: "Messages" },
            { href: "/admin/support", label: "Support Tickets", badge: openTickets },
          ],
        },
        {
          href: "/admin/reports",
          label: "Reports",
          icon: <BarChart3 />,
          children: [
            { href: "/admin/reports?type=sales", label: "Sales" },
            { href: "/admin/reports?type=bookings", label: "Bookings" },
            { href: "/admin/reports?type=visa", label: "Visa" },
            { href: "/admin/reports?type=customers", label: "Customers" },
          ],
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          href: "/admin/settings",
          label: "Settings",
          icon: <Settings />,
          children: [
            { href: "/admin/settings", label: "General" },
            { href: "/admin/settings/users", label: "Users" },
            { href: "/admin/settings/roles", label: "Roles" },
            { href: "/admin/settings/roles?tab=permissions", label: "Permissions" },
            { href: "/admin/settings?tab=notifications", label: "Notifications" },
          ],
        },
      ],
    },
  ];

  const groups = useMemo<CommandGroup[]>(
    () => [
      { label: "Customers", items: state.customers.map((c) => ({ id: c.id, label: c.name, sub: `${c.email} · ${c.id}`, icon: <User />, href: `/admin/customers/${c.id}`, keywords: c.phone })) },
      {
        label: "Bookings",
        items: state.bookings.map((b) => {
          const c = state.customers.find((x) => x.id === b.customerId);
          const t = state.tours.find((x) => x.id === b.tourId);
          return { id: b.id, label: b.id, sub: `${c?.name} · ${t?.title} · ${b.status}`, icon: <CalendarCheck />, href: `/admin/bookings/${b.id}`, keywords: `${c?.name} ${t?.title}` };
        }),
      },
      { label: "Tours", items: state.tours.map((t) => ({ id: t.id, label: t.title, sub: `${t.id} · ${t.location} · ${t.status}`, icon: <Compass />, href: `/admin/tours/${t.id}` })) },
      {
        label: "Visa applications",
        items: state.visaApplications.map((v) => ({ id: v.id, label: v.id, sub: `${v.applicant.fullName} · ${visaCountries.find((c) => c.id === v.countryId)?.name} · ${v.status}`, icon: <Globe />, href: `/admin/visa/${v.id}`, keywords: v.applicant.fullName })),
      },
      {
        label: "Transactions",
        items: state.payments.map((p) => ({ id: p.id, label: p.id, sub: `${formatMoney(p.amount)} · ${p.method} · ${p.status}`, icon: p.kind === "Refund" ? <RotateCcw /> : <Receipt />, href: `/admin/payments?q=${p.id}` })),
      },
    ],
    [state.customers, state.bookings, state.tours, state.visaApplications, state.payments],
  );

  return (
    <>
      <AppShell
        variant="dark"
        sections={sections}
        logoHref="/admin"
        logoSuffix="Admin"
        onSearch={() => setSearch(true)}
        searchLabel="Search customers, bookings, tours…"
        sidebarFooter={
          <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
            <Avatar src={me.avatar} name={me.name} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{me.name}</p>
              <p className="truncate text-xs text-white/50">{roles.find((r) => r.id === me.roleId)?.name}</p>
            </div>
          </div>
        }
        headerRight={
          <>
            <NotificationBell audience="admin" allHref="/admin/notifications" />
            <Dropdown
              label="Admin menu"
              trigger={
                <span className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100">
                  <Avatar src={me.avatar} name={me.name} size={32} />
                  <span className="hidden text-sm font-medium sm:block">{me.name}</span>
                </span>
              }
              items={[
                { label: "View website", icon: <ExternalLink />, onClick: () => router.push("/") },
                { label: "Customer portal", icon: <User />, onClick: () => router.push("/dashboard") },
                { label: "Settings", icon: <Settings />, onClick: () => router.push("/admin/settings") },
                {
                  label: "Reset demo data",
                  icon: <RotateCcw />,
                  onClick: () => {
                    actions.reset();
                    toast({ title: "Demo data reset", tone: "info" });
                  },
                },
                { divider: true, label: "" },
                { label: "Log out", icon: <LogOut />, danger: true, onClick: () => router.push("/login") },
              ]}
            />
          </>
        }
      >
        {children}
      </AppShell>
      <CommandPalette open={search} onClose={() => setSearch(false)} groups={groups} placeholder="Search customers, bookings, tours, visas, transactions…" />
    </>
  );
}
