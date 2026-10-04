import type { Metadata } from "next";
import { BlogIndex } from "./blog-index";

export const metadata: Metadata = { title: "Travel Guide", description: "Travel tips, visa guides and destination inspiration from our specialists." };

export default function BlogPage() {
  return (
    <div className="pb-24 pt-28 md:pt-36">
      <div className="container-x">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-secondary">Travel guide</p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">Stories, tips & visa guides</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">Practical advice from people who plan journeys for a living.</p>
        <BlogIndex />
      </div>
    </div>
  );
}
