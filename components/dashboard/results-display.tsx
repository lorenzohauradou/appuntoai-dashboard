"use client"

import { useState } from "react"
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
  BookOpen
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MeetingResults {
  contentType: "meeting";
  summary: string;
  decisions: string[];
  tasks: {
    task: string;
    assignee: string;
    deadline: string;
    priority: string;
    category: string;
  }[];
  themes: string[];
  participants: {
    name: string;
    role: string;
  }[];
  transcript_id?: string;
  suggested_questions?: string[];
}

interface LectureResults {
  contentType: "lezione";
  summary: string;
  keyPoints: string[];
  exercises: string[];
  topics: string[];
  participants: {
    name: string;
    role: string;
  }[];
  possibleQuestions: string[];
  bibliography: string[];
  teacher: string | null;
  transcript_id?: string;
  suggested_questions?: string[];
}

type ResultsType = MeetingResults | LectureResults;

interface ResultsDisplayProps {
  results: ResultsType;
  onChatOpen: () => void;
}

export function ResultsDisplay({ results, onChatOpen }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState(results.contentType === "lezione" ? "summary" : "summary")

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "alta":
        return "bg-red-100 text-red-800"
      case "media":
        return "bg-amber-100 text-amber-800"
      case "bassa":
        return "bg-green-100 text-green-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  // Determina i tab da mostrare in base al tipo di contenuto
  const renderTabs = () => {
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
    // Contenuto comune a tutti i tipi
    const commonTabs = (
      <>
        <TabsContent value="summary" className="mt-0">
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle>Riassunto</CardTitle>
              <CardDescription>Una sintesi del contenuto analizzato</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{results.summary}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="mt-0">
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle>Partecipanti</CardTitle>
              <CardDescription>
                {results.contentType === "lezione" 
                  ? "Docenti e studenti coinvolti" 
                  : "Le persone coinvolte e i loro ruoli"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.participants.length > 0 ? (
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
            <Card className="border-0 shadow-md bg-white">
              <CardHeader>
                <CardTitle>Concetti Chiave</CardTitle>
                <CardDescription>I concetti fondamentali della lezione</CardDescription>
              </CardHeader>
              <CardContent>
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
            <Card className="border-0 shadow-md bg-white">
              <CardHeader>
                <CardTitle>Argomenti</CardTitle>
                <CardDescription>Gli argomenti trattati durante la lezione</CardDescription>
              </CardHeader>
              <CardContent>
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
              <Card className="border-0 shadow-md bg-white">
                <CardHeader>
                  <CardTitle>Esercizi</CardTitle>
                  <CardDescription>Esercizi e attività pratiche menzionate</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {lectureResults.exercises.map((exercise, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                        <BookOpen className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>{exercise}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="questions" className="mt-0">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader>
                <CardTitle>Possibili Domande d'Esame</CardTitle>
                <CardDescription>Domande che potrebbero emergere da questo contenuto</CardDescription>
              </CardHeader>
              <CardContent>
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
      return (
        <>
          {commonTabs}
          
          <TabsContent value="decisions" className="mt-0">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader>
                <CardTitle>Decisioni prese</CardTitle>
                <CardDescription>Le decisioni chiave identificate nel contenuto</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {meetingResults.decisions.length > 0 ? (
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
            <Card className="border-0 shadow-md bg-white">
              <CardHeader>
                <CardTitle>Task identificati</CardTitle>
                <CardDescription>Attività da completare con assegnatari e scadenze</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meetingResults.tasks.length > 0 ? (
                    meetingResults.tasks.map((task, index) => (
                      <div key={index} className="p-4 rounded-lg border">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h3 className="font-medium">{task.task}</h3>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Assegnato a:</span>
                            <span className="font-medium">{task.assignee}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Scadenza:</span>
                            <span className="font-medium">{task.deadline}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Categoria:</span>
                            <span className="font-medium">{task.category}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Nessun task identificato</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="themes" className="mt-0">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader>
                <CardTitle>Temi principali</CardTitle>
                <CardDescription>Gli argomenti chiave discussi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {meetingResults.themes.length > 0 ? (
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Risultati dell'analisi</h1>
          <p className="text-muted-foreground">
            {results.contentType === "lezione" 
              ? "Ecco cosa abbiamo estratto dalla lezione" 
              : "Ecco cosa abbiamo trovato nel tuo contenuto"}
          </p>
        </div>
        <div className="flex gap-2">
          {results.transcript_id && (
            <Button onClick={onChatOpen} className="gap-2 bg-primary text-white">
              <MessageSquare className="h-4 w-4" />
              Chatta con il documento
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Scarica
          </Button>
          <Button variant="outline" className="gap-2">
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
