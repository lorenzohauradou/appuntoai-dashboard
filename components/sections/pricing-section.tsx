"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, MessageSquare, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  return (
    <section id="prezzi" className="bg-slate-50 py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Piani flessibili per ogni esigenza</h2>
          <p className="mb-12 text-xl text-muted-foreground">Scegli il piano che meglio si adatta alle tue necessità</p>
          
          {/* Toggle per selezione mensile/annuale */}
          <div className="flex justify-center items-center mb-12">
            <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                  billingPeriod === "monthly" 
                    ? "bg-white shadow-sm text-primary" 
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                Mensile
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                  billingPeriod === "yearly" 
                    ? "bg-white shadow-sm text-primary" 
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                Annuale
              </button>
            </div>
            {billingPeriod === "yearly" && (
              <span className="ml-3 text-sm font-medium text-primary">Risparmia fino al 20%</span>
            )}
          </div>
        </div>

        <div className="mx-auto grid max-w-[1400px] gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="flex flex-col border-2">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">Gratis</div>
              <CardDescription className="mt-4 h-10">Ideale per provare il servizio</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">3 report al mese</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Trascrizione fino a 30 minuti</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Analisi base (Task, Decisioni, Temi)</span>
                </li>
                <li className="flex items-start gap-2 font-medium text-primary">
                  <MessageSquare className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Chatta con il documento (3 chat/mese)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Esportazione in PDF e TXT</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Supporto email</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full">Inizia gratis</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border-2">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              {billingPeriod === "monthly" ? (
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                  14€
                  <span className="ml-1 text-lg font-medium text-muted-foreground">/ mese</span>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Più economico
                    </div>
                    <span className="text-sm line-through text-muted-foreground">168€/anno</span>
                  </div>
                  <div className="flex items-baseline text-5xl font-extrabold">
                    134€
                    <span className="ml-1 text-lg font-medium text-muted-foreground">/ anno</span>
                  </div>
                  <div className="mt-1 text-sm text-primary font-medium">Risparmi 34€ (20%)</div>
                </div>
              )}
              <CardDescription className="mt-4 h-10">Per professionisti e uso regolare</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">30 report al mese</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Trascrizione fino a 120 minuti</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Analisi base (Task, Decisioni, Temi)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Esportazione in tutti i formati</span>
                </li>
                {billingPeriod === "yearly" && (
                  <li className="flex items-start gap-2 font-medium text-primary">
                    <Clock className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">Archivio esteso (12 mesi)</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Supporto prioritario</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full">Scegli Pro</Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground">
                Garanzia soddisfatti o rimborsati di 14 giorni
              </p>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border-2 border-primary">
            <CardHeader>
              <div className="flex justify-end">
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary -mt-2 -mr-2">
                  Più popolare
                </div>
              </div>
              <CardTitle className="mt-0">Business</CardTitle>
              {billingPeriod === "monthly" ? (
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                  29€
                  <span className="ml-1 text-lg font-medium text-muted-foreground">/ mese</span>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Più economico
                    </div>
                    <span className="text-sm line-through text-muted-foreground">348€/anno</span>
                  </div>
                  <div className="flex items-baseline text-5xl font-extrabold">
                    278€
                    <span className="ml-1 text-lg font-medium text-muted-foreground">/ anno</span>
                  </div>
                  <div className="mt-1 text-sm text-primary font-medium">Risparmi 70€ (20%)</div>
                </div>
              )}
              <CardDescription className="mt-4 h-10">Per team e analisi interattive</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">100 report al mese</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Trascrizione fino a 180 minuti</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Tutte le funzionalità Pro</span>
                </li>
                <li className="flex items-start gap-2 font-medium text-primary">
                  <MessageSquare className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Chat illimitata con i documenti</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Funzionalità collaborative:</span>
                </li>
                <li className="flex items-start gap-2 pl-6">
                  <Check className="mt-1 h-3 w-3 text-primary flex-shrink-0" />
                  <span className="text-xs">Condivisione team (fino a 5 membri)</span>
                </li>
                <li className="flex items-start gap-2 pl-6">
                  <Check className="mt-1 h-3 w-3 text-primary flex-shrink-0" />
                  <span className="text-xs">Workflow di approvazione</span>
                </li>
                {billingPeriod === "yearly" && (
                  <li className="flex items-start gap-2 font-medium text-primary">
                    <Clock className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">Archivio esteso (24 mesi)</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Supporto Dedicato</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Link href="/dashboard" className="w-full">
                <Button className="w-full bg-primary text-white hover:bg-primary/90">Scegli Business</Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground">
                Garanzia soddisfatti o rimborsati di 14 giorni
              </p>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border-2">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">Custom</div>
              <CardDescription className="mt-4 h-10">Per agenzie e soluzioni su misura</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Volumi personalizzati</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Accesso API completo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Opzioni White-label</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Personalizzazioni avanzate</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Funzionalità collaborative illimitate</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Supporto dedicato e SLA</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Link href="/contatti" className="w-full">
                <Button variant="outline" className="w-full">
                  Contattaci
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground">
                Soluzioni personalizzate in base alle tue esigenze
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
