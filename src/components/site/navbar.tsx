"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarCheck, ChevronRight, LayoutDashboard, LogOut, Menu, Search, Settings, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser, useStore } from "@/lib/store";
import { Logo } from "@/components/shared/logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { Drawer } from "@/components/ui/overlay";
import { Dropdown } from "@/components/ui/disclosure";
import { Avatar } from "@/components/ui/primitives";
import { SiteSearch } from "./site-search";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/tours", label: "Tours" },
  { href: "/destinations", label: "Destinations" },
  { href: "/visa", label: "Visa Services" },
  { href: "/blog", label: "Travel Guide" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const HERO_ROUTES = ["/", "/about", "/visa", "/destinations"];

export function Navbar() {
  const pathname = usePathname();
  const transparent = HERO_ROUTES.includes(pathname);
  const router = useRouter();
  const user = useCurrentUser();
  const { actions } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const solid = !transparent || scrolled;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow">
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,height,border-color] duration-300",
          solid ? "border-b border-line/80 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-md" : "border-b border-transparent bg-transparent",
        )}
      >
        <div className={cn("container-x flex items-center justify-between gap-6 transition-[height] duration-300", scrolled ? "h-16" : "h-[76px]")}>
          <Logo light={!solid} />

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive(n.href) ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
                  solid ? (isActive(n.href) ? "text-primary" : "text-slate-600 hover:text-ink") : isActive(n.href) ? "text-white" : "text-white/80 hover:text-white",
                )}
              >
                {n.label}
                {isActive(n.href) && <span className={cn("absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full", solid ? "bg-primary" : "bg-white")} />}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearch(true)}
              className={cn("grid size-10 place-items-center rounded-[10px] transition-colors", solid ? "text-slate-600 hover:bg-slate-100" : "text-white hover:bg-white/10")}
              aria-label="Search (Ctrl K)"
            >
              <Search className="size-[18px]" />
            </button>
            {user ? (
              <Dropdown
                label="Account menu"
                trigger={
                  <span className={cn("hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors sm:flex", solid ? "hover:bg-slate-100" : "hover:bg-white/10")}>
                    <Avatar src={user.avatar} name={user.name} size={32} />
                    <span className={cn("text-sm font-medium", solid ? "text-ink" : "text-white")}>{user.name.split(" ")[0]}</span>
                  </span>
                }
                items={[
                  { label: "Dashboard", icon: <LayoutDashboard />, onClick: () => router.push("/dashboard") },
                  { label: "My Bookings", icon: <CalendarCheck />, onClick: () => router.push("/dashboard/bookings") },
                  { label: "Profile", icon: <UserIcon />, onClick: () => router.push("/dashboard/profile") },
                  { label: "Admin Panel", icon: <Settings />, onClick: () => router.push("/admin") },
                  { divider: true, label: "" },
                  { label: "Log out", icon: <LogOut />, danger: true, onClick: () => (actions.logout(), router.push("/")) },
                ]}
              />
            ) : (
              <Link href="/login" className={cn("hidden rounded-[10px] px-3.5 py-2 text-sm font-medium transition-colors sm:inline-flex", solid ? "text-ink hover:bg-slate-100" : "text-white hover:bg-white/10")}>
                Log in
              </Link>
            )}
            <ButtonLink href="/contact?topic=plan" variant="accent" size="sm" className="ml-1 hidden md:inline-flex">
              Plan Your Trip
            </ButtonLink>
            <button
              onClick={() => setMenu(true)}
              className={cn("grid size-10 place-items-center rounded-[10px] lg:hidden", solid ? "text-ink hover:bg-slate-100" : "text-white hover:bg-white/10")}
              aria-label="Open menu"
              aria-expanded={menu}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <Drawer open={menu} onClose={() => setMenu(false)} side="right" title={<Logo />}>
        <nav aria-label="Mobile" className="-mx-2 flex flex-col">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMenu(false)}
              className={cn("flex items-center justify-between rounded-lg px-3 py-3.5 text-[15px] font-medium", isActive(n.href) ? "bg-primary-50 text-primary" : "text-ink hover:bg-slate-50")}
            >
              {n.label}
              <ChevronRight className="size-4 text-muted" />
            </Link>
          ))}
        </nav>
        <div className="mt-6 space-y-2 border-t border-line pt-6">
          {user ? (
            <>
              <div className="mb-4 flex items-center gap-3">
                <Avatar src={user.avatar} name={user.name} size={40} />
                <div>
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
              </div>
              <ButtonLink href="/dashboard" variant="outline" className="w-full" onClick={() => setMenu(false)}>
                <LayoutDashboard /> My Dashboard
              </ButtonLink>
            </>
          ) : (
            <ButtonLink href="/login" variant="outline" className="w-full" onClick={() => setMenu(false)}>
              Log in
            </ButtonLink>
          )}
          <ButtonLink href="/contact?topic=plan" variant="accent" className="w-full" onClick={() => setMenu(false)}>
            Plan Your Trip
          </ButtonLink>
          <Button variant="ghost" className="w-full" onClick={() => (setMenu(false), setSearch(true))}>
            <Search /> Search
          </Button>
        </div>
      </Drawer>

      <SiteSearch open={search} onClose={() => setSearch(false)} />
    </>
  );
}
