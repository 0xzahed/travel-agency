"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useStore } from "@/lib/store";
import type { BlogCategory, BlogPost } from "@/lib/types";
import { cn, formatDate, img } from "@/lib/utils";
import { Avatar } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { EmptyState } from "@/components/ui/states";
import { Reveal } from "@/components/ui/widgets";

const CATS: ("All" | BlogCategory)[] = ["All", "Travel Tips", "Visa Guide", "Destinations", "Travel Safety", "Budget Travel", "Hotels", "News"];

export function BlogCard({ p, className }: { p: BlogPost; className?: string }) {
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-200">
        <Image src={img(p.image, 900)} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-primary backdrop-blur">{p.category}</span>
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <h3 className="text-lg font-bold leading-snug">
          <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 group-hover:text-primary">
            {p.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{p.excerpt}</p>
        <div className="mt-auto flex items-center gap-3 pt-5 text-sm">
          <Avatar src={p.author.avatar} name={p.author.name} size={32} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{p.author.name}</p>
            <p className="text-xs text-muted">
              {formatDate(p.date)} · {p.readTime} min read
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-secondary">
            Read More <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function BlogIndex() {
  const { state } = useStore();
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const posts = state.blog.filter((b) => b.published);
  const list = posts.filter((p) => cat === "All" || p.category === cat);
  const [feature, ...rest] = list;

  return (
    <>
      <Tabs className="mt-10" value={cat} onChange={setCat} tabs={CATS.map((c) => ({ value: c, label: c }))} />
      {!feature ? (
        <EmptyState icon={<BookOpen />} title="No articles in this category yet" description="We're writing new guides every week — check back soon." />
      ) : (
        <>
          {cat === "All" && (
            <Link href={`/blog/${feature.slug}`} className="group mt-10 grid overflow-hidden rounded-3xl border border-line bg-white md:grid-cols-2">
              <div className="relative aspect-[16/10] md:aspect-auto">
                <Image src={img(feature.image, 1400)} alt="" fill priority sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              </div>
              <div className="flex flex-col justify-center p-7 md:p-12">
                <p className="text-sm font-semibold text-secondary">Featured · {feature.category}</p>
                <h2 className="mt-3 text-2xl font-bold leading-tight group-hover:text-primary md:text-3xl">{feature.title}</h2>
                <p className="mt-3 leading-relaxed text-muted">{feature.excerpt}</p>
                <div className="mt-6 flex items-center gap-3 text-sm">
                  <Avatar src={feature.author.avatar} name={feature.author.name} size={36} />
                  <div>
                    <p className="font-medium">{feature.author.name}</p>
                    <p className="text-xs text-muted">
                      {formatDate(feature.date)} · {feature.readTime} min read
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )}
          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {(cat === "All" ? rest : list).map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.05}>
                <BlogCard p={p} />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </>
  );
}
