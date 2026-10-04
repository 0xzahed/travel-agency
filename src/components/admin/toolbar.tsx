"use client";

import { useState } from "react";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Drawer } from "@/components/ui/overlay";

/** Search + filters row. Filters collapse into a bottom sheet on mobile. */
export function Toolbar({
  query,
  onQuery,
  placeholder = "Search…",
  filters,
  activeFilters = 0,
  onExport,
  onClear,
}: {
  query: string;
  onQuery: (v: string) => void;
  placeholder?: string;
  filters?: React.ReactNode;
  activeFilters?: number;
  onExport?: () => void;
  onClear?: () => void;
}) {
  const [sheet, setSheet] = useState(false);
  return (
    <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center">
      <Input icon={<Search />} placeholder={placeholder} value={query} onChange={(e) => onQuery(e.target.value)} aria-label={placeholder} wrapperClassName="md:w-72" />
      {filters && <div className="hidden flex-1 flex-wrap items-center gap-2 md:flex [&_select]:h-10">{filters}</div>}
      <div className="flex gap-2 md:ml-auto">
        {filters && (
          <Button variant="outline" className="flex-1 md:hidden" onClick={() => setSheet(true)}>
            <SlidersHorizontal /> Filters {activeFilters > 0 && <span className="rounded-full bg-primary px-1.5 text-[11px] text-white">{activeFilters}</span>}
          </Button>
        )}
        {onClear && activeFilters > 0 && (
          <Button variant="ghost" className="hidden md:inline-flex" onClick={onClear}>
            Clear
          </Button>
        )}
        {onExport && (
          <Button variant="outline" className="flex-1 md:flex-none" onClick={onExport}>
            <Download /> Export
          </Button>
        )}
      </div>
      {filters && (
        <Drawer open={sheet} onClose={() => setSheet(false)} side="bottom" title="Filters" footer={<Button className="w-full" onClick={() => setSheet(false)}>Apply filters</Button>}>
          <div className="flex flex-col gap-4 [&_select]:w-full">{filters}</div>
          {onClear && (
            <Button variant="ghost" className="mt-4 w-full" onClick={onClear}>
              Clear all
            </Button>
          )}
        </Drawer>
      )}
    </div>
  );
}
