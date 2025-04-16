import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, School, Presentation, Headphones, Video } from "lucide-react"

export function ForWhoSection() {
  return (
    <section id="casi-uso" className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Per chi è pensato</h2>
          <p className="mb-12 text-xl text-muted-foreground">
            Appuntoai è utile in molti contesti professionali e educativi
          </p>
        </div>

        <div className="mx-auto grid max-w-[1200px] gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <Briefcase className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Professionisti</CardTitle>
              <CardDescription>Manager, consulenti, liberi professionisti</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Trasforma le tue riunioni di lavoro in azioni concrete. Cattura ogni decisione importante e assegna task
                con scadenze precise.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <School className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Studenti</CardTitle>
              <CardDescription>Universitari e ricercatori</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Trasforma le lezioni e i seminari in appunti strutturati. Concentrati sul comprendere invece che sul
                trascrivere freneticamente.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Presentation className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Team di progetto</CardTitle>
              <CardDescription>Project manager e membri del team</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mantieni tutti sulla stessa pagina con riassunti chiari delle riunioni di progetto. Traccia le decisioni
                e i compiti assegnati.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Headphones className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Podcaster</CardTitle>
              <CardDescription>Creatori di contenuti audio</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Trasforma i tuoi podcast in articoli, post di blog o newsletter. Estrai i punti chiave per i tuoi
                ascoltatori.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Video className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Videomaker</CardTitle>
              <CardDescription>YouTuber e creatori di video</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Genera trascrizioni accurate dei tuoi video. Crea sottotitoli e descrizioni dettagliate per migliorare
                la SEO.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Users className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Organizzazioni</CardTitle>
              <CardDescription>Aziende di ogni dimensione</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Standardizza il processo di documentazione delle riunioni. Integra Appuntoai nei tuoi flussi di lavoro
                esistenti.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
