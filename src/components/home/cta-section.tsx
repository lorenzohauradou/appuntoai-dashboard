import Link from "next/link"
import { Button } from "@/src/components/ui/button"

export function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-[800px] rounded-xl bg-primary p-8 text-center text-white md:p-12">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Pronto a smettere di prendere appunti manualmente?
          </h2>
          <p className="mb-8 text-xl text-primary-foreground/90">
            Unisciti a migliaia di professionisti che risparmiano tempo e lavorano in modo più intelligente con
            Appuntoai.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Prova Appuntoai gratis
            </Button>
          </Link>
          <p className="mt-4 text-sm text-primary-foreground/80">
            Nessuna carta di credito richiesta. Cancella quando vuoi.
          </p>
        </div>
      </div>
    </section>
  )
}
