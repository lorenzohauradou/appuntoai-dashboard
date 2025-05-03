import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
          <div className="relative w-full max-w-[500px] rounded-xl border bg-white p-4 shadow-lg">
            <div className="rounded-lg bg-slate-50/60 p-4">
              <h3 className="mb-4 text-center text-lg font-medium">Demo interattiva</h3>
              
              <div className="mx-auto mb-6 h-1.5 w-full max-w-[250px] overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-1/3 rounded-full bg-primary"></div>
              </div>
              
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white/70 p-6">
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="mb-8 text-center">
                    <p className="text-sm text-muted-foreground">Limite: 01:00</p>
                    <p className="text-5xl font-bold tracking-tight">00:00</p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-6">
                    <Button size="icon" variant="outline" className="h-14 w-14 rounded-full border-2 shadow-sm">
                      <span className="sr-only">Play</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </Button>
                    
                    <Button size="icon" className="h-20 w-20 rounded-full bg-[#e84bbd] text-white hover:bg-[#e84bbd]/90 shadow-lg">
                      <span className="sr-only">Record</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-12 w-12"
                      >
                        <path d="M12 16c2.206 0 4-1.794 4-4V6c0-2.217-1.785-4.021-3.979-4.021a.933.933 0 0 0-.209.025A4.006 4.006 0 0 0 8 6v6c0 2.206 1.794 4 4 4z" />
                        <path d="M11 19.931V22h2v-2.069c3.939-.495 7-3.858 7-7.931h-2c0 3.309-2.691 6-6 6s-6-2.691-6-6H4c0 4.072 3.061 7.436 7 7.931z" />
                      </svg>
                    </Button>
                    
                    <Button size="icon" variant="outline" className="h-14 w-14 rounded-full border-2 shadow-sm">
                      <span className="sr-only">Delete</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                  
                  <Button className="mt-10 bg-[#7c3aed] text-white hover:bg-[#7c3aed]/90 px-10 rounded-full shadow-md">
                    Continua
                  </Button>
                  
                  <p className="mt-4 text-sm text-slate-500">
                    Prova! Clicca il microfono per iniziare a registrare
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
