import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

export function PricingSection() {
  return (
    <section id="prezzi" className="bg-slate-50 py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Piani flessibili per ogni esigenza</h2>
          <p className="mb-12 text-xl text-muted-foreground">Scegli il piano che meglio si adatta alle tue necessità</p>
        </div>

        <div className="mx-auto grid max-w-[1200px] gap-6 md:grid-cols-3">
          <Card className="flex flex-col border-2">
            <CardHeader>
              <CardTitle>Freemium</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">Gratis</div>
              <CardDescription className="mt-4">Ideale per provare il servizio</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">3 report al mese</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">Trascrizione fino a 30 minuti</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">Esportazione in PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">Supporto email</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full bg-primary text-white hover:bg-primary/90">Inizia gratis</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border-2 border-primary">
            <CardHeader>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Più popolare
              </div>
              <CardTitle className="mt-4">A consumo</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                15€
                <span className="ml-1 text-lg font-medium text-muted-foreground">/ 10 riunioni</span>
              </div>
              <CardDescription className="mt-4">Perfetto per uso occasionale</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">10 report</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">Trascrizione fino a 2 ore</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">Esportazione in tutti i formati</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">Supporto prioritario</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">Integrazione con altre app</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full bg-primary text-white hover:bg-primary/90">Acquista ora</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border-2">
            <CardHeader>
              <CardTitle>API white-label</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">Contattaci</div>
              <CardDescription className="mt-4">Per agenzie e piattaforme</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">Utilizzo illimitato</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">API completa</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">Personalizzazione completa</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">Supporto dedicato</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm">SLA garantito</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/contatti" className="w-full">
                <Button variant="outline" className="w-full">
                  Contattaci
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
