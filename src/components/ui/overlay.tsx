"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function useOverlayBehaviour(open: boolean, onClose: () => void, panel: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])') ?? []);
    const t = setTimeout(() => {
      const auto = panel.current?.querySelector<HTMLElement>("[data-autofocus]");
      (auto ?? focusables()[0] ?? panel.current)?.focus();
    }, 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab") {
        const els = focusables();
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [open, onClose, panel]);
}

function Portal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  hideClose?: boolean;
}

const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl", full: "max-w-6xl" };

export function Modal({ open, onClose, title, description, children, footer, size = "md", className, hideClose }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  useOverlayBehaviour(open, onClose, panel);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
            <motion.div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose} aria-hidden />
            <motion.div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              aria-describedby={description ? descId : undefined}
              tabIndex={-1}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[18px] bg-white shadow-2xl outline-none sm:rounded-[18px]",
                sizes[size],
                className,
              )}
            >
              {(title || !hideClose) && (
                <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
                  <div>
                    {title && (
                      <h2 id={titleId} className="text-lg font-semibold text-ink">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p id={descId} className="mt-0.5 text-sm text-muted">
                        {description}
                      </p>
                    )}
                  </div>
                  {!hideClose && (
                    <button onClick={onClose} className="-mr-2 grid size-9 place-items-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink" aria-label="Close dialog">
                      <X className="size-5" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
              {footer && <div className="flex flex-col-reverse gap-2 border-t border-line bg-slate-50/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">{footer}</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "left" | "right" | "bottom";
  className?: string;
}

export function Drawer({ open, onClose, title, children, footer, side = "right", className }: DrawerProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlayBehaviour(open, onClose, panel);
  const variants = {
    left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
    right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
    bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
  }[side];

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100]">
            <motion.div className="absolute inset-0 bg-slate-950/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} aria-hidden />
            <motion.div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              tabIndex={-1}
              {...variants}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "absolute flex flex-col bg-white shadow-2xl outline-none",
                side === "left" && "inset-y-0 left-0 w-[86%] max-w-sm",
                side === "right" && "inset-y-0 right-0 w-[92%] max-w-md",
                side === "bottom" && "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[20px]",
                className,
              )}
            >
              {side === "bottom" && <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-slate-200" aria-hidden />}
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 id={titleId} className="text-base font-semibold">
                  {title}
                </h2>
                <button onClick={onClose} className="-mr-2 grid size-9 place-items-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink" aria-label="Close panel">
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
              {footer && <div className="border-t border-line px-5 py-4">{footer}</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "primary",
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: "primary" | "danger";
  children?: React.ReactNode;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="h-10 rounded-[10px] border border-line bg-white px-4 text-sm font-medium hover:bg-slate-50">
            Cancel
          </button>
          <button
            data-autofocus
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn("h-10 rounded-[10px] px-4 text-sm font-medium text-white", tone === "danger" ? "bg-danger hover:bg-red-700" : "bg-primary hover:bg-primary-700")}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {description && <p className="text-sm leading-relaxed text-muted">{description}</p>}
      {children}
    </Modal>
  );
}
