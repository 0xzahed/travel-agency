"use client";

import { Link2 } from "lucide-react";
import { FacebookIcon, LinkedinIcon, XIcon } from "@/components/shared/brand-icons";
import { useToast } from "@/components/ui/toast";

export function ShareButtons({ title }: { title: string }) {
  const toast = useToast();
  const share = (base: string) => {
    const url = encodeURIComponent(window.location.href);
    window.open(`${base}${url}&text=${encodeURIComponent(title)}`, "_blank", "noopener,width=600,height=500");
  };
  const btn = "grid size-9 place-items-center rounded-full border border-line bg-white text-slate-600 transition-colors hover:border-primary hover:text-primary";
  return (
    <div className="flex gap-2">
      <button className={btn} aria-label="Share on X" onClick={() => share("https://twitter.com/intent/tweet?url=")}>
        <XIcon className="size-4" />
      </button>
      <button className={btn} aria-label="Share on Facebook" onClick={() => share("https://www.facebook.com/sharer/sharer.php?u=")}>
        <FacebookIcon className="size-4" />
      </button>
      <button className={btn} aria-label="Share on LinkedIn" onClick={() => share("https://www.linkedin.com/sharing/share-offsite/?url=")}>
        <LinkedinIcon className="size-4" />
      </button>
      <button
        className={btn}
        aria-label="Copy link"
        onClick={() => {
          navigator.clipboard?.writeText(window.location.href);
          toast({ title: "Link copied" });
        }}
      >
        <Link2 className="size-4" />
      </button>
    </div>
  );
}
