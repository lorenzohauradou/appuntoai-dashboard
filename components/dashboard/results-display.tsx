"use client"

import { useState } from "react"
import { FileText, CheckCircle, ListTodo, Users, Hash, Download, Share2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ResultsDisplayProps {
  results: {
    summary: string
    decisions: string[]
    tasks: {
      task: string
      assignee: string
      deadline: string
      priority: string
      category: string
    }[]
    themes: string[]
    participants: {
      name: string
      role: string
    }[]
  }
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState("summary")

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Risultati dell'analisi</h1>
          <p className="text-muted-foreground">Ecco cosa abbiamo trovato nel tuo contenuto</p>
        </div>
        <div className="flex gap-2">
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

      <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="w-full">
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

        <TabsContent value="decisions" className="mt-0">
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle>Decisioni prese</CardTitle>
              <CardDescription>Le decisioni chiave identificate nel contenuto</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {results.decisions.map((decision, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>{decision}</span>
                  </li>
                ))}
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
                {results.tasks.map((task, index) => (
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
                ))}
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
                {results.themes.map((theme, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3 bg-primary-100 text-primary">
                    {theme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="mt-0">
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle>Partecipanti</CardTitle>
              <CardDescription>Le persone coinvolte e i loro ruoli</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.participants.map((participant, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary">
                      {participant.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-sm text-muted-foreground">{participant.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
