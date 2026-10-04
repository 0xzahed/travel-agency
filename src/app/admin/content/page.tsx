"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { FAQ } from "@/lib/types";
import { IMG } from "@/lib/data/images";
import { company } from "@/lib/data/content";
import { useQueryTab } from "@/lib/use-query-tab";
import { formatDate, img } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Avatar, Card, CardHeader, PageHeader, Stars } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { Input, Select, Switch, Textarea } from "@/components/ui/field";
import { ConfirmDialog, Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";

const TABS = ["hero", "destinations", "tours", "blog", "faqs", "testimonials", "banners", "footer"] as const;

function Inner() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [tab, setTab] = useQueryTab("tab", TABS, "hero");
  const [hero, setHero] = useState({ heading: "Your Journey Starts Here.", sub: "Discover unforgettable destinations, carefully designed tours, and hassle-free travel services.", primary: "Explore Tours", secondary: "Plan My Trip", image: IMG.maldivesVillas as string });
  const [footer, setFooter] = useState({ phone: company.phone, email: company.email, address: company.address, tagline: "Premium tours, visa assistance and 24/7 travel support." });
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [delFaq, setDelFaq] = useState<FAQ | null>(null);

  return (
    <>
      <PageHeader
        title="Content"
        description="Manage what visitors see on the public website. Changes go live instantly."
        actions={
          <Link href="/" target="_blank" className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-line bg-white px-4 text-sm font-medium hover:bg-slate-50">
            <ExternalLink className="size-4" /> View site
          </Link>
        }
      />
      <Tabs className="mb-6" value={tab} onChange={setTab} tabs={TABS.map((t) => ({ value: t, label: t === "faqs" ? "FAQs" : t[0].toUpperCase() + t.slice(1) }))} />

      {tab === "hero" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader title="Homepage hero" />
            <div className="space-y-4 p-5">
              <Input label="Heading" value={hero.heading} onChange={(e) => setHero({ ...hero, heading: e.target.value })} />
              <Textarea label="Subheading" rows={2} value={hero.sub} onChange={(e) => setHero({ ...hero, sub: e.target.value })} className="min-h-0" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Primary CTA" value={hero.primary} onChange={(e) => setHero({ ...hero, primary: e.target.value })} />
                <Input label="Secondary CTA" value={hero.secondary} onChange={(e) => setHero({ ...hero, secondary: e.target.value })} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Background image</p>
                <div className="grid grid-cols-4 gap-2">
                  {[IMG.maldivesVillas, IMG.heroBeach, IMG.santoriniView, IMG.alpsClouds].map((id) => (
                    <button key={id} onClick={() => setHero({ ...hero, image: id })} aria-pressed={hero.image === id} className={`relative aspect-video overflow-hidden rounded-lg ${hero.image === id ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"}`}>
                      <Image src={img(id, 200)} alt="" fill sizes="120px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast({ title: "Hero updated", description: "Published to the homepage." })}>Save & publish</Button>
              </div>
            </div>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader title="Preview" />
            <div className="relative aspect-[16/10]">
              <Image src={img(hero.image, 1000)} alt="" fill sizes="600px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950/60" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <p className="font-display text-3xl font-extrabold leading-tight">{hero.heading}</p>
                <p className="mt-2 max-w-sm text-sm text-white/85">{hero.sub}</p>
                <div className="mt-4 flex gap-2">
                  <span className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-ink">{hero.primary}</span>
                  <span className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-semibold">{hero.secondary}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "destinations" && (
        <Card>
          <CardHeader title="Featured destinations" description="Toggle which destinations appear on the homepage" />
          <ul className="divide-y divide-line">
            {state.destinations.map((d) => (
              <li key={d.id} className="flex items-center gap-4 px-5 py-3">
                <div className="relative h-10 w-14 overflow-hidden rounded-lg">
                  <Image src={img(d.image, 160)} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted">{d.region}</p>
                </div>
                <Switch checked={d.featured} onChange={() => actions.toggleFeaturedDestination(d.id)} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "tours" && (
        <Card>
          <CardHeader title="Featured tour packages" description="Up to 6 featured, published tours appear on the homepage" />
          <ul className="divide-y divide-line">
            {state.tours.map((t) => (
              <li key={t.id} className="flex items-center gap-4 px-5 py-3">
                <div className="relative h-10 w-14 overflow-hidden rounded-lg">
                  <Image src={img(t.image, 160)} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted">{t.location}</p>
                </div>
                <StatusBadge status={t.status} />
                <Switch checked={t.featured} onChange={() => actions.toggleFeaturedTour(t.id)} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "blog" && (
        <Card>
          <CardHeader title="Blog posts" description={`${state.blog.filter((b) => b.published).length} published`} action={<Button size="sm" onClick={() => toast({ title: "Editor opens in the next release", tone: "info" })}><Plus /> New post</Button>} />
          <ul className="divide-y divide-line">
            {state.blog.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                <div className="relative h-12 w-16 overflow-hidden rounded-lg">
                  <Image src={img(b.image, 160)} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.title}</p>
                  <p className="text-xs text-muted">
                    {b.category} · {b.author.name} · {formatDate(b.date)}
                  </p>
                </div>
                <Badge tone={b.published ? "success" : "neutral"} dot>
                  {b.published ? "Published" : "Draft"}
                </Badge>
                <Switch checked={b.published} onChange={() => (actions.toggleBlog(b.id), toast({ title: b.published ? "Post unpublished" : "Post published" }))} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "faqs" && (
        <Card>
          <CardHeader title="FAQs" action={<Button size="sm" onClick={() => setFaq({ id: `F-${Date.now()}`, q: "", a: "", category: "General" })}><Plus /> Add FAQ</Button>} />
          <ul className="divide-y divide-line">
            {state.faqs.map((f) => (
              <li key={f.id} className="flex items-start gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{f.q}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{f.a}</p>
                </div>
                <Badge>{f.category}</Badge>
                <Button size="icon-sm" variant="ghost" aria-label="Edit FAQ" onClick={() => setFaq(f)}>
                  <Pencil />
                </Button>
                <Button size="icon-sm" variant="ghost" aria-label="Delete FAQ" onClick={() => setDelFaq(f)}>
                  <Trash2 className="text-danger" />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "testimonials" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.reviews.map((r) => (
            <Card key={r.id} className="flex flex-col p-5">
              <div className="flex items-center gap-3">
                <Avatar src={r.avatar} name={r.name} size={40} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted">{r.trip}</p>
                </div>
                <Stars value={r.rating} />
              </div>
              <p className="mt-3 flex-1 text-sm text-slate-700">“{r.text}”</p>
              <div className="mt-4 border-t border-line pt-3">
                <Switch label="Show on website" checked={r.published} onChange={() => actions.toggleReview(r.id)} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "banners" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.banners.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex items-center justify-between">
                <Badge tone="primary">{b.placement}</Badge>
                <Switch checked={b.active} onChange={() => (actions.toggleBanner(b.id), toast({ title: b.active ? "Banner hidden" : "Banner live", description: `${b.placement} page` }))} />
              </div>
              <div className="mt-4 rounded-xl border border-accent/30 bg-accent-50 p-4">
                <p className="font-semibold">{b.title}</p>
                <p className="mt-1 text-sm text-muted">{b.subtitle}</p>
                <p className="mt-2 text-sm font-semibold text-primary">{b.cta} →</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "footer" && (
        <Card className="max-w-3xl">
          <CardHeader title="Footer content" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Input label="Phone" value={footer.phone} onChange={(e) => setFooter({ ...footer, phone: e.target.value })} />
            <Input label="Email" value={footer.email} onChange={(e) => setFooter({ ...footer, email: e.target.value })} />
            <Input wrapperClassName="sm:col-span-2" label="Office address" value={footer.address} onChange={(e) => setFooter({ ...footer, address: e.target.value })} />
            <Textarea wrapperClassName="sm:col-span-2" label="Tagline" rows={2} value={footer.tagline} onChange={(e) => setFooter({ ...footer, tagline: e.target.value })} className="min-h-0" />
          </div>
          <div className="flex justify-end border-t border-line px-5 py-3">
            <Button onClick={() => toast({ title: "Footer updated" })}>Save</Button>
          </div>
        </Card>
      )}

      <Modal
        open={!!faq}
        onClose={() => setFaq(null)}
        title={faq && state.faqs.some((f) => f.id === faq.id) ? "Edit FAQ" : "Add FAQ"}
        footer={
          <>
            <Button variant="outline" onClick={() => setFaq(null)}>
              Cancel
            </Button>
            <Button disabled={!faq?.q.trim() || !faq?.a.trim()} onClick={() => (actions.upsertFaq(faq!), setFaq(null), toast({ title: "FAQ saved" }))}>
              Save
            </Button>
          </>
        }
      >
        {faq && (
          <div className="space-y-4">
            <Input label="Question" value={faq.q} onChange={(e) => setFaq({ ...faq, q: e.target.value })} />
            <Textarea label="Answer" rows={4} value={faq.a} onChange={(e) => setFaq({ ...faq, a: e.target.value })} />
            <Select label="Category" value={faq.category} onChange={(e) => setFaq({ ...faq, category: e.target.value })} options={["General", "Booking", "Visa", "Tours", "Payments"]} />
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!delFaq} onClose={() => setDelFaq(null)} tone="danger" title="Delete FAQ?" description={delFaq?.q} confirmLabel="Delete" onConfirm={() => (actions.deleteFaq(delFaq!.id), toast({ title: "FAQ deleted", tone: "info" }))} />
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
