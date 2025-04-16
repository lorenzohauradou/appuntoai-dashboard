import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ListChecks, Brain, Rocket, Layout, Share2 } from "lucide-react"

export function FeaturesSection() {
  return (
    <section id="funzionalita" className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Funzionalità principali</h2>
          <p className="mb-12 text-xl text-muted-foreground">
            Lavora con l'AI al tuo fianco, in ogni fase del percorso
          </p>
        </div>

        <div className="mx-auto grid max-w-[1200px] gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <Clock className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Risparmia tempo</CardTitle>
              <CardDescription>Concentrati su ciò che conta davvero</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lascia che l'AI gestisca il lavoro noioso di organizzare i tuoi appunti, così puoi dedicare il tuo tempo
                ad attività ad alto impatto.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <ListChecks className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Ottieni di più</CardTitle>
              <CardDescription>Aumenta la tua produttività</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cattura rapidamente i pensieri, resta in cima al tuo carico di lavoro e muoviti attraverso le attività
                con maggiore efficienza.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Brain className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Lavora in modo intelligente</CardTitle>
              <CardDescription>Organizzazione senza sforzo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sfrutta l'AI per un'organizzazione senza sforzo. Appuntoai rende facile rimanere produttivi ed
                efficienti senza il fastidio di prendere appunti manualmente.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Rocket className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Resta in vantaggio</CardTitle>
              <CardDescription>Non rimanere indietro</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Resta competitivo in un mondo guidato dall'AI. Usare l'AI non è opzionale, è essenziale. Mantieni il
                passo con gli strumenti moderni per mantenere il tuo vantaggio.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Layout className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Resta organizzato</CardTitle>
              <CardDescription>Trasforma il caos in chiarezza</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Con modelli personalizzabili e strutturazione automatica, Appuntoai assicura che ogni pensiero e idea
                sia esattamente dove ne hai bisogno.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Share2 className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Non perdere nulla</CardTitle>
              <CardDescription>Cattura ogni dettaglio importante</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cattura ogni idea, ogni dettaglio. Appuntoai ti aiuta a evitare il sovraccarico di informazioni
                mantenendo tutti i tuoi pensieri organizzati e accessibili quando ne hai bisogno.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
