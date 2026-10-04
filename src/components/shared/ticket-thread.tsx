"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react";
import type { SupportTicket } from "@/lib/types";
import { cn, formatDateTime, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Conversation view shared by customer messages and admin support. */
export function TicketThread({
  ticket,
  viewer,
  onSend,
  disabled,
}: {
  ticket: SupportTicket;
  viewer: "customer" | "agent";
  onSend: (text: string, attachment?: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<string>();
  const end = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [ticket.messages.length]);

  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim(), attachment);
    setText("");
    setAttachment(undefined);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-5" aria-live="polite">
        {ticket.messages.map((m) => {
          const mine = m.from === viewer;
          return (
            <div key={m.id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold", m.from === "agent" ? "bg-primary text-white" : "bg-accent-50 text-accent-600")}>{initials(m.author)}</span>
              <div className={cn("max-w-[80%]", mine && "text-right")}>
                <p className="mb-1 text-xs text-muted">
                  <span className="font-medium text-ink">{m.author}</span> · {formatDateTime(m.at)}
                </p>
                <div className={cn("inline-block rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed", mine ? "rounded-tr-sm bg-primary text-white" : "rounded-tl-sm border border-line bg-white text-ink")}>
                  {m.text}
                  {m.attachment && (
                    <span className={cn("mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs", mine ? "bg-white/15" : "bg-slate-100")}>
                      <Paperclip className="size-3.5" /> {m.attachment}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      {disabled ? (
        <p className="border-t border-line bg-slate-50 p-4 text-center text-sm text-muted">This ticket is {ticket.status.toLowerCase()}. Reply to reopen by creating a new ticket.</p>
      ) : (
        <div className="border-t border-line p-3">
          {attachment && (
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs">
              <Paperclip className="size-3.5" /> {attachment}
              <button onClick={() => setAttachment(undefined)} aria-label="Remove attachment">
                <X className="size-3.5" />
              </button>
            </span>
          )}
          <div className="flex items-end gap-2">
            <button onClick={() => fileRef.current?.click()} className="grid size-10 shrink-0 place-items-center rounded-[10px] text-muted hover:bg-slate-100 hover:text-ink" aria-label="Attach file">
              <Paperclip className="size-[18px]" />
            </button>
            <input ref={fileRef} type="file" className="sr-only" onChange={(e) => setAttachment(e.target.files?.[0]?.name)} />
            <label htmlFor={`reply-${ticket.id}`} className="sr-only">
              Reply
            </label>
            <textarea
              id={`reply-${ticket.id}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
              }}
              rows={1}
              placeholder="Write a reply…  (Ctrl+Enter to send)"
              className="max-h-40 min-h-10 flex-1 resize-none rounded-[10px] border border-line px-3.5 py-2.5 text-sm focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10"
            />
            <Button onClick={send} disabled={!text.trim()} size="icon" aria-label="Send reply">
              <Send />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
