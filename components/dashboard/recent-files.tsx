"use client"

import { useState } from "react"
import { FileVideo, FileAudio, FileText, MoreHorizontal, FolderIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ResultsDisplay } from "./results-display"
import { useToast } from "@/components/ui/use-toast"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { MeetingResults, LectureResults, ResultsType } from "./types"

// Interfaccia per un file recente
interface RecentFile {
  id: string;
  name: string;
  type: string;
  date: string;
  status: string;
  resultsData: ResultsType | null;
}

// Interface per le props del componente
interface RecentFilesProps {
  files?: RecentFile[];
  onOpenChat?: (transcriptId: string) => void;
  onDelete?: (transcriptId: string) => void;
}

export function RecentFiles({ files = [], onOpenChat, onDelete }: RecentFilesProps) {
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const { toast } = useToast();

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
    console.log(`Toggling file expansion for ID: ${fileId}`);
    setExpandedFileId(prevId => (prevId === fileId ? null : fileId));
  };

  // Funzioni per ResultsDisplay
  const handleChatOpenPlaceholder = (fileId: string) => {
    console.log(`Azione: Apri chat per file ${fileId}`);
    
    // Se esiste un handler per aprire la chat, lo chiamiamo
    if (onOpenChat) {
      onOpenChat(fileId);
    } else {
      toast({ title: "Funzionalità chat", description: `La chat per questo file storico non è ancora implementata.` });
    }
  };

  const handleDownloadPlaceholder = (fileId: string) => {
    console.log(`Azione: Download risultati per file ${fileId}`);
    
    const file = files.find(f => f.id === fileId);
    if (!file || !file.resultsData) {
      toast({ title: "Errore Download", description: "Dati del file non disponibili.", variant: "destructive" });
      return;
    }
    
    toast({ title: "Generazione PDF in corso...", description: "Potrebbe richiedere qualche secondo." });
    
    // Aspettiamo un attimo che il toast venga visualizzato e che il DOM sia pronto
    setTimeout(() => {
      const input = document.getElementById(`results-export-area-${fileId}`);
      console.log(`Cercando elemento con ID: results-export-area-${fileId}`);
      
      if (!input) {
        console.error(`Elemento con ID results-export-area-${fileId} non trovato`);
        toast({ title: "Errore Download", description: "Impossibile trovare l'area dei risultati da esportare.", variant: "destructive" });
        return;
      }
      
      console.log("Elemento trovato, nascondendo i pulsanti...");
      const buttonsToHide = input.querySelectorAll('button');
      buttonsToHide.forEach(btn => (btn as HTMLElement).style.visibility = 'hidden');
      
      html2canvas(input, {
        scale: 2, 
        useCORS: true, 
        logging: true, // Attiva il logging per debug
      })
        .then((canvas) => {
          console.log("Canvas generato, creando PDF...");
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'p', 
            unit: 'px',       
            format: [canvas.width, canvas.height]
          });
          
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          const filename = `appuntoai_results_${file.name}.pdf`;
          pdf.save(filename);
          
          buttonsToHide.forEach(btn => (btn as HTMLElement).style.visibility = 'visible');
          toast({ title: "PDF Generato!", description: `Il file ${filename} è stato scaricato.` });
        })
        .catch((err) => {
          console.error("Errore durante la generazione del PDF:", err);
          buttonsToHide.forEach(btn => (btn as HTMLElement).style.visibility = 'visible');
          toast({ title: "Errore Download PDF", description: "Non è stato possibile generare il PDF.", variant: "destructive" });
        });
    }, 500);
  };

  const handleSharePlaceholder = (fileId: string) => {
    console.log(`Azione: Condividi risultati per file ${fileId}`);
    
    const file = files.find(f => f.id === fileId);
    if (!file || !file.resultsData) {
      toast({ title: "Errore Condivisione", description: "Dati del file non disponibili.", variant: "destructive" });
      return;
    }
    
    // Prova a condividere o copiare il riassunto
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(file.resultsData.summary);
        toast({ title: "Riassunto copiato!", description: "Il riassunto è stato copiato negli appunti." });
      } else {
        toast({ title: "Condivisione non supportata", description: "Il tuo browser non supporta la copia negli appunti.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Errore durante la condivisione:", err);
      toast({ title: "Errore di condivisione", description: "Non è stato possibile condividere il contenuto.", variant: "destructive" });
    }
  };

  // Stato vuoto quando non ci sono file recenti
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
      <FileText className="h-12 w-12 mb-4 text-muted-foreground/60" />
      <p className="mb-2">Nessun file elaborato recentemente</p>
      <p className="text-sm">I file che elaborerai appariranno qui</p>
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
            {files.map((file) => (
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
                    <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">{file.status}</span>
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
                        <DropdownMenuItem onClick={() => handleDownloadPlaceholder(file.id)}>Scarica</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSharePlaceholder(file.id)}>Condividi</DropdownMenuItem>
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
                
                {/* Area espandibile per i risultati */}
                {expandedFileId === file.id && file.resultsData && (
                  <div 
                    className="mt-4 pt-4 border-t" 
                    id={`results-export-area-${file.id}`}
                  >
                    <ResultsDisplay
                      results={file.resultsData}
                      onChatOpen={() => handleChatOpenPlaceholder(file.id)}
                      onDownload={() => handleDownloadPlaceholder(file.id)}
                      onShare={() => handleSharePlaceholder(file.id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
