"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, MessageSquare } from "lucide-react"
import Link from "next/link"
import { loadStripe } from '@stripe/stripe-js';
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
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
  console.log("handleSubscription chiamato per piano:", plan, "Stato Sessione:", sessionStatus);

  setLoading(true);

  if (sessionStatus !== 'authenticated') {
      console.log("Utente non autenticato, mostro toast (sonner).");
      toast.error("Autenticazione Richiesta", {
          description: "Accedi o registrati per poter sottoscrivere un piano.",
          action: {
              label: "Accedi",
              onClick: () => router.push('/login'),
          },
      });
      setLoading(false);
      console.log("handleSubscription terminato (non autenticato).");
      return;
  }

  console.log("Utente autenticato, controllo Stripe Promise...");

  if (!stripePromise) {
    console.error('Chiave pubblicabile Stripe non configurata.');
    toast.error("Errore Configurazione", {
         description: "Il sistema di pagamento non è configurato correttamente."
    });
    setLoading(false);
    console.log("handleSubscription terminato (Stripe non configurato).");
    return;
  }

  console.log("Stripe configurato, avvio fetch a /api/create-checkout-session...");

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });
    console.log("Fetch completata, status:", response.status);

    const data = await response.json();
    console.log("Dati ricevuti dalla API:", data);

    if (response.ok && data.url) {
      console.log("Risposta OK, reindirizzo a:", data.url);
      window.location.href = data.url;
    } else {
      console.error('Errore dalla API:', data.error || 'Errore sconosciuto', "Status:", response.status);
      if (response.status === 401) {
           console.log("Errore 401 ricevuto, mostro toast autenticazione.");
           toast.error("Errore Autenticazione", {
               description: data.error || "Sessione scaduta. Effettua nuovamente l'accesso.",
               action: {
                   label: "Accedi",
                   onClick: () => router.push('/login'),
               },
           });
      } else {
          console.log("Errore generico pagamento, mostro toast.");
          toast.error("Errore Pagamento", {
              description: `Errore: ${data.error || 'Riprova più tardi.'}`
          });
      }
      setLoading(false);
    }
  } catch (error) {
    console.error('Errore durante la chiamata API (catch):', error);
    toast.error("Errore di Rete", {
        description: 'Si è verificato un errore di rete. Riprova più tardi.'
    });
    setLoading(false);
  }
  console.log("Fine esecuzione handleSubscription (se non reindirizzato).");
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
                  <span className="text-sm">Analisi base (Task, Decisioni, Temi)</span>
                </li>
                <li className="flex items-start gap-2 font-medium text-muted-foreground/80">
                  <MessageSquare className="mt-1 h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
                  <span className="text-sm">Chatta con il contenuto (3 chat/mese)</span>
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
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                14€
                <span className="ml-1 text-lg font-medium text-muted-foreground">/ mese</span>
              </div>
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
                  <span className="text-sm">Video / audio fino a 500 MB per report</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Analisi base (Task, Decisioni, Temi)</span>
                </li>
                <li className="flex items-start gap-2 font-medium text-primary">
                  <MessageSquare className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Chatta con il contenuto (30 chat/mese)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Esportazione in PDF e TXT</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Supporto prioritario</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSubscription('pro', setIsLoadingPro, sessionStatus, router)}
                disabled={isLoadingPro || !stripePromise}
              >
                {isLoadingPro ? 'Caricamento...' : 'Scegli Pro'}
              </Button>
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
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                29€
                <span className="ml-1 text-lg font-medium text-muted-foreground">/ mese</span>
              </div>
              <CardDescription className="mt-4 h-10">Per team e organizzazioni</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">80 report al mese</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Video / audio fino a 7 GB per report</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Tutte le funzionalità Pro</span>
                </li>
                <li className="flex items-start gap-2 font-medium text-primary">
                  <MessageSquare className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Chat illimitata con i contenuti</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Funzionalità aggiuntive:</span>
                </li>
                <li className="flex items-start gap-2 pl-6">
                  <Check className="mt-1 h-3 w-3 text-primary flex-shrink-0" />
                  <span className="text-xs">Trascrizione grezza per ogni report</span>
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
