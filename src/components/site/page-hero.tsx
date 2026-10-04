import Image from "next/image";
import { img } from "@/lib/utils";

export function PageHero({ image, eyebrow, title, description, children, alt = "" }: { image: string; eyebrow?: string; title: string; description?: string; children?: React.ReactNode; alt?: string }) {
  return (
    <section className="relative isolate overflow-hidden">
      <Image src={img(image, 2000)} alt={alt} fill priority sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/60 via-primary/50 to-primary/80" />
      <div className="container-x pb-16 pt-36 md:pb-24 md:pt-44">
        {eyebrow && <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>}
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-6xl">{title}</h1>
        {description && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">{description}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
