"use client"

import { useState } from "react"
import type React from 'react';
import { 
  FileText, 
  CheckCircle, 
  ListTodo, 
  Users, 
  Hash, 
  Download, 
  Share2, 
  MessageSquare, 
  Book, 
  GraduationCap, 
  Lightbulb,
  HelpCircle,
  BookOpen,
  AlertTriangle,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MeetingResults, LectureResults, ResultsType, ResultsDisplayProps } from "./types"

//  tipo più specifico per lo stile della priorità
type PriorityStyle = {
  variant: "destructive" | "default" | "secondary" | "outline";
  icon: React.ReactNode | null;
  className: string;
}

export function ResultsDisplay({ results, onChatOpen, onDownload, onShare }: ResultsDisplayProps) {
  // Log #1: Controlla le props ricevute all'inizio
  console.log("--- ResultsDisplay RENDER ---");
  console.log("Props ricevute:", results);
  console.log("ContentType:", results.contentType); // Conferma il tipo

  const [activeTab, setActiveTab] = useState(results.contentType === "lezione" ? "summary" : "summary")

  const getPriorityStyles = (priority: string): PriorityStyle => {
    // Verifichiamo che priority sia una stringa valida prima di chiamare toLowerCase()
    if (!priority) {
      // Caso di default se priority è undefined, null o una stringa vuota
      return {
        variant: "outline",
        icon: null,
        className: "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100",
      };
    }
    
    switch (priority.toLowerCase()) {
      case "alta":
        return {
          variant: "outline",
          icon: <AlertTriangle className="h-3.5 w-3.5 text-red-600" />,
          className: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
        }
      case "media":
        return {
          variant: "outline",
          icon: <AlertCircle className="h-3.5 w-3.5 text-amber-600" />,
          className: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
        }
      case "bassa":
        return {
          variant: "outline",
          icon: <CheckCircle className="h-3.5 w-3.5 text-green-600" />,
          className: "border-green-300 bg-green-50 text-green-700 hover:bg-green-100",
        }
      default:
        return {
          variant: "outline",
          icon: null,
          className: "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100",
        }
    }
  }

  // Determina i tab da mostrare in base al tipo di contenuto
  const renderTabs = () => {
    // Log #2: Verifica quale set di TabsList viene scelto
    console.log("ResultsDisplay: renderTabs - ContentType =", results.contentType); 
    if (results.contentType === "lezione") {
      return (
        <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-6">
          <TabsTrigger value="summary" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <FileText className="mr-2 h-4 w-4" />
            Riassunto
          </TabsTrigger>
          <TabsTrigger value="keyPoints" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Lightbulb className="mr-2 h-4 w-4" />
            Concetti Chiave
          </TabsTrigger>
          <TabsTrigger value="topics" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Book className="mr-2 h-4 w-4" />
            Argomenti
          </TabsTrigger>
          {(results as LectureResults).exercises.length > 0 && (
            <TabsTrigger value="exercises" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <BookOpen className="mr-2 h-4 w-4" />
              Esercizi
            </TabsTrigger>
          )}
          <TabsTrigger value="questions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <HelpCircle className="mr-2 h-4 w-4" />
            Domande Esame
          </TabsTrigger>
          <TabsTrigger value="participants" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Users className="mr-2 h-4 w-4" />
            Partecipanti
          </TabsTrigger>
        </TabsList>
      )
    } else {
      // Meeting e altri tipi
      return (
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="summary" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <FileText className="mr-2 h-4 w-4" />
            Riassunto
          </TabsTrigger>
          <TabsTrigger value="decisions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <CheckCircle className="mr-2 h-4 w-4" />
            Decisioni
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <ListTodo className="mr-2 h-4 w-4" />
            Task
          </TabsTrigger>
          <TabsTrigger value="themes" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Hash className="mr-2 h-4 w-4" />
            Temi
          </TabsTrigger>
          <TabsTrigger value="participants" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Users className="mr-2 h-4 w-4" />
            Partecipanti
          </TabsTrigger>
        </TabsList>
      )
    }
  }

  // Render condizionale del contenuto dei tab
  const renderTabsContent = () => {
    // Log #3: Verifica quale blocco di contenuto viene scelto
    console.log("ResultsDisplay: renderTabsContent - ContentType =", results.contentType);

    // Contenuto comune a tutti i tipi
    const commonTabs = (
      <>
        <TabsContent value="summary" className="mt-0">
          <Card className="border-0 shadow-md bg-white p-14 md:p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle>Riassunto</CardTitle>
              <CardDescription>Una sintesi del contenuto analizzato</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-lg">{results.summary}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="mt-0">
          <Card className="border-0 shadow-md bg-white p-14 md:p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle>Partecipanti</CardTitle>
              <CardDescription>
                {results.contentType === "lezione" 
                  ? "Docenti e studenti coinvolti" 
                  : "Le persone coinvolte e i loro ruoli"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.participants && results.participants.length > 0 ? ( // Aggiunto check esplicito per results.participants
                  results.participants.map((participant, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary">
                        {participant.name ? participant.name.charAt(0) : "?"}
                      </div>
                      <div>
                        <p className="font-medium">{participant.name || "Non identificato"}</p>
                        <p className="text-sm text-muted-foreground">{participant.role}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Nessun partecipante identificato</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </>
    )

    // Tab specifici per le lezioni
    if (results.contentType === "lezione") {
      const lectureResults = results as LectureResults;
      return (
        <>
          {commonTabs}
          
          <TabsContent value="keyPoints" className="mt-0">
            <Card className="border-0 shadow-md bg-white p-14 md:p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Concetti Chiave</CardTitle>
                <CardDescription>I concetti fondamentali della lezione</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap gap-2">
                  {lectureResults.keyPoints.length > 0 ? (
                    lectureResults.keyPoints.map((concept, index) => (
                      <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3 bg-primary-100 text-primary">
                        {concept}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Nessun concetto chiave identificato</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics" className="mt-0">
            <Card className="border-0 shadow-md bg-white p-14 md:p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Argomenti</CardTitle>
                <CardDescription>Gli argomenti trattati durante la lezione</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-4">
                  {lectureResults.topics.length > 0 ? (
                    lectureResults.topics.map((topic, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                        <Book className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span>{topic}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Nessun argomento identificato</p>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {lectureResults.exercises.length > 0 && (
            <TabsContent value="exercises" className="mt-0">
              <Card className="border-0 shadow-md bg-white p-14 md:p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Esercizi</CardTitle>
                  <CardDescription>Esercizi e attività pratiche menzionate</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="space-y-4">
                    {lectureResults.exercises.map((exercise, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                        <BookOpen className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>{exercise.description}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="questions" className="mt-0">
            <Card className="border-0 shadow-md bg-white p-14 md:p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Possibili Domande d'Esame</CardTitle>
                <CardDescription>Domande che potrebbero emergere da questo contenuto</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-4">
                  {lectureResults.possibleQuestions.length > 0 ? (
                    lectureResults.possibleQuestions.map((question, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                        <HelpCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <span>{question}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Nessuna possibile domanda identificata</p>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </>
      )
    } else {
      // Meeting e altri tipi
      const meetingResults = results as MeetingResults;
      // Log #6: Controlla i dati specifici del meeting
      console.log("ResultsDisplay: Rendering Meeting Content - Data:", meetingResults);
      return (
        <>
          {commonTabs}
          
          <TabsContent value="decisions" className="mt-0">
            <Card className="border-0 shadow-md bg-white p-14 md:p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Decisioni prese</CardTitle>
                <CardDescription>Le decisioni chiave identificate nel contenuto</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-4">
                  {meetingResults.decisions && meetingResults.decisions.length > 0 ? ( // Aggiunto check esplicito
                    meetingResults.decisions.map((decision, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>{decision}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Nessuna decisione identificata</p>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <Card className="border-0 shadow-md bg-white p-14 md:p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Task identificati</CardTitle>
                <CardDescription>Attività da completare con assegnatari e scadenze</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  {meetingResults.tasks && meetingResults.tasks.length > 0 ? ( // Aggiunto check esplicito
                    meetingResults.tasks.map((task, index) => {
                      const priorityStyles = getPriorityStyles(task.priority);
                      return (
                        <div key={index} className="p-4 rounded-lg border bg-white shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <h3 className="font-semibold text-lg flex-1">
                              <span className="text-primary mr-2">Task {index + 1}:</span>
                              {task.task}
                            </h3>
                            <Badge variant={priorityStyles.variant} className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 ${priorityStyles.className}`}>
                              {priorityStyles.icon}
                              {task.priority || "Non specificata"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 text-sm mt-2">
                            <div className="flex items-center gap-1.5">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Assegnato a:</span>
                              <span className="font-medium">{task.assignee || "Non specificato"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ListTodo className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Scadenza:</span>
                              <span className="font-medium">{task.deadline || "Non specificata"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Hash className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Categoria:</span>
                              <span className="font-medium">{task.category || "Generale"}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Nessun task identificato</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="themes" className="mt-0">
            <Card className="border-0 shadow-md bg-white p-14 md:p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Temi principali</CardTitle>
                <CardDescription>Gli argomenti chiave discussi</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap gap-2">
                  {meetingResults.themes && meetingResults.themes.length > 0 ? ( // Aggiunto check esplicito
                    meetingResults.themes.map((theme, index) => (
                      <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3 bg-primary-100 text-primary">
                        {theme}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Nessun tema principale identificato</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </>
      )
    }
  }

  // Log #10: Controlla se il componente arriva a fare il return finale
  console.log("--- ResultsDisplay: Fine Render Function ---");
  return (
    <div id="results-export-area" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Risultati dell'analisi</h1>
          <p className="text-muted-foreground">
            {results.contentType === "lezione" 
              ? "Ecco cosa abbiamo estratto dalla lezione" 
              : "Ecco cosa abbiamo trovato nel tuo meeting"}
          </p>
        </div>
        <div className="flex gap-2">
          {results.transcript_id && (
            <Button onClick={onChatOpen} className="gap-2 bg-primary text-white">
              <MessageSquare className="h-4 w-4" />
              Chatta con il documento!
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={onDownload}>
            <Download className="h-4 w-4" />
            Scarica
          </Button>
          <Button variant="outline" className="gap-2" onClick={onShare}>
            <Share2 className="h-4 w-4" />
            Condividi
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        {renderTabs()}
        {renderTabsContent()}
      </Tabs>
    </div>
  )
}
