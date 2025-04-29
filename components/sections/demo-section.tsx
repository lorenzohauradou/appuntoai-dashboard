"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Brain, GraduationCap, UserCheck, ListTodo, HelpCircle, BookOpen, Star, TrendingUp, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// --- Dati di Esempio ---
const meetingInput = `
<p className="mb-2 font-bold">Marco (Project Manager):</p>
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
  sviluppatori per supportare la fase di manutenzione post-lancio...
</p>
`;

const lectureInput = `
<p className="mb-2 font-medium">Docente:</p>
<p className="mb-4 text-sm">
  Oggi parliamo di tessuti vegetali. Si dividono in due categorie: meristematici (crescita attiva, es. apici radicali e germogli) e definitivi (specializzati). I meristemi hanno cellule piccole, con nucleo grande, alta attività mitotica.
</p>
<p className="mb-2 font-medium">Docente:</p>
<p className="mb-4 text-sm">
  I tessuti definitivi includono: Parenchima (versatile: fotosintesi, riserva, scambio gassoso; cellule vive, parete sottile), Collencima (sostegno flessibile; cellule vive, pareti ispessite irregolarmente), Sclerenchima (sostegno rigido; cellule morte, pareti spesse e lignificate - fibre e sclereidi).
</p>
<p className="mb-2 font-medium">Docente:</p>
<p className="mb-4 text-sm">
  Poi ci sono i tessuti conduttori: Xilema (trasporta acqua e sali; cellule morte come tracheidi e vasi) e Floema (trasporta zuccheri; cellule vive come elementi cribrosi e cellule compagne). Ricordate: Xilema su, Floema dove serve.
</p>
<p className="mb-2 font-medium">Docente:</p>
<p className="mb-4 text-sm">
  Infine, l'Epidermide (tessuto tegumentario primario, protezione, cellule vive) e il Sughero (protezione secondaria nelle piante legnose). Alcuni tessuti, come il parenchima, possono dedifferenziarsi e rigenerarsi. Distinguete tessuti semplici (parenchima) e complessi (floema, xilema). Attenzione alle differenze tra Monocotiledoni e Dicotiledoni riguardo l'accrescimento secondario (cambio)...
</p>
`;

const interviewInput = `
<p className="mb-2 font-medium">Moderatore:</p>
<p className="mb-4 text-sm">
  Benvenuti. Oggi parliamo di nucleare: pro, contro, rischi, benefici. Con noi Lorenzo, ingegnere pro-nucleare, e Silvia, attivista anti-nucleare. Lorenzo, il nucleare ha ancora senso nel 2025?
</p>
<p className="mb-2 font-medium">Lorenzo (Ingegnere):</p>
<p className="mb-4 text-sm">
  Sì, è necessario per la decarbonizzazione. Serve una fonte stabile, e il nucleare di nuova generazione (Gen IV) è l'unica opzione a basse emissioni continua oggi disponibile. È più sicuro, non è Chernobyl.
</p>
<p className="mb-2 font-medium">Silvia (Attivista):</p>
<p className="mb-4 text-sm">
  Il problema è il rischio, i costi enormi, i tempi lunghi (decenni) e le scorie radioattive che durano secoli. Il clima non aspetta. Ogni euro nel nucleare è tolto a rinnovabili, storage, efficienza. Nessuno ha una soluzione definitiva per le scorie.
</p>
<p className="mb-2 font-medium">Lorenzo (Ingegnere):</p>
<p className="mb-4 text-sm">
  I volumi delle scorie sono ridotti rispetto alla CO2. Esistono progetti come Onkalo in Finlandia. La Francia sta tornando al nucleare per compensare l'intermittenza delle rinnovabili. Il mix rinnovabili + accumulo da solo non basta, serve un backup stabile se vogliamo rinunciare al gas.
</p>
<p className="mb-2 font-medium">Silvia (Attivista):</p>
<p className="mb-4 text-sm">
  Ma non a 10 miliardi per impianto e 15 anni di attesa. Costruire nuovi reattori oggi non ha senso economico né climatico. Meglio spingere su rinnovabili, accumulo, smart grid. Forse mantenere gli esistenti, ma non costruirne di nuovi.
</p>
<p className="mb-2 font-medium">Moderatore:</p>
<p className="mb-4 text-sm">
  L'opinione pubblica è pronta? C'è paura e disinformazione. Servirebbe più trasparenza e un dibattito pragmatico basato sui dati, non polarizzato...
</p>
`;

// Definisci tipo per i dati dei tab
interface TabInfo {
  value: string;
  label: string;
  Icon: React.ElementType; // Usa React.ElementType per tipi di componente
}

interface OutputTabData {
  defaultTab: string;
  tabs: TabInfo[];
}

// --- Componente --- 
export function DemoSection() {
  const [selectedInputType, setSelectedInputType] = useState<'Meeting' | 'Lezione' | 'Intervista'>('Meeting');

  const getInputContent = () => {
    switch (selectedInputType) {
      case 'Meeting': return meetingInput;
      case 'Lezione': return lectureInput;
      case 'Intervista': return interviewInput;
      default: return meetingInput;
    }
  };

  // Funzione con tipo di ritorno esplicito
  const getOutputTabs = (): OutputTabData => {
    switch (selectedInputType) {
      case 'Meeting':
        return {
          defaultTab: "tasks",
          tabs: [
            { value: "summary", label: "Riassunto", Icon: Brain },
            { value: "decisions", label: "Decisioni", Icon: CheckCircle },
            { value: "tasks", label: "Task", Icon: ListTodo },
            { value: "themes", label: "Temi", Icon: BookOpen },
          ]
        };
      case 'Lezione':
        return {
          defaultTab: "summary",
          tabs: [
            { value: "summary", label: "Riassunto", Icon: Brain },
            { value: "concepts", label: "Concetti Chiave", Icon: GraduationCap },
            { value: "questions", label: "Domande Aperte", Icon: HelpCircle },
            { value: "references", label: "Riferimenti", Icon: BookOpen },
          ]
        };
      case 'Intervista':
        return {
          defaultTab: "summary",
          tabs: [
            { value: "summary", label: "Riassunto", Icon: Brain },
            { value: "evaluation", label: "Valutazione", Icon: UserCheck },
            { value: "strengths", label: "Punti di Forza", Icon: Star },
            { value: "nextSteps", label: "Prossimi Passi", Icon: Send },
          ]
        };
      // Fallback corretto
      default:
        return {
           defaultTab: "summary",
           tabs: [
             { value: "summary", label: "Riassunto", Icon: Brain },
             { value: "decisions", label: "Decisioni", Icon: CheckCircle },
             { value: "tasks", label: "Task", Icon: ListTodo },
             { value: "themes", label: "Temi", Icon: BookOpen },
           ]
         };
    }
  };

  const currentOutput = getOutputTabs();

  return (
    <section id="demo" className="bg-slate-50 py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-[800px] text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Esempio di analisi</h2>
          <p className="mb-12 text-xl text-muted-foreground">
            Ecco un piccolo assaggio di come Appuntoai trasforma diversi tipi di conversazioni in appunti strutturati
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Input Card */}
            <Card className="overflow-hidden">
              <div className="bg-primary p-4 text-white">
                <h3 className="text-lg font-medium mb-3">Input: Video/Audio/Testo - {selectedInputType}</h3>
                 {/* Pulsanti di Selezione Input */}
                 <div className="flex space-x-2">
                  {(['Meeting', 'Lezione', 'Intervista'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={selectedInputType === type ? "secondary" : "ghost"}
                      size="sm"
                      className={`h-8 px-3 ${selectedInputType === type ? 'bg-white text-primary hover:bg-white/90' : 'text-white hover:bg-white/20 hover:text-white'}`}
                      onClick={() => setSelectedInputType(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              <CardContent className="p-4">
                <div 
                  className="max-h-[400px] overflow-y-auto rounded-lg bg-card p-4"
                  dangerouslySetInnerHTML={{ __html: getInputContent() }}
                />
              </CardContent>
            </Card>

            {/* Output Section - Wrapped in Card */}
            <Card className="overflow-hidden">
              {/* Output Header */}
              <div className="bg-primary p-4 text-white">
                <h3 className="text-lg font-medium">Risultato Analisi</h3>
              </div>

              {/* Tabs Component - Now inside the Card */}
              <Tabs defaultValue={currentOutput.defaultTab} className="w-full">
                <TabsList className="flex w-full border-b border-border rounded-none px-4"> {/* Added px-4 for padding consistency */}
                  {currentOutput.tabs.map(tab => (
                     <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-1.5"
                    >
                      <tab.Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Output Content - Meeting */}
                {selectedInputType === 'Meeting' && (
                  /* Removed the inner Card wrapper, using CardContent directly */
                  <CardContent className="p-0 mt-0"> {/* Use CardContent, remove margin */}
                    <TabsContent value="summary">
                      <div className="p-4">
                        <h3 className="mb-4 text-lg font-medium">Riassunto della riunione</h3>
                        <p className="text-sm text-muted-foreground">
                          Riunione di pianificazione del progetto X con focus su stato avanzamento, marketing, sviluppo e
                          design. Approvato aumento del budget marketing del 15% per la campagna di lancio prevista per
                          fine mese. Confermata necessità di assumere due nuovi sviluppatori per la fase post-lancio.
                          Definite scadenze per completamento backend (20 giugno) e design (15 giugno).
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="decisions">
                      <div className="p-4">
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
                      </div>
                    </TabsContent>
                    <TabsContent value="tasks">
                      <div className="p-4">
                        <h3 className="mb-4 text-lg font-medium">Task identificati</h3>
                        <div className="space-y-3">
                          <div className="rounded-lg border p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <p className="font-medium">Finalizzare il design</p>
                              <Badge className="bg-red-100 text-red-800">Alta</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                              <div><span className="font-medium">Assegnato a:</span> Alessandro</div>
                              <div><span className="font-medium">Scadenza:</span> 15/06/2023</div>
                              <div><span className="font-medium">Categoria:</span> Design</div>
                            </div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <p className="font-medium">Completare il backend</p>
                              <Badge className="bg-red-100 text-red-800">Alta</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                              <div><span className="font-medium">Assegnato a:</span> Giulia</div>
                              <div><span className="font-medium">Scadenza:</span> 20/06/2023</div>
                              <div><span className="font-medium">Categoria:</span> Sviluppo</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="themes">
                      <div className="p-4">
                        <h3 className="mb-4 text-lg font-medium">Temi principali</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-primary/10 text-primary">Design</Badge>
                          <Badge className="bg-primary/10 text-primary">Pianificazione</Badge>
                          <Badge className="bg-primary/10 text-primary">Lancio</Badge>
                          <Badge className="bg-primary/10 text-primary">Marketing</Badge>
                          <Badge className="bg-primary/10 text-primary">Sviluppo</Badge>
                          <Badge className="bg-primary/10 text-primary">Risorse</Badge>
                        </div>
                      </div>
                    </TabsContent>
                  </CardContent>
                )}

                {/* Output Content - Lezione */}
                {selectedInputType === 'Lezione' && (
                  /* Removed the inner Card wrapper, using CardContent directly */
                  <CardContent className="p-0 mt-0"> {/* Use CardContent, remove margin */}
                    <TabsContent value="summary">
                      <div className="p-4">
                        <h3 className="mb-4 text-lg font-medium">Riassunto della Lezione</h3>
                        <p className="text-sm text-muted-foreground">
                          La lezione introduce i tessuti vegetali, dividendoli in meristematici (crescita) e definitivi (specializzati). Vengono descritti i principali tessuti definitivi: Parenchima (fotosintesi, riserva), Collencima (sostegno flessibile), Sclerenchima (sostegno rigido), Xilema (trasporto acqua), Floema (trasporto zuccheri), Epidermide (protezione) e Sughero. Si accenna alla rigenerazione, alla differenza tra tessuti semplici/complessi e tra Monocotiledoni/Dicotiledoni.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="concepts">
                      <div className="p-4">
                        <h3 className="mb-4 text-lg font-medium">Concetti Chiave</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <GraduationCap className="mt-0.5 h-4 w-4 text-blue-600" />
                            <span className="text-sm text-muted-foreground"><strong>Meristemi vs Tessuti Definitivi:</strong> Crescita vs Specializzazione.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <GraduationCap className="mt-0.5 h-4 w-4 text-blue-600" />
                            <span className="text-sm text-muted-foreground"><strong>Tessuti di Sostegno:</strong> Collencima (vivo, flessibile), Sclerenchima (morto, rigido).</span>
                          </li>
                           <li className="flex items-start gap-2">
                            <GraduationCap className="mt-0.5 h-4 w-4 text-blue-600" />
                            <span className="text-sm text-muted-foreground"><strong>Tessuti Conduttori:</strong> Xilema (acqua, sali, cellule morte), Floema (zuccheri, cellule vive).</span>
                          </li>
                           <li className="flex items-start gap-2">
                            <GraduationCap className="mt-0.5 h-4 w-4 text-blue-600" />
                            <span className="text-sm text-muted-foreground"><strong>Tessuti Tegumentari:</strong> Epidermide (primario), Sughero (secondario).</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <GraduationCap className="mt-0.5 h-4 w-4 text-blue-600" />
                            <span className="text-sm text-muted-foreground"><strong>Semplici vs Complessi:</strong> Es. Parenchima vs Xilema/Floema.</span>
                          </li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="questions">
                      <div className="p-4">
                        <h3 className="mb-4 text-lg font-medium">Domande / Punti da Chiarire</h3>
                         <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <HelpCircle className="mt-0.5 h-4 w-4 text-orange-600" />
                            <span className="text-sm text-muted-foreground">Come avviene esattamente la dedifferenziazione del parenchima?</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <HelpCircle className="mt-0.5 h-4 w-4 text-orange-600" />
                            <span className="text-sm text-muted-foreground">Qual è la funzione specifica delle cellule compagne nel floema?</span>
                          </li>
                           <li className="flex items-start gap-2">
                            <HelpCircle className="mt-0.5 h-4 w-4 text-orange-600" />
                            <span className="text-sm text-muted-foreground">Approfondire struttura secondaria e ruolo del cambio cribro-vascolare.</span>
                          </li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="references">
                      <div className="p-4">
                        <h3 className="mb-4 text-lg font-medium">Riferimenti e Materiali</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <BookOpen className="mt-0.5 h-4 w-4 text-purple-600" />
                            <a href="#" className="text-sm text-primary hover:underline">Capitolo 5: Tessuti Vegetali - Libro di Botanica</a>
                          </li>
                          <li className="flex items-start gap-2">
                            <BookOpen className="mt-0.5 h-4 w-4 text-purple-600" />
                            <a href="#" className="text-sm text-primary hover:underline">Dispensa su Tessuti Conduttori</a>
                          </li>
                           <li className="flex items-start gap-2">
                            <BookOpen className="mt-0.5 h-4 w-4 text-purple-600" />
                            <a href="#" className="text-sm text-primary hover:underline">Immagini al microscopio dei tessuti (link esterno)</a>
                          </li>
                        </ul>
                      </div>
                    </TabsContent>
                  </CardContent>
                )}

                {/* Output Content - Intervista */}
                {selectedInputType === 'Intervista' && (
                   /* Removed the inner Card wrapper, using CardContent directly */
                  <CardContent className="p-0 mt-0"> {/* Use CardContent, remove margin */}
                    <TabsContent value="summary">
                      <div className="p-4">
                        <h3 className="mb-4 text-lg font-medium">Riassunto del Dibattito</h3>
                        <p className="text-sm text-muted-foreground">
                          Dibattito sul ruolo del nucleare nella transizione energetica nel 2025. Lorenzo (ingegnere) lo ritiene necessario e sicuro (Gen IV) per la decarbonizzazione e come backup stabile alle rinnovabili intermittenti. Silvia (attivista) critica i rischi, i costi elevati, i tempi lunghi e il problema irrisolto delle scorie, sostenendo priorità a rinnovabili, accumulo ed efficienza. Entrambi concordano sulla necessità di un dibattito informato e meno polarizzato, superando paure e disinformazione.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="evaluation">
                      <div className="p-4">
                        <h3 className="mb-4 text-lg font-medium">Posizioni Chiave</h3>
                         <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <UserCheck className="mt-1 h-4 w-4 flex-shrink-0 text-cyan-600" />
                            <div>
                              <span className="text-sm font-medium">Lorenzo (Pro):</span>
                              <p className="text-xs text-muted-foreground">Necessario per decarbonizzazione, stabilità rete, tecnologia Gen IV sicura.</p>
                             </div>
                          </li>
                           <li className="flex items-start gap-3">
                            <UserCheck className="mt-1 h-4 w-4 flex-shrink-0 text-orange-600" />
                            <div>
                              <span className="text-sm font-medium">Silvia (Contro):</span>
                              <p className="text-xs text-muted-foreground">Rischi, costi, tempi, scorie irrisolte. Priorità a rinnovabili/efficienza.</p>
                             </div>
                          </li>
                           <li className="flex items-start gap-3">
                            <UserCheck className="mt-1 h-4 w-4 flex-shrink-0 text-gray-500" />
                             <div>
                              <span className="text-sm font-medium">Accordo Comune:</span>
                              <p className="text-xs text-muted-foreground">Necessità di dibattito basato su dati, trasparenza, superare polarizzazione.</p>
                             </div>
                          </li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="strengths">
                       <div className="p-4">
                        <h3 className="mb-4 text-lg font-medium">Argomenti Principali</h3>
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          <div>
                            <h4 className="mb-2 text-sm font-medium text-green-600 flex items-center gap-1.5"><Star className="h-4 w-4" />Pro Nucleare (Lorenzo)</h4>
                            <ul className="space-y-1 pl-5 list-disc list-outside text-xs text-muted-foreground">
                              <li>Fonte stabile e continua</li>
                              <li>Basse emissioni CO2</li>
                              <li>Tecnologia Gen IV più sicura</li>
                              <li>Necessario backup per rinnovabili</li>
                              <li>Volumi scorie gestibili (es. Onkalo)</li>
                            </ul>
                          </div>
                          <div>
                             <h4 className="mb-2 text-sm font-medium text-red-600 flex items-center gap-1.5"><Star className="h-4 w-4" />Contro Nucleare (Silvia)</h4>
                             <ul className="space-y-1 pl-5 list-disc list-outside text-xs text-muted-foreground">
                              <li>Rischi incidenti</li>
                              <li>Costi e tempi di costruzione elevati</li>
                              <li>Problema scorie non risolto</li>
                              <li>Sottrae investimenti a rinnovabili</li>
                              <li>Il clima non aspetta i tempi lunghi</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="nextSteps">
                      <div className="p-4">
                        <h3 className="mb-4 text-lg font-medium">Punti Aperti / Prossimi Passi</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Send className="mt-0.5 h-4 w-4 text-blue-600" />
                            <span className="text-sm text-muted-foreground">Analizzare costi reali e tempi di realizzazione di Gen IV vs Rinnovabili+Accumulo.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Send className="mt-0.5 h-4 w-4 text-blue-600" />
                            <span className="text-sm text-muted-foreground">Valutare stato della ricerca su gestione scorie a lungo termine.</span>
                          </li>
                           <li className="flex items-start gap-2">
                            <Send className="mt-0.5 h-4 w-4 text-blue-600" />
                            <span className="text-sm text-muted-foreground">Monitorare evoluzione opinione pubblica e dibattito politico.</span>
                          </li>
                           <li className="flex items-start gap-2">
                            <Send className="mt-0.5 h-4 w-4 text-blue-600" />
                            <span className="text-sm text-muted-foreground">Organizzare un nuovo confronto tra X mesi per aggiornamenti.</span>
                          </li>
                        </ul>
                      </div>
                    </TabsContent>
                  </CardContent>
                )}
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
