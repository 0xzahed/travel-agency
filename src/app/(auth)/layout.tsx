import Image from "next/image";
import { Star } from "lucide-react";
import { img } from "@/lib/utils";
import { IMG } from "@/lib/data/images";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-10 lg:px-16">
        <Logo />
        <main id="main" className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </main>
        <p className="text-xs text-muted">© {new Date().getFullYear()} Voyara Travel Ltd. · Protected by industry-standard encryption.</p>
      </div>
      <div className="relative hidden lg:block">
        <Image src={img(IMG.santoriniView, 1600)} alt="Whitewashed houses overlooking the Aegean Sea" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
        <figure className="absolute inset-x-12 bottom-12 text-white">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="size-4 fill-accent text-accent" />
            ))}
          </div>
          <blockquote className="mt-4 text-2xl font-semibold leading-snug">“Booking, visa and every transfer in one place. It&apos;s the first trip where I didn&apos;t have a single spreadsheet.”</blockquote>
          <figcaption className="mt-4 text-sm text-white/75">Amira Haddad — Paris & Swiss Alps, 2026</figcaption>
        </figure>
      </div>
    </div>
  );
}
