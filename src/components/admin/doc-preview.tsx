import { FileText } from "lucide-react";
import type { VisaDocument } from "@/lib/types";
import { initials } from "@/lib/utils";

/** Stylised mock preview — real files would render via a secure signed URL. */
export function DocPreview({ doc, name, passport, nationality }: { doc: VisaDocument; name: string; passport: string; nationality: string }) {
  if (doc.kind === "Photograph")
    return (
      <div className="grid h-full place-items-center bg-slate-100 p-6">
        <div className="grid aspect-[35/45] w-40 place-items-center rounded bg-white shadow-md">
          <div className="grid size-20 place-items-center rounded-full bg-gradient-to-b from-slate-300 to-slate-400 text-2xl font-bold text-white">{initials(name)}</div>
        </div>
      </div>
    );
  if (doc.kind === "Passport")
    return (
      <div className="grid h-full place-items-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-xl bg-gradient-to-br from-[#f3efe4] to-[#e6dfcc] p-5 shadow-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5b4a2a]">Passport · {nationality}</p>
          <div className="mt-4 flex gap-4">
            <div className="grid h-28 w-22 shrink-0 place-items-center rounded bg-gradient-to-b from-slate-300 to-slate-400 text-lg font-bold text-white">{initials(name)}</div>
            <dl className="grid flex-1 grid-cols-2 gap-x-3 gap-y-2 text-[11px] text-[#3d3220]">
              <div className="col-span-2">
                <dt className="opacity-60">Surname / Given names</dt>
                <dd className="font-semibold uppercase">{name}</dd>
              </div>
              <div>
                <dt className="opacity-60">Passport No.</dt>
                <dd className="font-mono font-semibold">{passport}</dd>
              </div>
              <div>
                <dt className="opacity-60">Nationality</dt>
                <dd className="font-semibold">{nationality}</dd>
              </div>
            </dl>
          </div>
          <p className="mt-4 break-all font-mono text-[10px] leading-tight text-[#3d3220]/80">
            P&lt;{nationality.slice(0, 3).toUpperCase()}{name.toUpperCase().replace(/ /g, "<<")}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
            <br />
            {passport}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
          </p>
        </div>
      </div>
    );
  return (
    <div className="grid h-full place-items-center bg-slate-100 p-6">
      <div className="w-full max-w-sm rounded-md bg-white p-6 shadow-md">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FileText className="size-4 text-secondary" /> {doc.kind}
        </div>
        <div className="mt-4 space-y-2" aria-hidden>
          {[90, 70, 85, 60, 95, 40, 80, 75].map((w, i) => (
            <div key={i} className="h-2 rounded bg-slate-200" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2" aria-hidden>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="h-2 rounded bg-slate-100" />
          ))}
        </div>
        <p className="mt-5 text-right text-[10px] text-muted">{doc.fileName}</p>
      </div>
    </div>
  );
}
