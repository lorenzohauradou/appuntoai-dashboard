"use client"

import { FileVideo, FileAudio, FileText, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function RecentFiles() {
  const recentFiles = [
    { id: 1, name: "Riunione-team.mp4", type: "video", date: "15 Maggio 2023", status: "Completato" },
    { id: 2, name: "Intervista-cliente.mp3", type: "audio", date: "12 Maggio 2023", status: "Completato" },
    { id: 3, name: "Note-progetto.txt", type: "text", date: "10 Maggio 2023", status: "Completato" },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <FileVideo className="h-5 w-5 text-blue-500" />
      case "audio":
        return <FileAudio className="h-5 w-5 text-green-500" />
      case "text":
        return <FileText className="h-5 w-5 text-amber-500" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  return (
    <Card className="border-0 shadow-md bg-white">
      <CardHeader className="pb-2">
        <CardTitle>File recenti</CardTitle>
        <CardDescription>I tuoi file elaborati di recente</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getIcon(file.type)}
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{file.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">{file.status}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Visualizza risultati</DropdownMenuItem>
                    <DropdownMenuItem>Scarica</DropdownMenuItem>
                    <DropdownMenuItem>Condividi</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Elimina</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
