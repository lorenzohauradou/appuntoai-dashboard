"use client"

import { useState, useEffect, useCallback } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { UploadSection } from "@/components/dashboard/upload-section"
import { ProcessingStatus } from "@/components/dashboard/processing-status"
import { ResultsDisplay } from "@/components/dashboard/results-display"
import { RecentFiles } from "@/components/dashboard/recent-files"
import { BackgroundPattern } from "@/components/ui/background-pattern"
import { cn } from "@/lib/utils"
import { analyzeMeeting, sendChatMessage, getAnalysisHistory, deleteAnalysis } from "@/lib/api"
import { ChatDialog } from "@/components/dashboard/chat-dialog"
import { useToast } from "@/components/ui/use-toast"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResultsType, MeetingResults } from "@/components/dashboard/types"

// Definisci un tipo più specifico per le categorie valide
type ContentCategory = "Meeting" | "Lezione" | "Intervista";

// Tipo per i risultati grezzi dall'API (esempio, potrebbe essere più specifico)
type RawApiResult = any; 

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

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const [rawResults, setRawResults] = useState<RawApiResult | null>(null)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [transcriptId, setTranscriptId] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [analysisHistory, setAnalysisHistory] = useState<RecentFileRaw[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const { toast } = useToast()

  // Funzione helper per formattare i risultati dell'API (sia freschi che dalla cronologia)
  const formatApiResult = useCallback((result: RawApiResult): ResultsType | null => {
    // ---> Manteniamo la versione ORIGINALE COMPLETA CON LOG <---
    console.log("[[[ formatApiResult INIZIO ]]]"); 
    if (!result) {
      console.error("[[[ formatApiResult ERRORE: Input 'result' è null o undefined ]]]");
      return { 
        summary: "Errore: Dati API mancanti", 
        contentType: 'meeting', 
        decisions:[], 
        tasks:[], 
        themes:[], 
        participants:[], 
        transcript_id: undefined, 
        suggested_questions: [] 
      };
    }

    // Log Dettagliati dell'Input
    console.log("[[[ formatApiResult Input 'result' RAW ]]]:", result);
    try {
      console.log("[[[ formatApiResult Input 'result' JSON.stringify ]]]:", JSON.stringify(result));
    } catch (e) {
      console.error("[[[ formatApiResult ERRORE JSON.stringify ]]]:", e);
    }
    console.log(`[[[ formatApiResult Check: typeof result = ${typeof result} ]]]`);
    console.log(`[[[ formatApiResult Check: Chiavi presenti in result = ${Object.keys(result)} ]]]`);
    console.log(`[[[ formatApiResult Check: typeof result.tipo_contenuto = ${typeof result.tipo_contenuto} ]]]`);
    console.log(`[[[ formatApiResult Check: result.tipo_contenuto Raw = |${result.tipo_contenuto}| ]]]`); // Vediamo se ci sono spazi
    console.log(`[[[ formatApiResult Check: Valore booleano di result.tipo_contenuto = ${!!result.tipo_contenuto} ]]]`);
    console.log(`[[[ formatApiResult Check: Condizione if (!result.tipo_contenuto) = ${!result.tipo_contenuto} ]]]`);

    // Condizione di Fallback
    if (!result.tipo_contenuto) { // Semplifichiamo la condizione, dato che abbiamo già verificato !result
      console.warn("[[[ formatApiResult WARN: 'result.tipo_contenuto' mancante o falsy. Eseguo fallback a 'meeting'. Input era:]]]", result);
      const contentType = 'meeting'; // Explicitly set fallback type
      const fallbackData: MeetingResults = { // Explicitly type as MeetingResults
        summary: result?.riassunto || "Riassunto non disponibile",
        contentType: contentType, // <-- Qui viene impostato 'meeting'
        decisions: result?.decisioni || [],
         tasks: (result?.tasks || []).map((task: any) => ({
            task: task.descrizione || "",
            assignee: task.assegnatario || "Non specificato",
            deadline: task.scadenza || 'Non specificata',
            priority: task.priorita || 'Media',
            category: task.categoria || 'Generale',
         })),
         themes: result?.temi_principali || [],
         participants: (result?.partecipanti || []).map((p: any) => ({ name: p.nome, role: p.ruolo })),
         transcript_id: result?.transcript_id || undefined, // CORREZIONE: null -> undefined
         suggested_questions: result?.suggested_questions || [],
       };
       console.log("[[[ formatApiResult FINE (Fallback) ]]]");
       return fallbackData as ResultsType; // Cast to satisfy return type
    }

    // Codice normale
    const category = result.tipo_contenuto;
    console.log(`[[[ formatApiResult Categoria rilevata: ${category} ]]]`);

    let formattedResults: ResultsType;

     if (category === "lesson") {
        console.log("[[[ formatApiResult Blocco 'lezione' ESEGUITO ]]]");
        formattedResults = {
          summary: result.riassunto || "",
          contentType: "lezione" as const,
          keyPoints: result.concetti_chiave || [],
          exercises: (result.esercizi || []).map((ex: { descrizione: string; scadenza?: string; data_iso?: string }) => ({
             description: ex.descrizione || "N/A",
             deadline: ex.scadenza,
             date_iso: ex.data_iso
          })),
          topics: result.argomenti || [],
          participants: (result.partecipanti || []).map((participant: { nome: string; ruolo?: string }) => ({
            name: participant.nome || "Non specificato",
            role: participant.ruolo || 'Docente/Relatore',
          })),
          possibleQuestions: result.possibili_domande_esame || [],
          bibliography: result.bibliografia || [],
          transcript_id: result.transcript_id,
          suggested_questions: result.suggested_questions || [],
        };
      } else if (category === "interview") {
         console.log("[[[ formatApiResult Blocco 'intervista' ESEGUITO ]]]");
         // Cast result to InterviewResults structure for type safety, assuming backend sends matching fields
         const interviewData = result as any; // O definisci un tipo RawInterviewResult più specifico
         formattedResults = {
           summary: interviewData.riassunto || "",
           contentType: "intervista" as const,
           // definito in InterviewResults
           domande_principali: interviewData.domande_principali || [],
           risposte_chiave: interviewData.risposte_chiave || [],
           punti_salienti: interviewData.punti_salienti || [],
           temi_principali: interviewData.temi_principali || [], // Corretto da 'themes'
           participants: (interviewData.partecipanti || []).map((participant: { nome: string; ruolo?: string }) => ({
            name: participant.nome || "Non specificato",
            role: participant.ruolo || 'Intervistatore/Intervistato',
           })),
           transcript_id: interviewData.transcript_id,
           suggested_questions: interviewData.suggested_questions || [],
         };
      } else {
        console.log(`[[[ formatApiResult Blocco 'meeting' (default) ESEGUITO perché categoria è '${category}' ]]]`);
        formattedResults = {
          summary: result.riassunto || "",
          contentType: "meeting" as const,
          decisions: result.decisioni || [],
          tasks: (result.tasks || []).map((task: { descrizione: string; assegnatario?: string; scadenza?: string; priorita?: string; categoria?: string }) => ({
            task: task.descrizione || "",
            assignee: task.assegnatario || "Non specificato",
            deadline: task.scadenza || 'Non specificata',
            priority: task.priorita || 'Media',
            category: task.categoria || 'Generale',
          })),
          themes: result.temi_principali || [],
          participants: (result.partecipanti || []).map((participant: { nome: string; ruolo?: string }) => ({
            name: participant.nome || "Non specificato",
            role: participant.ruolo || 'Partecipante',
          })),
          transcript_id: result.transcript_id,
          suggested_questions: result.suggested_questions || [],
        };
      }
      console.log("[[[ formatApiResult Ritorno formattato: ]]]", formattedResults);
      console.log("[[[ formatApiResult FINE (Normale) ]]]");
      return formattedResults;
  }, []);

  // Effetto per recuperare la cronologia delle analisi
  useEffect(() => {
    const fetchAnalysisHistory = async () => {
      if (activeTab === "results" || activeTab === "upload") {
        setIsLoadingHistory(true);
        try {
          const historyData = await getAnalysisHistory();
          
          // --- MODIFICA: Mappatura per salvare i dati GREZZI e il TIPO CONTENUTO ---
          const rawHistory = historyData.map((item: any): RecentFileRaw => ({
            id: item.transcript_id,
            name: item.title || "Analisi senza titolo",
            type: item.file_type || "text", 
            // Estrai contentType da item.content, gestendo casi null/undefined
            contentType: item.content?.tipo_contenuto || undefined,
            date: new Date(item.created_at).toLocaleString('it-IT'),
            status: "Completato",
            rawData: item.content // Salva i dati grezzi
          }));
          // --------------------------------------------------------------------------
          
          setAnalysisHistory(rawHistory);
        } catch (error) {
          console.error("Errore nel recupero della cronologia:", error);
          toast({
            title: "Errore Cronologia",
            description: "Impossibile caricare la cronologia delle analisi.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };

    fetchAnalysisHistory();
  }, [activeTab, toast]);

  useEffect(() => {
    console.log("--- DASHBOARD STATE UPDATE (useEffect) ---");
    console.log("Processing Status:", processingStatus);
    console.log("Active Tab:", activeTab);
    // Logga i risultati GREZZI
    console.log("Raw Results State (in useEffect):", JSON.stringify(rawResults, null, 2)); 
    console.log("Transcript ID:", transcriptId);
    console.log("------------------------------------------");
  }, [rawResults, processingStatus, activeTab, transcriptId]);

  const handleSidebarToggle = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  }

  const handleChatOpen = () => {
    if(transcriptId) {
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

  const handleDeleteFile = async (transcriptIdToDelete: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa analisi? L'azione non può essere annullata.")) {
      return;
    }

    console.log(`Tentativo di eliminazione per ID: ${transcriptIdToDelete}`);
    try {
      await deleteAnalysis(transcriptIdToDelete);
      
      setAnalysisHistory(prevHistory => 
        prevHistory.filter(file => file.id !== transcriptIdToDelete)
      );
      
      toast({ 
        title: "Analisi Eliminata", 
        description: "L'analisi selezionata è stata rimossa con successo.",
      });

    } catch (error) {
      console.error("Errore durante l'eliminazione nel componente Dashboard:", error);
      toast({ 
        title: "Errore Eliminazione", 
        description: error instanceof Error ? error.message : "Impossibile eliminare l'analisi.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async (type: string, category: ContentCategory, data: any) => {
    setProcessingStatus("processing");
    console.log(`handleUpload: Avviato - Tipo: ${type}, Categoria Selezionata: ${category}`);

    try {
      let file;
      if (type === "text") {
        const blob = new Blob([data], { type: 'text/plain' });
        file = new File([blob], "transcript.txt", { type: 'text/plain' });
      } else {
        file = data;
      }
      
      const result: RawApiResult = await analyzeMeeting(file, category);
      console.log("handleUpload: Risultato GREZZO dalla API /analyze:", JSON.stringify(result, null, 2)); 

      setRawResults(result);

      setTranscriptId(result?.transcript_id ?? null);
      setSuggestedQuestions(result?.suggested_questions || []);

      setProcessingStatus("completed");
      console.log("handleUpload: Stato 'rawResults' e 'processingStatus' aggiornati.");

    } catch (error) {
       console.error('Errore durante elaborazione:', error);
       setProcessingStatus("failed");
       toast({ title: "Errore Critico", description: "Errore durante la formattazione dei risultati.", variant: "destructive" });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        const showResultsAfterUpload = processingStatus === 'completed' && rawResults;

        return (
          <div className="space-y-6">
            {!showResultsAfterUpload && (
              <UploadSection onUpload={handleUpload} processingStatus={processingStatus} />
            )}

            {processingStatus === 'processing' && <ProcessingStatus status={processingStatus} />}

            {showResultsAfterUpload ? (
              (() => {
                console.log("--- renderContent: Tentativo formattazione per ResultsDisplay ---");
                console.log("Dati grezzi da formattare:", JSON.stringify(rawResults, null, 2));
                const formattedDisplayResults = formatApiResult(rawResults);

                if (!formattedDisplayResults) {
                  console.error("renderContent: Fallita formattazione di rawResults per ResultsDisplay.");
                  toast({ title: "Errore Visualizzazione", description: "Impossibile formattare i risultati per la visualizzazione.", variant: "destructive" });
                  setProcessingStatus("failed");
                  setRawResults(null);
                  return <ProcessingStatus status="failed" />;
                }

                console.log("--- renderContent: TENTATIVO RENDER ResultsDisplay ---");
                console.log("Passando questa prop 'results' (formattata ora):", JSON.stringify(formattedDisplayResults, null, 2));
                return (
                  <ResultsDisplay
                    key={formattedDisplayResults.transcript_id || Date.now()}
                    results={formattedDisplayResults}
                    onChatOpen={handleChatOpen}
                    onDownload={() => handleDownload(formattedDisplayResults)}
                    onShare={() => handleShare(formattedDisplayResults)}
                  />
                );
              })()
            ) : (
              <>
                {processingStatus === 'failed' && <ProcessingStatus status={processingStatus} />}
                <RecentFiles
                  files={analysisHistory}
                  onOpenChat={handleHistoryChatOpen}
                  onDelete={handleDeleteFile}
                  formatApiResult={formatApiResult}
                />
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
         return <UploadSection onUpload={handleUpload} processingStatus={processingStatus} />;
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
