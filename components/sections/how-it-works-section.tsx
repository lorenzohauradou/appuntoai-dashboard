import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UploadCloud, BrainCircuit, Share2, CheckCircle2, FileAudio, FileVideo, FileText, Mic } from "lucide-react"

export function HowItWorksSection() {
  return (
    <section id="come-funziona" className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Come funziona</h2>
          <p className="mb-12 text-xl text-muted-foreground">
            Prendi appunti in pochi secondi, risparmia ore di lavoro
          </p>
        </div>

        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <Card className="flex flex-col">
            <CardHeader className="items-center text-center pb-4">
              <div className="mb-3 rounded-full bg-primary/10 p-3">
                <UploadCloud className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Registra o Carica</CardTitle>
              <CardDescription className="mt-2 px-2">
                Inserisci facilmente i tuoi contenuti audio, video o testuali.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 mt-2 pt-0 flex flex-col items-center">
              <ul className="space-y-2 text-sm text-muted-foreground text-center">
                <li className="hidden items-center gap-2">
                  <Mic className="h-4 w-4 text-primary/80 flex-shrink-0" />
                  <span>Registrazione Live</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileAudio className="h-4 w-4 text-primary/80 flex-shrink-0" />
                  <span>Upload File Audio</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileVideo className="h-4 w-4 text-primary/80 flex-shrink-0" />
                  <span>Upload File Video</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary/80 flex-shrink-0" />
                  <span>Incolla Testo</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="items-center text-center pb-4">
              <div className="mb-3 rounded-full bg-primary/10 p-3">
                <BrainCircuit className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Analisi Intelligente AI</CardTitle>
              <CardDescription className="mt-2 px-2">
                La nostra AI trascrive, riassume ed estrae informazioni chiave.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 mt-2 pt-0 flex flex-col items-center">
               <ul className="space-y-2 text-sm text-muted-foreground text-center">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Trascrizione accurata</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Riassunti automatici</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Estrazione Task</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Identificazione Decisioni</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="items-center text-center pb-4">
              <div className="mb-3 rounded-full bg-primary/10 p-3">
                <Share2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Chatta o Esporta</CardTitle>
              <CardDescription className="mt-2 px-2">
                Accedi ai risultati tramite la chat AI o condividili nel formato che preferisci.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 mt-2 pt-0 flex flex-col items-center">
              <ul className="space-y-2 text-sm text-muted-foreground text-center">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Chatta con il tuo contenuto</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Collabora con il Team</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Esporta in PDF, txt...</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Link href="/dashboard">
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
              Prova Appuntoai gratis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
