"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/overlay";
import { Logo } from "./logo";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  children?: { href: string; label: string; badge?: number }[];
  /** Exact match only (for index routes like /dashboard). */
  exact?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

function isActive(pathname: string, search: string, href: string, exact?: boolean) {
  const [path, query] = href.split("?");
  if (query) return pathname === path && search.includes(query);
  return exact ? pathname === path : pathname === path || pathname.startsWith(path + "/");
}

function SidebarNav({ sections, variant, onNavigate }: { sections: NavSection[]; variant: "light" | "dark"; onNavigate?: () => void }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const dark = variant === "dark";

  return (
    <nav aria-label="Sidebar" className="space-y-6">
      {sections.map((s, si) => (
        <div key={si}>
          {s.title && <p className={cn("mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider", dark ? "text-white/40" : "text-muted")}>{s.title}</p>}
          <ul className="space-y-0.5">
            {s.items.map((it) => {
              const active = isActive(pathname, search, it.href, it.exact) || !!it.children?.some((c) => isActive(pathname, search, c.href));
              const expanded = open[it.href] ?? active;
              const base = cn(
                "group flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors [&>svg]:size-[18px] [&>svg]:shrink-0",
                dark
                  ? active
                    ? "bg-white/10 text-white"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                  : active
                    ? "bg-primary-50 text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink",
              );
              return (
                <li key={it.href}>
                  {it.children ? (
                    <>
                      <button type="button" className={base} aria-expanded={expanded} onClick={() => setOpen({ ...open, [it.href]: !expanded })}>
                        {it.icon}
                        <span className="flex-1 text-left">{it.label}</span>
                        <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180", dark ? "text-white/40" : "text-slate-400")} />
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                            {it.children.map((c) => {
                              const queryHit = it.children!.some((x) => x.href.includes("?") && isActive(pathname, search, x.href));
                              const ca = c.href.includes("?") ? isActive(pathname, search, c.href) : pathname === c.href && !queryHit;
                              return (
                                <li key={c.href}>
                                  <Link
                                    href={c.href}
                                    onClick={onNavigate}
                                    aria-current={ca ? "page" : undefined}
                                    className={cn(
                                      "ml-[21px] flex items-center justify-between border-l py-2 pl-[22px] pr-3 text-[13px] transition-colors",
                                      dark ? (ca ? "border-accent text-white" : "border-white/10 text-white/55 hover:text-white") : ca ? "border-primary font-medium text-primary" : "border-line text-muted hover:text-ink",
                                    )}
                                  >
                                    {c.label}
                                    {!!c.badge && <span className={cn("rounded-full px-1.5 text-[11px] font-semibold", dark ? "bg-accent text-ink" : "bg-accent-50 text-accent-600")}>{c.badge}</span>}
                                  </Link>
                                </li>
                              );
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link href={it.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={base}>
                      {it.icon}
                      <span className="flex-1">{it.label}</span>
                      {!!it.badge && <span className={cn("rounded-full px-1.5 py-px text-[11px] font-semibold", dark ? "bg-accent text-ink" : "bg-accent text-ink")}>{it.badge}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AppShell({
  sections,
  variant = "light",
  logoHref,
  logoSuffix,
  headerRight,
  sidebarFooter,
  bottomNav,
  onSearch,
  searchLabel = "Search",
  children,
}: {
  sections: NavSection[];
  variant?: "light" | "dark";
  logoHref: string;
  logoSuffix?: string;
  headerRight: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  bottomNav?: { href: string; label: string; icon: React.ReactNode; exact?: boolean }[];
  onSearch?: () => void;
  searchLabel?: string;
  children: React.ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();
  const dark = variant === "dark";

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow">
        Skip to content
      </a>
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r lg:flex", dark ? "border-white/5 bg-[#0b2e38]" : "border-line bg-white")}>
        <div className="flex h-16 shrink-0 items-center px-5">
          <Logo href={logoHref} light={dark} suffix={logoSuffix} />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <Suspense>
            <SidebarNav sections={sections} variant={variant} />
          </Suspense>
        </div>
        {sidebarFooter && <div className={cn("border-t p-3", dark ? "border-white/10" : "border-line")}>{sidebarFooter}</div>}
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-md md:px-6">
          <button onClick={() => setDrawer(true)} className="grid size-10 place-items-center rounded-[10px] text-ink hover:bg-slate-100 lg:hidden" aria-label="Open navigation">
            <Menu className="size-5" />
          </button>
          <div className="lg:hidden">
            <Logo href={logoHref} />
          </div>
          {onSearch && (
            <button onClick={onSearch} className="ml-auto hidden h-10 w-full max-w-sm items-center gap-2.5 rounded-[10px] border border-line bg-slate-50 px-3 text-sm text-muted transition-colors hover:border-slate-300 md:flex lg:ml-0">
              <Search className="size-4" />
              <span className="flex-1 text-left">{searchLabel}</span>
              <kbd className="rounded border border-line bg-white px-1.5 py-0.5 text-[11px] font-medium">Ctrl K</kbd>
            </button>
          )}
          <div className="ml-auto flex items-center gap-1">
            {onSearch && (
              <button onClick={onSearch} className="grid size-10 place-items-center rounded-[10px] text-slate-600 hover:bg-slate-100 md:hidden" aria-label={searchLabel}>
                <Search className="size-[18px]" />
              </button>
            )}
            {headerRight}
          </div>
        </header>
        <main id="main" className={cn("px-4 py-6 md:px-8 md:py-8", bottomNav && "pb-28 lg:pb-8")}>
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>

      {bottomNav && (
        <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          {bottomNav.map((b) => {
            const active = b.exact ? pathname === b.href : pathname.startsWith(b.href);
            return (
              <Link key={b.href} href={b.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium [&_svg]:size-5", active ? "text-primary" : "text-muted")}>
                {b.icon}
                {b.label}
              </Link>
            );
          })}
        </nav>
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} side="left" title={<Logo href={logoHref} />} className={dark ? "bg-[#0b2e38] text-white [&_h2]:text-white" : undefined}>
        <Suspense>
          <SidebarNav sections={sections} variant={variant} onNavigate={() => setDrawer(false)} />
        </Suspense>
        {sidebarFooter && <div className="mt-6 border-t border-line pt-4">{sidebarFooter}</div>}
      </Drawer>
    </div>
  );
}
