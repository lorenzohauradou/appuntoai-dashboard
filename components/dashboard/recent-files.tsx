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
import { ResultsType, RecentFileRaw } from "./types"
import { Badge } from "@/components/ui/badge"

// Interface per le props del componente
interface RecentFilesProps {
  files?: RecentFileRaw[];
  onOpenChat?: (transcriptId: string) => void;
  onDelete?: (transcriptId: string) => void;
  formatApiResult: (result: any) => ResultsType | null;
}

export function RecentFiles({ files = [], onOpenChat, onDelete, formatApiResult }: RecentFilesProps) {
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

  // --- STILE BADGE TIPO ---
  const getTypeStyle = (contentType?: string): { text: string; className: string } => {
    switch (contentType) {
      case 'meeting':
        return { text: 'Meeting', className: 'bg-blue-100 text-blue-700' };
      case 'lesson':
        return { text: 'Lezione', className: 'bg-purple-100 text-purple-700' };
      case 'interview':
        return { text: 'Intervista', className: 'bg-yellow-100 text-yellow-700' };
      default:
        return { text: 'N/D', className: 'bg-gray-100 text-gray-700' };
    }
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
    if (!file || !file.rawData) {
      toast({ title: "Errore Download", description: "Dati del file non disponibili.", variant: "destructive" });
      return;
    }
    
    // Formatta i dati prima di usarli
    const formattedData = formatApiResult(file.rawData);
    if (!formattedData) {
        toast({ title: "Errore Download", description: "Impossibile formattare i dati per il download.", variant: "destructive" });
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
          const filename = `appuntoai_results_${formattedData.contentType || file.name}.pdf`;
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

  const handleSharePlaceholder = async (fileId: string) => {
    console.log(`Azione: Condividi risultati per file ${fileId}`);
    
    const file = files.find(f => f.id === fileId);
    if (!file || !file.rawData) {
      toast({ title: "Errore Condivisione", description: "Dati del file non disponibili.", variant: "destructive" });
      return;
    }
    
    // Formatta i dati prima di usarli
    const formattedData = formatApiResult(file.rawData);
    if (!formattedData || !formattedData.summary) {
        toast({ title: "Errore Condivisione", description: "Impossibile formattare i dati o riassunto mancante.", variant: "destructive" });
        return;
    }

    // Prova a condividere o copiare il riassunto formattato
    try {
      // Usa shareData con dati formattati
      const shareData = {
        title: `Risultati Analisi AppuntoAI (${formattedData.contentType})`,
        text: formattedData.summary,
      };
      if (navigator.share) { // Tenta prima l'API Web Share
          await navigator.share(shareData);
          console.log("Condivisione via Web Share API riuscita o annullata.");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(formattedData.summary);
        toast({ title: "Riassunto copiato!", description: "Il riassunto è stato copiato negli appunti." });
      } else {
        toast({ title: "Condivisione non supportata", description: "Il tuo browser non supporta la copia negli appunti.", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Errore durante la condivisione:", err);
      toast({ title: "Errore di condivisione", description: "Non è stato possibile condividere il contenuto.", variant: "destructive" });
    }
  };

  // Stato vuoto quando non ci sono file recenti
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
              // --- AGGIUNTA: Ottieni stile per il tipo ---
              const typeStyle = getTypeStyle(file.contentType);
              // -----------------------------------------

              let formattedResultsForDisplay: ResultsType | null = null;
              if (expandedFileId === file.id) {
                  console.log(`RecentFiles: Formatting rawData for expanded file ${file.id}`);
                  formattedResultsForDisplay = formatApiResult(file.rawData);
                  if (!formattedResultsForDisplay) {
                      console.error(`RecentFiles: Failed to format rawData for file ${file.id}`, file.rawData);
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
                       {/* --- AGGIUNTA: Badge per il tipo --- */}
                       <Badge className={`text-xs px-2 py-1 ${typeStyle.className}`}>
                         {typeStyle.text}
                       </Badge>
                       {/* ----------------------------------- */}
                      {/* Badge dello stato esistente */}
                      <Badge className="text-xs text-green-600 bg-green-100 px-2 py-1">
                        {file.status}
                      </Badge>
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
                        onChatOpen={() => handleChatOpenPlaceholder(file.id)}
                        onDownload={() => handleDownloadPlaceholder(file.id)}
                        onShare={() => handleSharePlaceholder(file.id)}
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
