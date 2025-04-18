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
import { analyzeMeeting } from "@/lib/api"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const [results, setResults] = useState<any | null>(null)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const handleSidebarToggle = (expanded: boolean) => {
    setSidebarExpanded(expanded);
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
      
      // Trasforma i dati dal formato API al formato frontend
      const formattedResults = {
        summary: result.riassunto,
        decisions: result.decisioni,
        tasks: result.tasks.map((task: { descrizione: string; assegnato_a: string; scadenza?: string }) => ({
          task: task.descrizione,
          assignee: task.assegnato_a,
          deadline: task.scadenza || 'Non specificata',
          priority: 'Media',
          category: 'Generale',
        })),
        themes: result.temi_principali,
        participants: result.partecipanti.map((participant: { nome: string; ruolo: string }) => ({
          name: participant.nome,
          role: participant.ruolo || 'Partecipante',
        })),
      };
      
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
        return results && <ResultsDisplay results={results} />
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
    </div>
  )
}
