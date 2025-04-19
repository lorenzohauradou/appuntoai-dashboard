import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileAudio, FileText, FileVideo, Mic, FileCheck, Share } from "lucide-react"

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

        <div className="mx-auto max-w-[1000px]">
          <Tabs defaultValue="record" className="w-full">
            <TabsList className="flex flex-col md:grid md:grid-cols-4 gap-1 md:gap-0 w-full p-6 pb-12">
              <TabsTrigger value="record" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm py-1 px-2 justify-start md:justify-center">
                1. Registra o carica
              </TabsTrigger>
              <TabsTrigger value="transcribe" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm py-1 px-2 justify-start md:justify-center">
                2. Trascrizione AI
              </TabsTrigger>
              <TabsTrigger value="analyze" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm py-1 px-2 justify-start md:justify-center">
                3. Analisi intelligente
              </TabsTrigger>
              <TabsTrigger value="share" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm py-1 px-2 justify-start md:justify-center">
                4. Condividi e esporta
              </TabsTrigger>
            </TabsList>
            <div className="mt-6 md:mt-8 rounded-lg border p-3 md:p-6">
              <TabsContent value="record" className="mt-0 bg-card">
                <div className="flex flex-col gap-4 md:gap-6 md:flex-row">
                  <div className="flex-1">
                    <h3 className="mb-4 text-xl font-semibold">Registra o carica il tuo contenuto</h3>
                    <p className="mb-4 text-muted-foreground">
                      Scegli il metodo che preferisci per inserire i tuoi contenuti:
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <Mic className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Registra direttamente</p>
                          <p className="text-sm text-muted-foreground">
                            Usa il microfono per registrare riunioni o lezioni in tempo reale
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <FileVideo className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Carica video</p>
                          <p className="text-sm text-muted-foreground">
                            Supporta .mp4, .mov, .avi e altri formati video comuni
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <FileAudio className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Carica audio</p>
                          <p className="text-sm text-muted-foreground">
                            Supporta .mp3, .wav, .m4a, .ogg e altri formati audio
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <FileText className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Inserisci testo</p>
                          <p className="text-sm text-muted-foreground">
                            Incolla direttamente il testo o carica un file .txt
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-1 items-center justify-center">
                    <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-lg bg-slate-100 p-8">
                      <div className="flex h-full flex-col items-center justify-center">
                        <Button
                          size="icon"
                          className="h-20 w-20 rounded-full bg-primary text-white hover:bg-primary/90"
                        >
                          <Mic className="h-10 w-10" />
                        </Button>
                        <p className="mt-4 text-center text-sm font-medium">Premi per registrare</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="transcribe" className="mt-0">
                <div className="flex flex-col gap-4 md:gap-6 md:flex-row">
                  <div className="flex-1">
                    <h3 className="mb-4 text-xl font-semibold">Trascrizione automatica con AI</h3>
                    <p className="mb-4 text-muted-foreground">
                      La nostra tecnologia AI converte audio e video in testo con precisione superiore al 99%.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                          <span className="text-xs">✓</span>
                        </div>
                        <div>
                          <p className="font-medium">Precisione superiore al 99%</p>
                          <p className="text-sm text-muted-foreground">
                            Trascrizione accurata anche con accenti e terminologia specialistica
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                          <span className="text-xs">✓</span>
                        </div>
                        <div>
                          <p className="font-medium">Riconoscimento dei parlanti</p>
                          <p className="text-sm text-muted-foreground">
                            Distingue automaticamente le diverse voci nella conversazione
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                          <span className="text-xs">✓</span>
                        </div>
                        <div>
                          <p className="font-medium">Supporto multilingua</p>
                          <p className="text-sm text-muted-foreground">
                            Trascrizione in italiano, inglese, spagnolo e altre lingue
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-1 items-center justify-center">
                    <div className="relative w-full max-w-[300px] overflow-hidden rounded-lg border bg-white p-4 shadow-sm">
                      <div className="space-y-2">
                        <div className="h-4 w-full rounded bg-slate-100"></div>
                        <div className="h-4 w-3/4 rounded bg-slate-100"></div>
                        <div className="h-4 w-5/6 rounded bg-slate-100"></div>
                        <div className="h-4 w-2/3 rounded bg-slate-100"></div>
                        <div className="h-4 w-full rounded bg-slate-100"></div>
                        <div className="h-4 w-4/5 rounded bg-slate-100"></div>
                        <div className="h-4 w-3/4 rounded bg-slate-100"></div>
                        <div className="h-4 w-full rounded bg-slate-100"></div>
                        <div className="h-4 w-2/3 rounded bg-slate-100"></div>
                        <div className="h-4 w-5/6 rounded bg-slate-100"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="analyze" className="mt-0">
                <div className="flex flex-col gap-4 md:gap-6 md:flex-row">
                  <div className="flex-1">
                    <h3 className="mb-4 text-xl font-semibold">Analisi intelligente con LLM</h3>
                    <p className="mb-4 text-muted-foreground">
                      I nostri modelli linguistici avanzati analizzano il contenuto ed estraggono informazioni
                      strutturate.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <FileCheck className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Riassunto generale</p>
                          <p className="text-sm text-muted-foreground">Sintesi concisa dei punti principali discussi</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <FileCheck className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Estrazione delle decisioni</p>
                          <p className="text-sm text-muted-foreground">
                            Identificazione automatica delle decisioni prese
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <FileCheck className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Creazione di task</p>
                          <p className="text-sm text-muted-foreground">
                            Generazione di attività con assegnatari, scadenze e priorità
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <FileCheck className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Identificazione dei temi</p>
                          <p className="text-sm text-muted-foreground">
                            Riconoscimento degli argomenti principali trattati
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-1 items-center justify-center">
                    <div className="relative w-full max-w-[300px] overflow-hidden rounded-lg border bg-white p-4 shadow-sm">
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 text-sm font-medium">Riassunto</h4>
                          <div className="h-16 rounded bg-slate-100 p-2"></div>
                        </div>
                        <div>
                          <h4 className="mb-2 text-sm font-medium">Decisioni</h4>
                          <div className="space-y-1">
                            <div className="h-4 rounded bg-slate-100"></div>
                            <div className="h-4 rounded bg-slate-100"></div>
                          </div>
                        </div>
                        <div>
                          <h4 className="mb-2 text-sm font-medium">Task</h4>
                          <div className="space-y-1">
                            <div className="h-8 rounded bg-slate-100"></div>
                            <div className="h-8 rounded bg-slate-100"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="share" className="mt-0">
                <div className="flex flex-col gap-4 md:gap-6 md:flex-row">
                  <div className="flex-1">
                    <h3 className="mb-4 text-xl font-semibold">Condividi ed esporta facilmente</h3>
                    <p className="mb-4 text-muted-foreground">
                      Accedi, modifica e condividi i tuoi appunti in diversi formati.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <Share className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Condivisione con un clic</p>
                          <p className="text-sm text-muted-foreground">
                            Invia i risultati via email o con un link condivisibile
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Share className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Esportazione in più formati</p>
                          <p className="text-sm text-muted-foreground">Esporta in PDF, Word, Markdown o JSON</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Share className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Integrazione con altre app</p>
                          <p className="text-sm text-muted-foreground">
                            Connetti con Notion, Google Docs, Slack e altre piattaforme
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-1 items-center justify-center">
                    <div className="relative w-full max-w-[300px] overflow-hidden rounded-lg border bg-white p-4 shadow-sm">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Appunti_Riunione.pdf</div>
                          <Button variant="outline" size="sm">
                            Scarica
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Appunti_Riunione.docx</div>
                          <Button variant="outline" size="sm">
                            Scarica
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Appunti_Riunione.md</div>
                          <Button variant="outline" size="sm">
                            Scarica
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Appunti_Riunione.json</div>
                          <Button variant="outline" size="sm">
                            Scarica
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          <div className="mt-8 text-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                Prova Appuntoai gratis per 7 giorni
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
