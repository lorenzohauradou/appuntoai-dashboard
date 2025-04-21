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
import { analyzeMeeting, sendChatMessage } from "@/lib/api"
import { ChatDialog } from "@/components/dashboard/chat-dialog"
import { useToast } from "@/components/ui/use-toast"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResultsType } from "@/components/dashboard/types"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const [results, setResults] = useState<ResultsType | null>(null)
  const [contentType, setContentType] = useState<"meeting" | "lezione" | "intervista">("meeting")
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [transcriptId, setTranscriptId] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const { toast } = useToast()

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

  const handleUpload = async (type: string, data: any) => {
    setProcessingStatus("processing");
    
    try {
      let file;
      
      if (type === "text") {
        const blob = new Blob([data], { type: 'text/plain' });
        file = new File([blob], "transcript.txt", { type: 'text/plain' });
      } else {
        file = data;
      }
      
      const result = await analyzeMeeting(file);
      
      setTranscriptId(result.transcript_id);
      setSuggestedQuestions(result.suggested_questions || []);
      
      let documentType: "meeting" | "lezione" | "intervista" = "meeting";
      
      if ((result.possibili_domande_esame !== undefined && result.possibili_domande_esame !== null) || 
          (result.concetti_chiave !== undefined && result.concetti_chiave !== null && result.concetti_chiave.length > 0)) {
        documentType = "lezione";
        console.log("Rilevato tipo: LEZIONE basato su possibili_domande_esame o concetti_chiave non nulli");
      } 
      else if ((result.decisioni !== undefined && result.decisioni !== null && result.decisioni.length > 0) || 
               (result.temi_principali !== undefined && result.temi_principali !== null && result.temi_principali.length > 0)) {
        documentType = "meeting";
        console.log("Rilevato tipo: MEETING basato su decisioni o temi_principali non nulli");
      } 
      else if (result.tipo_contenuto === 'meeting') {
        documentType = "meeting";
        console.log("Rilevato tipo: MEETING basato su tipo_contenuto");
      }
      else if (result.domande_principali !== undefined && result.domande_principali !== null) {
        documentType = "intervista";
        console.log("Rilevato tipo: INTERVISTA basato su domande_principali");
      }

      setContentType(documentType);
      
      console.log("Tipo di contenuto rilevato:", documentType);
      console.log("Campi disponibili nell'API response:", Object.keys(result));
      
      let formattedResults;
      
      if (documentType === "lezione") {
        formattedResults = {
          summary: result.riassunto,
          contentType: "lezione" as const,
          keyPoints: result.concetti_chiave || [],
          exercises: result.esercizi || [],
          topics: result.argomenti || [],
          participants: (result.partecipanti || []).map((participant: { nome: string; ruolo: string }) => ({
            name: participant.nome || "Non specificato",
            role: participant.ruolo || 'Docente/Relatore',
          })),
          possibleQuestions: result.possibili_domande_esame || [],
          bibliography: result.bibliografia || [],
          teacher: result.docente,
          transcript_id: result.transcript_id,
          suggested_questions: result.suggested_questions || [],
        };
      } else {
        formattedResults = {
          summary: result.riassunto,
          contentType: "meeting" as const,
          decisions: result.decisioni || [],
          tasks: (result.tasks || []).map((task: { descrizione: string; assegnatario: string; scadenza?: string; priorita?: string; categoria?: string }) => ({
            task: task.descrizione,
            assignee: task.assegnatario,
            deadline: task.scadenza || 'Non specificata',
            priority: task.priorita || 'Media',
            category: task.categoria || 'Generale',
          })),
          themes: result.temi_principali || [],
          participants: (result.partecipanti || []).map((participant: { nome: string; ruolo: string }) => ({
            name: participant.nome || "Non specificato",
            role: participant.ruolo || 'Partecipante',
          })),
          transcript_id: result.transcript_id,
          suggested_questions: result.suggested_questions || [],
        };
      }
      
      console.log("Risultati formattati:", formattedResults);
      console.log("Tipo di contenuto in formattedResults:", formattedResults.contentType);
      console.log("Decisioni incluse:", formattedResults.decisions ? formattedResults.decisions.length : "nessuna");
      console.log("Temi inclusi:", formattedResults.themes ? formattedResults.themes.length : "nessuno");
      
      setResults(formattedResults);
      setProcessingStatus("completed");
      setActiveTab("results");
    } catch (error) {
      console.error('Errore durante l\'elaborazione:', error);
      setProcessingStatus("failed");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return (
          <div className="space-y-6">
            <UploadSection onUpload={handleUpload} />
            {processingStatus && <ProcessingStatus status={processingStatus} />}
            <RecentFiles />
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
        return <RecentFiles />
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
        return <UploadSection onUpload={handleUpload} />
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
