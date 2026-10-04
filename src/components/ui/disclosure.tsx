"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Accordion ─────────────────────────────────────────── */

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  open: controlled,
  onToggle,
  className,
  headerClassName,
  leading,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: () => void;
  className?: string;
  headerClassName?: string;
  leading?: React.ReactNode;
}) {
  const [inner, setInner] = useState(defaultOpen);
  const open = controlled ?? inner;
  const id = useId();
  return (
    <div className={cn("border-b border-line last:border-0", className)}>
      <h3 className="m-0 font-sans tracking-normal">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => (onToggle ? onToggle() : setInner(!inner))}
          className={cn("flex w-full items-center gap-3 py-4 text-left text-[15px] font-semibold text-ink hover:text-primary", headerClassName)}
        >
          {leading}
          <span className="flex-1">{title}</span>
          <ChevronDown className={cn("size-5 shrink-0 text-muted transition-transform duration-200", open && "rotate-180")} aria-hidden />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Tabs ──────────────────────────────────────────────── */

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
  variant = "underline",
  size = "md",
}: {
  tabs: { value: T; label: React.ReactNode; count?: number; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  variant?: "underline" | "pill";
  size?: "sm" | "md";
}) {
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    onChange(tabs[next].value);
    (e.currentTarget.parentElement?.children[next] as HTMLElement)?.focus();
  };
  return (
    <div
      role="tablist"
      className={cn(
        "scrollbar-none flex overflow-x-auto",
        variant === "underline" ? "gap-6 border-b border-line" : "gap-1 rounded-xl bg-slate-100 p-1",
        className,
      )}
    >
      {tabs.map((t, i) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onKeyDown={(e) => onKeyDown(e, i)}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 whitespace-nowrap font-medium transition-colors [&_svg]:size-4",
              size === "sm" ? "text-[13px]" : "text-sm",
              variant === "underline"
                ? cn("pb-3 pt-1", active ? "text-primary" : "text-muted hover:text-ink")
                : cn("rounded-lg px-3.5 py-2", active ? "bg-white text-primary shadow-sm" : "text-muted hover:text-ink"),
            )}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && (
              <span className={cn("rounded-full px-1.5 py-px text-[11px] tabular-nums", active ? "bg-primary text-white" : "bg-slate-200 text-slate-600")}>{t.count}</span>
            )}
            {variant === "underline" && active && <motion.span layoutId={`tab-underline-${tabs.map((x) => x.value).join()}`} className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}

/* ── Dropdown menu ─────────────────────────────────────── */

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  divider?: boolean;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
  className,
  label = "Open menu",
}: {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const focusItem = (dir: 1 | -1) => {
    const els = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const i = els.indexOf(document.activeElement as HTMLElement);
    els[(i + dir + els.length) % els.length]?.focus();
  };

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setTimeout(() => focusItem(1), 20);
          }
        }}
        className="inline-flex"
      >
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                focusItem(1);
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                focusItem(-1);
              }
            }}
            className={cn("absolute z-50 mt-1.5 min-w-48 overflow-hidden rounded-xl border border-line bg-white p-1 shadow-[var(--shadow-lift)]", align === "right" ? "right-0" : "left-0")}
          >
            {items.map((it, i) =>
              it.divider ? (
                <div key={i} className="my-1 h-px bg-line" role="separator" />
              ) : it.href ? (
                <a key={i} role="menuitem" href={it.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 focus:bg-slate-50 focus:outline-none [&_svg]:size-4 [&_svg]:text-muted", it.danger ? "text-danger" : "text-ink")}>
                  {it.icon}
                  {it.label}
                </a>
              ) : (
                <button
                  key={i}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    it.onClick?.();
                  }}
                  className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 focus:bg-slate-50 focus:outline-none [&_svg]:size-4", it.danger ? "text-danger [&_svg]:text-danger" : "text-ink [&_svg]:text-muted")}
                >
                  {it.icon}
                  {it.label}
                </button>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
