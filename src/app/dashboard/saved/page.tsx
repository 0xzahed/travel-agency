"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Heart, MapPin, Trash2 } from "lucide-react";
import { useCurrentUser, useStore } from "@/lib/store";
import { formatMoney, img } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, PageHeader, Rating } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";

export default function SavedPage() {
  const { state, actions } = useStore();
  const user = useCurrentUser()!;
  const toast = useToast();
  const saved = user.savedTours.map((id) => state.tours.find((t) => t.id === id)).filter(Boolean) as typeof state.tours;

  return (
    <>
      <PageHeader title="Saved Tours" description={`${saved.length} tour${saved.length === 1 ? "" : "s"} on your wishlist`} />
      {saved.length === 0 ? (
        <Card>
          <EmptyState icon={<Heart />} title="No saved tours" description="Tap the heart on any tour to save it here for later." action={<ButtonLink href="/tours">Discover tours</ButtonLink>} />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {saved.map((t) => (
              <motion.article key={t.id} layout exit={{ opacity: 0, scale: 0.96 }} className="overflow-hidden rounded-2xl border border-line bg-white">
                <div className="relative aspect-[16/10]">
                  <Image src={img(t.image, 700)} alt={t.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between text-[13px] text-muted">
                    <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {t.country}</span>
                    <Rating value={t.rating} />
                  </div>
                  <h3 className="mt-1.5 text-lg font-bold">{t.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted"><Clock className="size-3.5" /> {t.days} days</p>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                    <p className="font-display text-xl font-bold text-primary">{formatMoney(t.price)}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${t.title}`}
                        onClick={() => {
                          actions.toggleSaved(t.id);
                          toast({ title: "Removed from saved tours", tone: "info" });
                        }}
                      >
                        <Trash2 className="text-danger" />
                      </Button>
                      <ButtonLink href={`/tours/${t.slug}`} size="sm">View Details</ButtonLink>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
      {saved.length > 0 && (
        <p className="mt-8 text-center text-sm text-muted">
          Prices change often — <Link href="/tours" className="font-medium text-secondary">browse more tours</Link>.
        </p>
      )}
    </>
  );
}
