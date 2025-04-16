import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function DemoSection() {
  return (
    <section id="demo" className="bg-slate-50 py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Esempio in tempo reale</h2>
          <p className="mb-12 text-xl text-muted-foreground">
            Ecco come Appuntoai trasforma una riunione in appunti strutturati
          </p>
        </div>

        <div className="mx-auto max-w-[1000px]">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="bg-primary p-4 text-white">
                <h3 className="text-lg font-medium">Input: Trascrizione riunione</h3>
              </div>
              <CardContent className="p-4">
                <div className="max-h-[400px] overflow-y-auto rounded-lg bg-slate-100 p-4">
                  <p className="mb-2 font-medium">Marco (Project Manager):</p>
                  <p className="mb-4 text-sm">
                    Buongiorno a tutti, grazie per essere qui. Oggi dobbiamo discutere lo stato di avanzamento del
                    progetto X e definire le prossime attività. Sofia, puoi aggiornarci sul marketing?
                  </p>

                  <p className="mb-2 font-medium">Sofia (Marketing):</p>
                  <p className="mb-4 text-sm">
                    Certo. Abbiamo completato l'analisi di mercato e identificato i principali competitor. Propongo di
                    aumentare il budget marketing del 15% per la campagna di lancio prevista per fine mese.
                  </p>

                  <p className="mb-2 font-medium">Marco (Project Manager):</p>
                  <p className="mb-4 text-sm">
                    Ok, approviamo l'aumento del budget. Giulia, a che punto siamo con lo sviluppo?
                  </p>

                  <p className="mb-2 font-medium">Giulia (Sviluppatore):</p>
                  <p className="mb-4 text-sm">
                    Il backend è quasi completo, ma abbiamo bisogno di più tempo per i test. Direi che possiamo
                    completarlo entro il 20 giugno.
                  </p>

                  <p className="mb-2 font-medium">Alessandro (Designer):</p>
                  <p className="mb-4 text-sm">
                    Per quanto riguarda il design, devo ancora finalizzare alcune schermate. Posso terminare entro il 15
                    giugno.
                  </p>

                  <p className="mb-2 font-medium">Marco (Project Manager):</p>
                  <p className="mb-4 text-sm">
                    Perfetto. Quindi confermiamo il lancio per fine mese. Ah, dimenticavo: dobbiamo assumere due nuovi
                    sviluppatori per supportare la fase di manutenzione post-lancio.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div>
              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger
                    value="summary"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Riassunto
                  </TabsTrigger>
                  <TabsTrigger
                    value="decisions"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Decisioni
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Task
                  </TabsTrigger>
                  <TabsTrigger value="themes" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Temi
                  </TabsTrigger>
                </TabsList>
                <Card className="mt-4 border-0 shadow-sm">
                  <TabsContent value="summary" className="mt-0">
                    <CardContent className="p-4">
                      <h3 className="mb-4 text-lg font-medium">Riassunto della riunione</h3>
                      <p className="text-sm text-muted-foreground">
                        Riunione di pianificazione del progetto X con focus su stato avanzamento, marketing, sviluppo e
                        design. Approvato aumento del budget marketing del 15% per la campagna di lancio prevista per
                        fine mese. Confermata necessità di assumere due nuovi sviluppatori per la fase post-lancio.
                        Definite scadenze per completamento backend (20 giugno) e design (15 giugno).
                      </p>
                    </CardContent>
                  </TabsContent>
                  <TabsContent value="decisions" className="mt-0">
                    <CardContent className="p-4">
                      <h3 className="mb-4 text-lg font-medium">Decisioni prese</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                          <span className="text-sm">Lanciare il prodotto entro fine mese</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                          <span className="text-sm">Assumere due nuovi sviluppatori</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                          <span className="text-sm">Aumentare il budget marketing del 15%</span>
                        </li>
                      </ul>
                    </CardContent>
                  </TabsContent>
                  <TabsContent value="tasks" className="mt-0">
                    <CardContent className="p-4">
                      <h3 className="mb-4 text-lg font-medium">Task identificati</h3>
                      <div className="space-y-3">
                        <div className="rounded-lg border p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="font-medium">Finalizzare il design</p>
                            <Badge className="bg-red-100 text-red-800">Alta</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">Assegnato a:</span> Alessandro
                            </div>
                            <div>
                              <span className="font-medium">Scadenza:</span> 15/06/2023
                            </div>
                            <div>
                              <span className="font-medium">Categoria:</span> Design
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg border p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="font-medium">Completare il backend</p>
                            <Badge className="bg-red-100 text-red-800">Alta</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">Assegnato a:</span> Giulia
                            </div>
                            <div>
                              <span className="font-medium">Scadenza:</span> 20/06/2023
                            </div>
                            <div>
                              <span className="font-medium">Categoria:</span> Sviluppo
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </TabsContent>
                  <TabsContent value="themes" className="mt-0">
                    <CardContent className="p-4">
                      <h3 className="mb-4 text-lg font-medium">Temi principali</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-primary/10 text-primary">Design del prodotto</Badge>
                        <Badge className="bg-primary/10 text-primary">Pianificazione risorse</Badge>
                        <Badge className="bg-primary/10 text-primary">Strategia di lancio</Badge>
                        <Badge className="bg-primary/10 text-primary">Budget marketing</Badge>
                        <Badge className="bg-primary/10 text-primary">Sviluppo backend</Badge>
                      </div>
                    </CardContent>
                  </TabsContent>
                </Card>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
