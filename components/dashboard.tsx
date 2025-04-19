"use client"

import { useState } from "react"
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

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const [results, setResults] = useState<any | null>(null)
  const [contentType, setContentType] = useState<"meeting" | "lezione" | "intervista">("meeting")
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [transcriptId, setTranscriptId] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])

  const handleSidebarToggle = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  }

  const handleChatOpen = () => {
    setIsChatOpen(true);
  }

  const handleUpload = async (type: string, data: any) => {
    setProcessingStatus("processing");
    
    try {
      let file;
      
      if (type === "text") {
        // Converti il testo in un file
        const blob = new Blob([data], { type: 'text/plain' });
        file = new File([blob], "transcript.txt", { type: 'text/plain' });
      } else {
        file = data;
      }
      
      const result = await analyzeMeeting(file);
      
      // Salva i dati per la chat
      setTranscriptId(result.transcript_id);
      setSuggestedQuestions(result.suggested_questions || []);
      
      // Determina il tipo di contenuto in base alla risposta
      let documentType: "meeting" | "lezione" | "intervista" = "meeting";
      
      if (result.possibili_domande_esame !== undefined) {
        documentType = "lezione";
      } else if (result.decisioni !== undefined) {
        documentType = "meeting";
      } else if (result.domande_principali !== undefined) {
        documentType = "intervista";
      }

      // Imposta lo stato del tipo di contenuto
      setContentType(documentType);
      
      console.log("Tipo di contenuto rilevato:", documentType);
      console.log("Campi disponibili nell'API response:", Object.keys(result));
      
      // Formatta i risultati in base al tipo di documento rilevato
      let formattedResults;
      
      if (documentType === "lezione") {
        formattedResults = {
          summary: result.riassunto,
          contentType: "lezione",
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
        // Per meeting e altri tipi
        formattedResults = {
          summary: result.riassunto,
          contentType: "meeting",
          decisions: result.decisioni || [],
          tasks: (result.tasks || []).map((task: { descrizione: string; assegnato_a: string; scadenza?: string }) => ({
            task: task.descrizione,
            assignee: task.assegnato_a,
            deadline: task.scadenza || 'Non specificata',
            priority: 'Media',
            category: 'Generale',
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
        return results && <ResultsDisplay results={results} onChatOpen={handleChatOpen} />
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
