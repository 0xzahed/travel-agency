import Image from "next/image";
import { Star } from "lucide-react";
import { img } from "@/lib/utils";
import { IMG } from "@/lib/data/images";
import { ButtonLink } from "@/components/ui/button";
import { HeroSearch } from "@/components/site/hero-search";
import { CtaBand, FaqSection, FeaturedTours, PopularDestinations, PromoBanner, Testimonials, TrustBar, VisaPromo } from "@/components/site/sections";

export default function HomePage() {
  return (
    <>
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image src={img(IMG.maldivesVillas, 2200, 85)} alt="Aerial view of overwater villas in a turquoise lagoon" fill priority sizes="100vw" quality={85} className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/25 to-slate-950/60" />
        </div>
        <div className="container-x flex min-h-[640px] flex-col justify-end pb-10 pt-36 md:min-h-[760px] md:pb-16">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[13px] font-medium text-white backdrop-blur">
              <Star className="size-3.5 fill-accent text-accent" /> 4.9/5 from 12,400+ verified reviews
            </p>
            <h1 className="text-[44px] font-extrabold leading-[1.05] text-white sm:text-6xl md:text-7xl">Your Journey Starts Here.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">Discover unforgettable destinations, carefully designed tours, and hassle-free travel services.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/tours" variant="accent" size="lg">
                Explore Tours
              </ButtonLink>
              <ButtonLink href="/contact?topic=plan" variant="glass" size="lg">
                Plan My Trip
              </ButtonLink>
            </div>
          </div>
          <div className="mt-12 md:mt-16">
            <HeroSearch />
          </div>
        </div>
      </section>
      <PromoBanner placement="Homepage" />
      <TrustBar />
      <PopularDestinations />
      <FeaturedTours />
      <VisaPromo />
      <Testimonials />
      <FaqSection limit={6} />
      <CtaBand />
    </>
  );
}
