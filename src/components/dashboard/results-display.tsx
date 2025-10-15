"use client"

import { useState } from "react"
import type React from 'react';
import {
  FileText,
  Users,
  MessageSquare,
  Book,
  GraduationCap,
  Lightbulb,
  HelpCircle,
  Copy,
  FileType
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { LectureResults, ResultsDisplayProps } from "./types"
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog"
import { Loader2 } from "lucide-react"

export function ResultsDisplay({ results, onChatOpen }: ResultsDisplayProps) {

  const [activeTab, setActiveTab] = useState("summary")
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false)
  const lectureResults = results as LectureResults;

  // Funzione per copiare il riassunto
  const handleCopySummary = async () => {
    if (!results.summary) {
      toast.error("Errore Copia", { description: "Il riassunto è vuoto." });
      return;
    }
    try {
      await navigator.clipboard.writeText(results.summary);
      toast.success("Riassunto Copiato!", { description: "Il riassunto è stato copiato negli appunti." });
    } catch (err) {
      toast.error("Errore Copia", { description: "Impossibile copiare il riassunto negli appunti." });
    }
  };

  const handleTranscriptOpen = async () => {
    if (!results.transcript_id) return;

    setIsTranscriptOpen(true);

    if (transcript) return;

    setIsLoadingTranscript(true);
    try {
      const response = await fetch(`/api/transcript/${results.transcript_id}`);
      if (!response.ok) {
        throw new Error('Errore nel recupero della trascrizione');
      }
      const data = await response.json();
      setTranscript(data.transcript);
    } catch (error) {
      toast.error("Errore", { description: "Impossibile recuperare la trascrizione" });
      setIsTranscriptOpen(false);
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  const handleCopyTranscript = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      toast.success("Trascrizione Copiata!", { description: "La trascrizione è stata copiata negli appunti." });
    } catch (err) {
      toast.error("Errore Copia", { description: "Impossibile copiare la trascrizione." });
    }
  };

  const renderTabs = () => {
    return (
      <TabsList className="flex flex-wrap md:grid md:grid-cols-5 mb-6">
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
        <TabsTrigger value="examQuestions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          <HelpCircle className="mr-2 h-4 w-4" />
          Domande Esame
        </TabsTrigger>
        <TabsTrigger value="participants" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          <Users className="mr-2 h-4 w-4" />
          Partecipanti
        </TabsTrigger>
      </TabsList>
    )
  }

  const renderTabsContent = () => {
    return (
      <>
        <TabsContent value="summary" className="mt-8 w-full">
          <Card className="border-0 shadow-md bg-white p-4 px-5 md:p-6 w-full">
            <CardHeader className="p-0 mb-4 pt-5 flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="break-words">Riassunto</CardTitle>
                <CardDescription className="break-words mt-1">
                  Una sintesi degli argomenti trattati nella lezione
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySummary}
                className="border-primary/30 text-primary hover:text-primary flex-shrink-0 flex items-center gap-1.5"
                aria-label="Copia riassunto"
              >
                <Copy className="h-4 w-4" />
                <span>Copia</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0 w-full">
              <p className="text-lg break-words">{results.summary}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="mt-8 w-full">
          <Card className="border-0 shadow-md bg-white p-4 px-5 md:p-6 w-full">
            <CardHeader className="p-0 mb-4 pt-5">
              <CardTitle className="break-words">Partecipanti</CardTitle>
              <CardDescription className="break-words">
                Docenti e studenti coinvolti
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                {results.participants && results.participants.length > 0 ? (
                  results.participants.map((participant, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border w-full">
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

        <TabsContent value="keyPoints" className="mt-8 w-full">
          <Card className="border-0 shadow-md bg-white p-4 px-5 md:p-6 w-full">
            <CardHeader className="p-0 mb-4 pt-5">
              <CardTitle className="break-words">Concetti Chiave</CardTitle>
              <CardDescription className="break-words">I concetti fondamentali della lezione</CardDescription>
            </CardHeader>
            <CardContent className="p-0 w-full">
              <div className="flex flex-wrap gap-2 w-full">
                {lectureResults.keyPoints.length > 0 ? (
                  lectureResults.keyPoints.map((concept, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3.5 bg-primary-100 text-primary">
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

        <TabsContent value="topics" className="mt-8 w-full">
          <Card className="border-0 shadow-md bg-white p-4 px-5 md:p-6 w-full">
            <CardHeader className="p-0 mb-4 pt-5">
              <CardTitle className="break-words">Argomenti</CardTitle>
              <CardDescription className="break-words">Gli argomenti trattati durante la lezione</CardDescription>
            </CardHeader>
            <CardContent className="p-0 w-full">
              <ul className="space-y-4 w-full">
                {lectureResults.topics.length > 0 ? (
                  lectureResults.topics.map((topic, index) => (
                    <li key={index} className="flex items-start gap-3 p-4 rounded-lg border overflow-hidden w-full">
                      <Book className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{topic}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Nessun argomento identificato</p>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examQuestions" className="mt-8 w-full">
          <Card className="border-0 shadow-md bg-white p-4 px-5 md:p-6 w-full">
            <CardHeader className="p-0 mb-4 pt-5">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap /> Possibili Domande d'Esame
              </CardTitle>
              <CardDescription>
                Domande che potrebbero emergere da questo contenuto
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 w-full">
              <ul className="space-y-3">
                {lectureResults.possibleQuestions.length > 0 ? (
                  lectureResults.possibleQuestions.map((question, i) => (
                    <li key={i} className="flex items-start gap-3 p-4 rounded-lg border overflow-hidden w-full">
                      <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="break-words">{question}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Nessuna domanda d'esame suggerita.</p>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </>
    )
  }

  return (
    <div id="results-export-area" className="w-full space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold">Risultati dell'analisi</h1>
          <p className="text-muted-foreground">
            Ecco cosa abbiamo estratto dalla lezione
          </p>
        </div>
        {results.transcript_id && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={onChatOpen} className="gap-2 bg-primary text-white">
              <MessageSquare className="h-4 w-4" />
              Chatta con il documento!
            </Button>
            <Button onClick={handleTranscriptOpen} variant="outline" className="gap-2">
              <FileType className="h-4 w-4" />
              Trascrizione
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        {renderTabs()}
        {renderTabsContent()}
      </Tabs>

      <Dialog open={isTranscriptOpen} onOpenChange={setIsTranscriptOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileType className="h-5 w-5" />
              Trascrizione Completa
            </DialogTitle>
            <DialogDescription>
              La trascrizione completa della lezione. Puoi copiarla negli appunti.
            </DialogDescription>
          </DialogHeader>

          {isLoadingTranscript ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                  {transcript}
                </pre>
              </div>
              <Button onClick={handleCopyTranscript} className="w-full gap-2">
                <Copy className="h-4 w-4" />
                Copia Trascrizione
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
