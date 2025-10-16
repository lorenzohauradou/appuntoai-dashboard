"use client"

import { useState } from "react"
import { FileVideo, FileAudio, FileText, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import { ResultsDisplay } from "./results-display"
import { ResultsType, RecentFileRaw } from "./types"
import { Badge } from "@/src/components/ui/badge"

interface RecentFilesProps {
  files?: RecentFileRaw[];
  onDelete?: (transcriptId: string) => void;
  formatApiResult: (result: any) => ResultsType | null;
}

export function RecentFiles({ files = [], onDelete, formatApiResult }: RecentFilesProps) {
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);

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
  };

  const handleToggleExpand = (fileId: string) => {
    setExpandedFileId(prevId => (prevId === fileId ? null : fileId));
  };

  const getTypeStyle = (contentType?: string): { text: string; className: string } => {
    switch (contentType) {
      default:
        return { text: 'Lezione', className: 'bg-purple-100 text-gray-700' };
    }
  };




  const renderEmptyState = () => (
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
      <Button
        className="mt-6 px-4 py-2 rounded-md bg-primary text-white font-medium"
        variant="default"
        onClick={() => window.location.href = "/dashboard?tab=upload"}
      >
        Vai a Carica File
      </Button>
    </div>
  );

  return (
    <Card className="border-0 shadow-md bg-white">
      <CardHeader className="pb-2">
        <CardTitle>File recenti</CardTitle>
        <CardDescription>I tuoi file elaborati di recente</CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="space-y-4">
            {files.map((file) => {
              const typeStyle = getTypeStyle(file.contentType);

              let formattedResultsForDisplay: ResultsType | null = null;
              if (expandedFileId === file.id) {
                formattedResultsForDisplay = formatApiResult(file.rawData);
                if (!formattedResultsForDisplay) {
                }
              }

              return (
                <div key={file.id} className="flex flex-col p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                  <div
                    className="flex items-center justify-between w-full cursor-pointer"
                    onClick={() => handleToggleExpand(file.id)}
                  >
                    <div className="flex items-center gap-3">
                      {getIcon(file.type)}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{file.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => handleToggleExpand(file.id)}>
                            {expandedFileId === file.id ? "Chiudi Risultati" : "Visualizza Risultati"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                            onClick={() => onDelete && onDelete(file.id)}
                            disabled={!onDelete}
                          >
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {expandedFileId === file.id && formattedResultsForDisplay && (
                    <div
                      className="mt-4 pt-4 border-t"
                      id={`results-export-area-${file.id}`}
                    >
                      <ResultsDisplay
                        results={formattedResultsForDisplay}
                      />
                    </div>
                  )}
                  {expandedFileId === file.id && !formattedResultsForDisplay && file.rawData && (
                    <div className="mt-4 pt-4 border-t text-red-600 p-4">
                      Errore nella formattazione dei dati per questo elemento della cronologia.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
