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

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const [results, setResults] = useState<any | null>(null)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const handleSidebarToggle = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  }

  const handleUpload = (type: string, data: any) => {
    setProcessingStatus("processing")

    // Simulate processing
    setTimeout(() => {
      setProcessingStatus("completed")
      setResults({
        summary: "Questa è una riunione di pianificazione del progetto X.",
        decisions: [
          "Lanciare il prodotto entro fine mese",
          "Assumere due nuovi sviluppatori",
          "Aumentare il budget marketing del 15%",
        ],
        tasks: [
          {
            task: "Finalizzare il design",
            assignee: "Marco",
            deadline: "2023-06-15",
            priority: "Alta",
            category: "Design",
          },
          {
            task: "Completare il backend",
            assignee: "Giulia",
            deadline: "2023-06-20",
            priority: "Alta",
            category: "Sviluppo",
          },
          {
            task: "Preparare materiali marketing",
            assignee: "Sofia",
            deadline: "2023-06-25",
            priority: "Media",
            category: "Marketing",
          },
        ],
        themes: ["Design del prodotto", "Pianificazione risorse", "Strategia di lancio"],
        participants: [
          { name: "Alessandro", role: "Project Manager" },
          { name: "Marco", role: "Designer" },
          { name: "Giulia", role: "Sviluppatore" },
          { name: "Sofia", role: "Marketing" },
        ],
      })
      setActiveTab("results")
    }, 3000)
  }

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
