"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CommandItem {
  id: string;
  label: string;
  sub?: string;
  icon?: React.ReactNode;
  href: string;
  keywords?: string;
}

export interface CommandGroup {
  label: string;
  items: CommandItem[];
}

export function CommandPalette({
  open,
  onClose,
  groups,
  placeholder = "Search…",
  suggestions,
}: {
  open: boolean;
  onClose: () => void;
  groups: CommandGroup[];
  placeholder?: string;
  suggestions?: CommandGroup[];
}) {
  if (typeof document === "undefined") return null;
  return createPortal(<AnimatePresence>{open && <PaletteBody key="palette" onClose={onClose} groups={groups} placeholder={placeholder} suggestions={suggestions} />}</AnimatePresence>, document.body);
}

/** Mounted only while open, so query and selection reset naturally on every open. */
function PaletteBody({ onClose, groups, placeholder, suggestions }: { onClose: () => void; groups: CommandGroup[]; placeholder: string; suggestions?: CommandGroup[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return suggestions ?? groups.map((g) => ({ ...g, items: g.items.slice(0, 4) }));
    return groups.map((g) => ({ ...g, items: g.items.filter((i) => `${i.label} ${i.sub ?? ""} ${i.keywords ?? ""} ${i.id}`.toLowerCase().includes(term)).slice(0, 6) })).filter((g) => g.items.length);
  }, [q, groups, suggestions]);
  const flat = results.flatMap((g) => g.items);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (item?: CommandItem) => {
    if (!item) return;
    onClose();
    router.push(item.href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[active]);
    } else if (e.key === "Escape") onClose();
  };

  let idx = -1;
  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center px-4 pt-[10vh]">
      <motion.div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.16 }}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
        onKeyDown={onKey}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            placeholder={placeholder}
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-slate-400"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-activedescendant={flat[active] ? `cmd-${flat[active].id}` : undefined}
          />
          <kbd className="hidden rounded-md border border-line bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-muted sm:block">ESC</kbd>
        </div>
        <div ref={listRef} id="cmd-list" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
          {flat.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <SearchX className="mb-3 size-8 text-slate-300" />
              <p className="text-sm font-medium">No results for “{q}”</p>
              <p className="mt-1 text-sm text-muted">Try a destination, booking ID or name.</p>
            </div>
          ) : (
            results.map((g) => (
              <div key={g.label} className="mb-1" role="group" aria-label={g.label}>
                <p className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.label}</p>
                {g.items.map((it) => {
                  idx++;
                  const i = idx;
                  return (
                    <button
                      key={it.id}
                      id={`cmd-${it.id}`}
                      role="option"
                      aria-selected={i === active}
                      data-index={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(it)}
                      className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left", i === active ? "bg-primary-50" : "")}
                    >
                      <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg [&_svg]:size-4", i === active ? "bg-white text-primary" : "bg-slate-100 text-muted")}>{it.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{it.label}</span>
                        {it.sub && <span className="block truncate text-xs text-muted">{it.sub}</span>}
                      </span>
                      {i === active && <CornerDownLeft className="size-4 text-muted" aria-hidden />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="hidden items-center gap-4 border-t border-line bg-slate-50/70 px-4 py-2.5 text-xs text-muted sm:flex">
          <span>
            <kbd className="font-sans">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="font-sans">↵</kbd> open
          </span>
          <span className="ml-auto">
            <kbd className="font-sans">Ctrl K</kbd> to toggle
          </span>
        </div>
      </motion.div>
    </div>
  );
}
