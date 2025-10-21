"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Check, MessageSquare } from "lucide-react"
import Link from "next/link"
import { loadStripe } from '@stripe/stripe-js';
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

async function handleSubscription(
  plan: 'pro' | 'business',
  setLoading: (loading: boolean) => void,
  sessionStatus: string,
  router: ReturnType<typeof useRouter>
) {
  setLoading(true);

  if (sessionStatus !== 'authenticated') {
    toast.error("Autenticazione Richiesta", {
      description: "Accedi o registrati per poter sottoscrivere un piano.",
      action: {
        label: "Accedi",
        onClick: () => router.push('/login'),
      },
    });
    setLoading(false);
    return;
  }

  if (!stripePromise) {
    toast.error("Errore Configurazione", {
      description: "Il sistema di pagamento non è configurato correttamente."
    });
    setLoading(false);
    return;
  }

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });

    const data = await response.json();

    if (response.ok && data.url) {
      window.location.href = data.url;
    } else {
      console.error('Errore dalla API:', data.error || 'Errore sconosciuto', "Status:", response.status);
      if (response.status === 401) {
        toast.error("Errore Autenticazione", {
          description: data.error || "Sessione scaduta. Effettua nuovamente l'accesso.",
          action: {
            label: "Accedi",
            onClick: () => router.push('/login'),
          },
        });
      } else {
        toast.error("Errore Pagamento", {
          description: 'Errore: Riprova più tardi.'
        });
      }
      setLoading(false);
    }
  } catch (error) {
    toast.error("Errore di Rete", {
      description: 'Si è verificato un errore di rete. Riprova più tardi.'
    });
    setLoading(false);
  }
}

export function PricingSection() {
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const [isLoadingPro, setIsLoadingPro] = useState(false);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false);

  return (
    <section id="prezzi" className="bg-slate-50 py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Piani flessibili per ogni esigenza</h2>
          <p className="mb-12 text-xl text-muted-foreground">Scegli il piano mensile che meglio si adatta alle tue necessità</p>
        </div>

        <div className="mx-auto grid max-w-[1400px] gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="flex flex-col border-2">
            <CardHeader>
              <CardTitle>Gratis</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">€0</div>
              <CardDescription className="mt-4 h-10">Perfetto per provare il servizio</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm font-semibold">3 progetti / mese</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Analisi completa: Riassunto, Concetti Chiave, Argomenti</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Quiz illimitati per progetto</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Mappa Concettuale per progetto</span>
                </li>
                <li className="flex items-start gap-2 font-medium text-muted-foreground/80">
                  <MessageSquare className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Chat con il documento</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Limite upload: max 200MB per file</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Chat Globale con i tuoi progetti</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full">Inizia gratis</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border-2 border-primary">
            <CardHeader>
              <div className="flex justify-end">
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary -mt-2 -mr-2">
                  Più popolare
                </div>
              </div>
              <CardTitle className="mt-0">Premium</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                €6,99
                <span className="ml-1 text-lg font-medium text-muted-foreground">/ mese</span>
              </div>
              <CardDescription className="mt-4 h-10">Per studenti che studiano seriamente</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold">20 progetti / mese</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Upload più grandi: fino a 5GB per file</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Tutte le funzionalità del piano Gratis</span>
                </li>
                <li className="flex items-start gap-2 font-medium text-primary">
                  <MessageSquare className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold">Chat Globale ILLIMITATA con tutti i tuoi progetti</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Esportazione (Mappa Concettuale in PNG/PDF)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Feature AI avanzate (Crea testo d&apos;esame, Confronta lezioni)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Supporto prioritario</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full bg-primary text-white hover:bg-primary/90"
                onClick={() => handleSubscription('pro', setIsLoadingPro, sessionStatus, router)}
                disabled={isLoadingPro || !stripePromise}
              >
                {isLoadingPro ? 'Caricamento...' : 'Scegli Premium'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Piano annuale: €59/anno (risparmi 2 mesi)
              </p>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border-2">
            <CardHeader>
              <CardTitle>Business</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                €29
                <span className="ml-1 text-lg font-medium text-muted-foreground">/ mese</span>
              </div>
              <CardDescription className="mt-4 h-10">Per power user e piccoli team</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold">80 progetti / mese</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Video / audio fino a 7 GB per file</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Tutte le funzionalità Premium</span>
                </li>
                <li className="flex items-start gap-2 font-medium text-primary">
                  <MessageSquare className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Chat Globale illimitata con i contenuti</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Supporto Dedicato</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full bg-primary text-white hover:bg-primary/90"
                onClick={() => handleSubscription('business', setIsLoadingBusiness, sessionStatus, router)}
                disabled={isLoadingBusiness || !stripePromise}
              >
                {isLoadingBusiness ? 'Caricamento...' : 'Scegli Business'}
              </Button>
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
