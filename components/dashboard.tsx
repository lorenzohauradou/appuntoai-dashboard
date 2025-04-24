"use client"

import { useState, useEffect } from "react"
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
import { ResultsType } from "@/components/dashboard/types"

// Definisci un tipo più specifico per le categorie valide
type ContentCategory = "Meeting" | "Lezione" | "Intervista";

// Interfaccia per un file recente (cronologia)
interface RecentFile {
  id: string;
  name: string;
  type: string;
  date: string;
  status: string;
  resultsData: ResultsType | null; // Permetti null qui se la formattazione può fallire
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const [results, setResults] = useState<ResultsType | null>(null)
  const [contentType, setContentType] = useState<ContentCategory>("Meeting")
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [transcriptId, setTranscriptId] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [analysisHistory, setAnalysisHistory] = useState<RecentFile[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const { toast } = useToast()

  // Effetto per recuperare la cronologia delle analisi
  useEffect(() => {
    const fetchAnalysisHistory = async () => {
      if (activeTab === "history" || activeTab === "upload") {
        setIsLoadingHistory(true);
        try {
          const historyData = await getAnalysisHistory();
          
          // Mappatura della risposta API al formato richiesto da RecentFiles
          const formattedHistory = historyData.map((item: any) => ({
            id: item.transcript_id,
            name: item.title || "Analisi senza titolo",
            type: item.file_type || "text",
            date: new Date(item.created_at).toLocaleString('it-IT'),
            status: "Completato",
            resultsData: formatApiResult(item.content) // Usa una funzione helper per formattare
          }));
          
          setAnalysisHistory(formattedHistory);
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
    console.log("--- DASHBOARD STATE UPDATE ---");
    console.log("Processing Status:", processingStatus);
    console.log("Active Tab:", activeTab);
    console.log("Results State:", results);
    console.log("Transcript ID:", transcriptId);
    console.log("-----------------------------");
  }, [results, processingStatus, activeTab, transcriptId]);

  const handleSidebarToggle = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  }

  const handleChatOpen = () => {
    setIsChatOpen(true);
  }

  // Handler per aprire la chat da un file della cronologia
  const handleHistoryChatOpen = (transcriptId: string) => {
    setTranscriptId(transcriptId);
    setIsChatOpen(true);
  }

  const handleDownload = () => {
    if (!results) return;
    
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
        const filename = `appuntoai_results_${results.contentType || 'analisi'}.pdf`;
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

  const handleShare = async () => {
    if (!results || !results.summary) return;

    const shareData = {
      title: `Risultati Analisi AppuntoAI (${results.contentType})`,
      text: results.summary, 
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        console.log("Condivisione completata o annullata tramite API Web Share");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(results.summary);
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

  // Funzione helper per formattare i risultati dell'API (sia freschi che dalla cronologia)
  const formatApiResult = (result: any): ResultsType | null => {
    if (!result || !result.tipo_contenuto) {
      console.warn("Dati API non validi o tipo_contenuto mancante:", result);
      // Puoi decidere se restituire null o un oggetto di default
      // In questo caso, proviamo a dedurre un tipo base se manca
      // ma sarebbe meglio assicurarsi che tipo_contenuto sia sempre salvato
      const contentType = result?.tipo_contenuto || 'meeting'; // Fallback a meeting
       return {
         summary: result?.riassunto || "Riassunto non disponibile",
         contentType: contentType,
         decisions: result?.decisioni || [],
         tasks: (result?.tasks || []).map((task: any) => ({
            task: task.descrizione || "",
            assignee: task.assegnatario || "Non specificato",
            deadline: task.scadenza || 'Non specificata',
            priority: task.priorita || 'Media', // Assicurati che 'priorita' esista o gestisci il caso null/undefined
            category: task.categoria || 'Generale',
         })),
         themes: result?.temi_principali || [],
         participants: (result?.partecipanti || []).map((p: any) => ({ name: p.nome, role: p.ruolo })),
         transcript_id: result?.transcript_id || null,
         suggested_questions: result?.suggested_questions || [],
         // Aggiungi qui altri campi specifici per tipo se necessario, 
         // gestendo i casi in cui potrebbero mancare
         keyPoints: result?.concetti_chiave || [], // Per lezione
         exercises: (result?.esercizi || []).map((ex: any) => ({ description: ex.descrizione, deadline: ex.scadenza, date_iso: ex.data_iso })), // Per lezione
         topics: result?.argomenti || [], // Per lezione
         possibleQuestions: result?.possibili_domande_esame || [], // Per lezione
         // ... altri campi specifici per intervista, etc.
       };
    }

    const category = result.tipo_contenuto; // Dovrebbe essere 'meeting', 'lezione', 'intervista'

    let formattedResults: ResultsType;

     if (category === "lezione") {
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
          teacher: result.docente || null,
          transcript_id: result.transcript_id,
          suggested_questions: result.suggested_questions || [],
        };
      } else if (category === "intervista") {
         formattedResults = {
           summary: result.riassunto || "",
           contentType: "intervista" as const,
           questions: result.domande_principali || [],
           answers: result.risposte_chiave || [],
           participants: (result.partecipanti || []).map((participant: { nome: string; ruolo?: string }) => ({
            name: participant.nome || "Non specificato",
            role: participant.ruolo || 'Intervistatore/Intervistato',
           })),
           themes: result.temi_principali || [],
           transcript_id: result.transcript_id,
           suggested_questions: result.suggested_questions || [],
         };
      } else { // Default a meeting se non è lezione o intervista
        formattedResults = {
          summary: result.riassunto || "",
          contentType: "meeting" as const,
          decisions: result.decisioni || [],
          tasks: (result.tasks || []).map((task: { descrizione: string; assegnatario?: string; scadenza?: string; priorita?: string; categoria?: string }) => ({
            task: task.descrizione || "",
            assignee: task.assegnatario || "Non specificato",
            deadline: task.scadenza || 'Non specificata',
            priority: task.priorita || 'Media', // Assicurati che 'priorita' sia presente nel DB
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
      return formattedResults;
  }

  // Handler per l'eliminazione di un file dalla cronologia
  const handleDeleteFile = async (transcriptIdToDelete: string) => {
     // Aggiungi una conferma prima di eliminare
    if (!confirm("Sei sicuro di voler eliminare questa analisi? L'azione non può essere annullata.")) {
      return; // L'utente ha annullato
    }

    console.log(`Tentativo di eliminazione per ID: ${transcriptIdToDelete}`);
    try {
      await deleteAnalysis(transcriptIdToDelete); // Chiama la funzione API
      
      // Aggiorna lo stato rimuovendo il file
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
    setContentType(category);
    console.log(`Upload avviato - Tipo: ${type}, Categoria: ${category}`);

    try {
      let file;
      
      if (type === "text") {
        const blob = new Blob([data], { type: 'text/plain' });
        file = new File([blob], "transcript.txt", { type: 'text/plain' });
      } else {
        file = data;
      }
      
      const result = await analyzeMeeting(file, category);
      
      setTranscriptId(result.transcript_id);
      setSuggestedQuestions(result.suggested_questions || []);
            
      console.log("Tipo di contenuto selezionato dall'utente:", category);
      console.log("Campi disponibili nell'API response:", Object.keys(result));
      
      let formattedResults: ResultsType | null = null;
      
      // Usa la funzione helper anche qui per consistenza
      formattedResults = formatApiResult(result);

      if (!formattedResults) {
         console.error("Formattazione fallita per i risultati API:", result);
         throw new Error("Impossibile formattare i risultati dell'analisi.");
      }
      
      setResults(formattedResults);
      setProcessingStatus("completed");
      setActiveTab("results");

      // Aggiorna la cronologia dopo un'analisi completata con successo
      const fetchAnalysisHistory = async () => {
        try {
          const historyData = await getAnalysisHistory();
          
          const formattedHistory = historyData.map((item: any) => ({
            id: item.transcript_id,
            name: item.title || "Analisi senza titolo",
            type: item.file_type || "text",
            date: new Date(item.created_at).toLocaleString('it-IT'),
            status: "Completato",
            resultsData: formatApiResult(item.content) // Applica formattazione anche qui
          }));
          
          setAnalysisHistory(formattedHistory);
        } catch (error) {
          console.error("Errore nell'aggiornamento della cronologia:", error);
        }
      };

      fetchAnalysisHistory();

    } catch (error) {
      console.error('Errore durante elaborazione:', error);
      setProcessingStatus("failed");
      toast({ 
        title: "Errore Elaborazione",
        description: "Si è verificato un errore durante l'analisi del contenuto.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return (
          <div className="space-y-6">
            <UploadSection onUpload={handleUpload} processingStatus={processingStatus} />
            {processingStatus && <ProcessingStatus status={processingStatus} />}
            <RecentFiles 
              files={analysisHistory} 
              onOpenChat={handleHistoryChatOpen} 
              onDelete={handleDeleteFile}
            />
          </div>
        )
      case "results":
        return results ? (
          <ResultsDisplay 
            results={results} 
            onChatOpen={handleChatOpen} 
            onDownload={handleDownload}
            onShare={handleShare}
          />
        ) : (
          <div className="container max-w-4xl mx-auto py-8">
            <div className="space-y-6" id="results-placeholder">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Risultati dell'analisi</h1>
                  <p className="text-muted-foreground">
                    Ecco il riepilogo dettagliato della tua analisi
                  </p>
                </div>
              </div>
              
              <div className="mt-12 p-8 border rounded-lg shadow-sm bg-white/50 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
                <h2 className="text-xl font-medium mb-2">Nessun documento analizzato</h2>
                <p className="text-muted-foreground max-w-md">
                  Carica un documento dalla sezione "Carica File" per vedere qui i risultati dell'analisi
                </p>
                <button 
                  className="mt-6 px-4 py-2 rounded-md bg-primary text-white font-medium"
                  onClick={() => setActiveTab("upload")}
                >
                  Vai a Carica File
                </button>
              </div>
            </div>
          </div>
        )
      case "history":
        return <RecentFiles 
                 files={analysisHistory} 
                 onOpenChat={handleHistoryChatOpen} 
                 onDelete={handleDeleteFile}
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
        return <UploadSection onUpload={handleUpload} processingStatus={processingStatus} />
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
          suggestedQuestions={suggestedQuestions || []}
        />
      )}
    </div>
  )
}
