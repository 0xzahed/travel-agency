import type { Metadata } from "next";
import { FaqSection } from "@/components/site/sections";

export const metadata: Metadata = { title: "Help Center & FAQ" };

export default function FaqPage() {
  return (
    <div className="pt-16 md:pt-[76px]">
      <FaqSection title="Help Center" />
    </div>
  );
}
