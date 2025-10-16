import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { InteractiveDemo } from "@/src/components/home/interactive-demo"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 z-0"></div>
      <div className="container relative z-10">
        <div className="absolute top-0 right-0 -mt-32 md:-mt-10 md:-mr-10 text-primary/10">
          <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80" cy="80" r="80" fill="currentColor" />
            <path d="M40 60H120M40 80H90M40 100H75" stroke="white" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Badge variant="outline" className="mb-4 rounded-full px-4 py-1 text-sm border-primary/20 bg-primary/5">
              <span className="mr-1 text-primary">✦</span> Prodotto del giorno
            </Badge>
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Riduci il rumore, <br />
              <span className="text-primary">aumenta il valore.</span>
            </h1>
            <p className="mb-8 max-w-[600px] text-xl text-muted-foreground">
              Ogni riunione contiene una montagna di informazioni. La nostra AI ti aiuta a estrarre solo i punti cruciali per il progresso del tuo progetto.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                  Prova Appuntoai gratis
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Utilizzato da migliaia di professionisti per risparmiare tempo e lavorare in modo più intelligente.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <p className="text-sm font-medium">In arrivo anche su iOS e Android</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="rounded-full">
                  🇮🇹 Italiano
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  🇬🇧 English
                </Badge>
              </div>
            </div>
          </div>
          <InteractiveDemo />
        </div>
      </div>
    </section>
  )
}
