"use client"

import { useState, useEffect, useCallback } from "react"
import { Sidebar } from "@/src/components/dashboard/sidebar"
import { Header } from "@/src/components/dashboard/header"
import { UploadSection } from "@/src/components/dashboard/upload-section"
import { ProcessingStatus } from "@/src/components/dashboard/processing-status"
import { ResultsDisplay } from "@/src/components/dashboard/results-display"
import { RecentFiles } from "@/src/components/dashboard/recent-files"
import { BackgroundPattern } from "@/src/components/ui/background-pattern"
import { cn } from "@/src/lib/utils"
import { ChatDialog } from "@/src/components/dashboard/chat-dialog"
import { useToast } from "@/src/components/ui/use-toast"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResultsType, RawApiResult } from "@/src/components/dashboard/types"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert"
import { CheckCircle } from "lucide-react"
import { formatApiResult } from "@/src/lib/formatters"
import { useAnalysisHistory } from "@/src/hooks/use-analysis-history"


// Definisci un tipo più specifico per le categorie valide
type ContentCategory = "Meeting" | "Lezione" | "Intervista";

// ---> DEFINISCI RecentFileRaw QUI <--- 
interface RecentFileRaw {
  id: string;
  name: string;
  type: string;
  contentType: string | undefined;
  date: string;
  status: string;
  rawData: RawApiResult; // Campo per i dati grezzi
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const [rawResults, setRawResults] = useState<RawApiResult | null>(null)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [transcriptId, setTranscriptId] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const { toast } = useToast()

  // --- USA IL NUOVO HOOK ---
  const { analysisHistory, isLoadingHistory, handleDeleteFile, refreshHistory } = useAnalysisHistory();

  // --- DEFINIZIONE DI handleAnalysisComplete (prima di usarla) ---
  const handleAnalysisComplete = useCallback((results: ResultsType) => {
    console.log("Dashboard: Analysis complete, showing results.", results);
    setRawResults(results);
    setProcessingStatus("completed");
    setSuggestedQuestions(results.suggested_questions || []);
    setTranscriptId(results.transcript_id || null);
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    console.log("Processing Status:", processingStatus);
    console.log("Active Tab:", activeTab);
    console.log("Raw Results State (in useEffect):", rawResults ? 'Present' : 'null');
    console.log("Transcript ID:", transcriptId);
  }, [rawResults, processingStatus, activeTab, transcriptId]);

  const handleSidebarToggle = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  }

  const handleChatOpen = () => {
    if (transcriptId) {
      setIsChatOpen(true);
    } else {
      console.warn("Tentativo di aprire la chat senza transcriptId valido");
      toast({ title: "Attendi...", description: "ID trascrizione non ancora pronto." });
    }
  }

  const handleHistoryChatOpen = (transcriptId: string) => {
    setTranscriptId(transcriptId);
    setIsChatOpen(true);
  }

  const handleDownload = (formattedData: ResultsType | null) => {
    if (!formattedData) {
      toast({ title: "Errore Download", description: "Dati formattati non disponibili.", variant: "destructive" });
      return;
    }

    const input = document.getElementById('results-export-area');
    if (!input) {
      toast({ title: "Errore Download", description: "Impossibile trovare l'area dei risultati da esportare.", variant: "destructive" });
      return;
    }

    toast({ title: "Generazione PDF in corso...", description: "Potrebbe richiedere qualche secondo." });

    const buttonsToHide = input.querySelectorAll('button');
    buttonsToHide.forEach(btn => (btn as HTMLElement).style.visibility = 'hidden');

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        const filename = `appuntoai_results_${formattedData.contentType || 'analisi'}.pdf`;
        pdf.save(filename);

        buttonsToHide.forEach(btn => (btn as HTMLElement).style.visibility = 'visible');
        toast({ title: "PDF Generato!", description: `Il file ${filename} è stato scaricato.` });
      })
      .catch((err: any) => {
        console.error("Errore durante la generazione del PDF:", err);
        buttonsToHide.forEach(btn => (btn as HTMLElement).style.visibility = 'visible');
        toast({ title: "Errore Download PDF", description: "Non è stato possibile generare il PDF.", variant: "destructive" });
      });
  }

  const handleShare = async (formattedData: ResultsType | null) => {
    if (!formattedData || !formattedData.summary) {
      toast({ title: "Errore Condivisione", description: "Dati formattati o riassunto non disponibili.", variant: "destructive" });
      return;
    }

    const shareData = {
      title: `Risultati Analisi AppuntoAI (${formattedData.contentType})`,
      text: formattedData.summary,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        console.log("Condivisione completata o annullata tramite API Web Share");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(formattedData.summary);
        toast({ title: "Riassunto copiato!", description: "Il riassunto è stato copiato negli appunti." });
      } else {
        toast({ title: "Condivisione non supportata", description: "Il tuo browser non supporta la condivisione o la copia negli appunti.", variant: "destructive" });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Condivisione annullata dall\'utente.');
      } else {
        console.error("Errore durante la condivisione:", err);
        toast({ title: "Errore di condivisione", description: "Non è stato possibile condividere il contenuto.", variant: "destructive" });
      }
    }
  }

  const renderContent = () => {
    console.log("--- renderContent ---"); // DEBUG
    console.log("Active Tab:", activeTab); // DEBUG
    console.log("Processing Status:", processingStatus); // DEBUG
    console.log("Raw Results State:", rawResults ? 'Present' : 'null'); // DEBUG
    console.log("Is Loading History:", isLoadingHistory); // DEBUG

    switch (activeTab) {
      case "upload":
        // Questa condizione determina se mostrare i NUOVI risultati
        const showResultsAfterUpload = processingStatus === 'completed' && rawResults;
        console.log("Show Results After Upload?:", showResultsAfterUpload); // DEBUG

        return (
          <div className="space-y-6">
            {/* Se NON dobbiamo mostrare i risultati NUOVI, mostriamo Upload o Processing */}
            {!showResultsAfterUpload && (
              <>
                {processingStatus !== 'processing' && ( // Mostra UploadSection solo se NON sta processando
                  <UploadSection
                    onAnalysisComplete={handleAnalysisComplete}
                    formatApiResult={formatApiResult}
                    processingStatus={processingStatus}
                  />
                )}
                {processingStatus === 'processing' && <ProcessingStatus status={processingStatus} />}
              </>
            )}

            {/* Se DOBBIAMO mostrare i risultati NUOVI */}
            {showResultsAfterUpload ? (
              <div className="animate-fadeIn">
                <Alert className="mb-6 border-green-500 bg-green-50 text-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertTitle className="font-semibold">Elaborazione Completata!</AlertTitle>
                  <AlertDescription>
                    I risultati della tua analisi sono pronti qui sotto.
                  </AlertDescription>
                </Alert>

                <Button onClick={() => { setRawResults(null); setProcessingStatus(null); }} variant="outline" className="gap-2 mb-4">
                  <ArrowLeft className="h-4 w-4" />
                  Carica un Altro Contenuto
                </Button>
                <div id="latest-results-export-area">
                  <ResultsDisplay
                    key={rawResults.transcript_id || Date.now()} // Usa direttamente rawResults
                    results={rawResults} // Usa direttamente rawResults
                    onChatOpen={handleChatOpen}
                    onDownload={() => handleDownload(rawResults)} // Usa direttamente rawResults
                    onShare={() => handleShare(rawResults)} // Usa direttamente rawResults
                  />
                </div>
              </div>
            ) : (
              // Se NON mostriamo i risultati NUOVI E non stiamo processando,
              // mostriamo Errore (se c'è) o Cronologia
              <>
                {processingStatus === 'failed' && <ProcessingStatus status={processingStatus} />}
                {(processingStatus === null || processingStatus === 'failed') && !isLoadingHistory && (
                  <RecentFiles
                    files={analysisHistory}
                    onOpenChat={handleHistoryChatOpen}
                    onDelete={handleDeleteFile}
                    formatApiResult={formatApiResult} // Serve ancora qui per visualizzare la cronologia
                  />
                )}
                {isLoadingHistory && <div className='text-center p-8'>Caricamento file recenti...</div>}
              </>
            )}
          </div>
        )
      case "results":
      case "history":
        return <RecentFiles
          files={analysisHistory}
          onOpenChat={handleHistoryChatOpen}
          onDelete={handleDeleteFile}
          formatApiResult={formatApiResult}
        />
      case "settings":
        return (
          <div className="container max-w-4xl py-8">
            <h1 className="mb-8 text-3xl font-bold">Impostazioni</h1>
            <div className="rounded-lg border p-8">
              <p className="text-center text-lg text-muted-foreground">
                Le impostazioni saranno disponibili a breve.
              </p>
            </div>
          </div>
        )
      default:
        return <UploadSection
          onAnalysisComplete={handleAnalysisComplete}
          formatApiResult={formatApiResult}
          processingStatus={processingStatus}
        />;
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <BackgroundPattern />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onToggle={handleSidebarToggle} />
      <div className={cn("flex-1", "md:ml-64", !sidebarExpanded && "md:ml-20")}>
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {renderContent()}
        </main>
      </div>

      {transcriptId && (
        <ChatDialog
          open={isChatOpen}
          onOpenChange={setIsChatOpen}
          transcriptId={transcriptId}
          suggestedQuestions={suggestedQuestions}
        />
      )}
    </div>
  )
}
