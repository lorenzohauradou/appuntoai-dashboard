import { Card, CardContent } from "@/components/ui/card"
import { BackgroundPattern } from "@/components/ui/background-pattern"
import { MessageSquare, PlayCircle, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function RagVideoSection() {
  return (
    <section id="rag-video" className="relative py-16 md:py-24 overflow-hidden">
      <BackgroundPattern />
      <div className="container relative z-10">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Interagisci con i tuoi contenuti</h2>
          <p className="mb-12 text-xl text-muted-foreground">
            Analizza i tuoi video e fai domande specifiche sui contenuti
          </p>
        </div>

        <div className="mx-auto max-w-[1000px]">
          {/* Video card principal e centrale */}
          <Card className="overflow-hidden shadow-lg mb-8">
            <div className="bg-primary p-4 text-white">
              <h3 className="text-lg font-medium">Carica un video e chatta con il contenuto</h3>
            </div>
            <CardContent className="p-6">
              <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-center">
                  <PlayCircle className="h-20 w-20 mx-auto text-primary/60 mb-4" />
                  <p className="text-sm text-muted-foreground">Il tuo video verrà trascritto e analizzato</p>
                </div>
              </div>
              
              {/* Informazioni sulla chat sotto il video */}
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Analisi automatica</p>
                      <p className="text-sm text-muted-foreground">
                        Estrazione di decisioni, task e argomenti chiave dal tuo contenuto
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Conversazioni intelligenti</p>
                      <p className="text-sm text-muted-foreground">
                        Fai domande specifiche e ottieni risposte basate sul contenuto del video
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-auto">
                  <Button className="w-full md:w-auto" size="lg">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chatta con il documento
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Esempi di domande */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-slate-50 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-2 items-center">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm font-medium">"Quali decisioni sono state prese nel meeting?"</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-50 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-2 items-center">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm font-medium">"Riassumi i compiti assegnati a Marco"</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-50 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-2 items-center">
                  <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm font-medium">"Quali sono i principali temi discussi?"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
} 