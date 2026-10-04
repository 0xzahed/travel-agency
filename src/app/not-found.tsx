import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ErrorState } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";
import { ERRORS } from "@/components/shared/error-catalog";

export default function NotFound() {
  const e = ERRORS["404"];
  return (
    <>
      <Navbar />
      <main id="main" className="pt-28 md:pt-36">
        <ErrorState
          {...e}
          actions={
            <>
              <ButtonLink href="/">Back to home</ButtonLink>
              <ButtonLink href="/tours" variant="outline">
                Browse tours
              </ButtonLink>
              <ButtonLink href="/contact" variant="ghost">
                Contact support
              </ButtonLink>
            </>
          }
        />
      </main>
      <Footer />
    </>
  );
}
