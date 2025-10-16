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
import { useToast } from "@/src/components/ui/use-toast"
import { ResultsType, RawApiResult } from "@/src/components/dashboard/types"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { formatApiResult } from "@/src/lib/formatters"
import { useAnalysisHistory } from "@/src/hooks/use-analysis-history"



export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const [rawResults, setRawResults] = useState<RawApiResult | null>(null)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [transcriptId, setTranscriptId] = useState<string | null>(null)
  const { toast } = useToast()

  const { analysisHistory, isLoadingHistory, handleDeleteFile, refreshHistory } = useAnalysisHistory();

  // --- DEFINIZIONE DI handleAnalysisComplete (prima di usarla) ---
  const handleAnalysisComplete = useCallback((results: ResultsType) => {
    console.log("Dashboard: Analysis complete, showing results.", results);
    setRawResults(results);
    setProcessingStatus("completed");
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
    if (transcriptId && rawResults) {
      const fileName = rawResults.title || "Lezione";
      const chatUrl = `/chat?transcriptId=${transcriptId}&fileName=${encodeURIComponent(fileName)}`;
      window.open(chatUrl, '_blank', 'width=1200,height=800');
    } else {
      console.warn("Tentativo di aprire la chat senza transcriptId valido");
      toast({ title: "Attendi...", description: "ID trascrizione non ancora pronto." });
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
                {processingStatus !== 'processing' && (
                  <UploadSection
                    onAnalysisComplete={handleAnalysisComplete}
                    formatApiResult={formatApiResult}
                  />
                )}
                {processingStatus === 'processing' && <ProcessingStatus status={processingStatus} />}
                {processingStatus === 'failed' && <ProcessingStatus status={processingStatus} />}
              </>
            )}

            {showResultsAfterUpload && (
              <div className="animate-fadeIn">
                <Button onClick={() => { setRawResults(null); setProcessingStatus(null); }} variant="outline" className="gap-2 mb-4">
                  <ArrowLeft className="h-4 w-4" />
                  Carica un Altro Contenuto
                </Button>
                <ResultsDisplay
                  key={rawResults.transcript_id || Date.now()}
                  results={rawResults}
                  onChatOpen={handleChatOpen}
                />
              </div>
            )}
          </div>
        )
      case "results":
      case "history":
        return <RecentFiles
          files={analysisHistory}
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
    </div>
  )
}
