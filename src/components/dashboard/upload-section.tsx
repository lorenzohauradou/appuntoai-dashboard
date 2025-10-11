"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { FileVideo, FileAudio, FileText, Upload, X, Users, GraduationCap, Mic2, Loader2, Clock, FileCheck, CloudUpload } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Textarea } from "@/src/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { cn } from "@/src/lib/utils"
import { toast } from 'sonner'
import { ResultsType } from "@/src/components/dashboard/types";
import { Progress } from "@/src/components/ui/progress"
import { useUploader } from '@/src/hooks/use-uploader';

// Definisci il tipo ContentCategory qui o importalo se è definito altrove
type ContentCategory = "Meeting" | "Lesson" | "Interview";

interface UploadSectionProps {
  processingStatus: string | null
  onAnalysisComplete: (results: ResultsType) => void
  formatApiResult: (result: any) => ResultsType | null
}

// Definisci la dimensione massima in byte (7 GB)
const MAX_FILE_SIZE = 7 * 1024 * 1024 * 1024;

export function UploadSection({ processingStatus, onAnalysisComplete, formatApiResult }: UploadSectionProps) {
  const [activeTab, setActiveTab] = useState("video")
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState("")
  // Usa ContentCategory per lo stato
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory>("Meeting")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [results, setResults] = useState<ResultsType | null>(null);

  // Usa hook per sessione e router
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  // --- USA IL CUSTOM HOOK ---
  const {
    currentPhase,
    uploadProgress,
    jobProgress,
    jobMessage,
    isUploadBlocked,
    startProcessing,
    resetUploaderState
  } = useUploader({
    onAnalysisComplete: (results: ResultsType) => {
      setResults(results);
    },
    formatApiResult: (result: any): ResultsType | null => {
      // Logica di formattazione esistente
      if (!result || typeof result !== 'object') return null;

      if (result.tipo_contenuto === 'meeting') {
        return {
          contentType: 'meeting',
          summary: result.riassunto || '',
          decisions: result.decisioni || [],
          tasks: result.task || [],
          themes: result.temi || [],
          participants: result.partecipanti || [],
          transcript_id: result.transcript_id,
          suggested_questions: result.domande_suggerite || [],
        };
      } else if (result.tipo_contenuto === 'lezione') {
        return {
          contentType: 'lezione',
          summary: result.riassunto || '',
          keyPoints: result.punti_chiave || [],
          exercises: result.esercizi || [],
          topics: result.argomenti || [],
          participants: result.partecipanti || [],
          possibleQuestions: result.domande_possibili || [],
          bibliography: result.bibliografia || [],
          transcript_id: result.transcript_id,
          suggested_questions: result.domande_suggerite || [],
        };
      } else if (result.tipo_contenuto === 'intervista') {
        return {
          contentType: 'intervista',
          summary: result.riassunto || '',
          temi_principali: result.temi_principali || [],
          punti_salienti: result.punti_salienti || [],
          participants: result.partecipanti || [],
          transcript_id: result.transcript_id,
          suggested_questions: result.domande_suggerite || [],
        };
      }

      return null;
    }
  });

  // Funzione per ottenere l'icona di categoria
  const getCategoryIcon = (category: ContentCategory) => {
    switch (category) {
      case "Meeting":
        return <Users className="w-5 h-5" />
      case "Lesson":
        return <GraduationCap className="w-5 h-5" />
      case "Interview":
        return <Mic2 className="w-5 h-5" />
      default:
        return <Users className="w-5 h-5" />
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // CONTROLLO DIMENSIONE
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File Troppo Grande", {
        description: `Il file "${file.name}" (${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB) supera il limite massimo di ${(MAX_FILE_SIZE / (1024 * 1024 * 1024)).toFixed(0)} GB.`,
        duration: 7000,
      });
      clearSelection();
      return;
    }

    const fileType = file.type.split("/")[0];
    const extension = file.name.split('.').pop()?.toLowerCase();

    // Controlli più specifici, puoi aggiustare le estensioni/mime type se necessario
    const isValidVideo = activeTab === "video" && (fileType === "video" || ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension ?? ''));
    const isValidAudio = activeTab === "audio" && (fileType === "audio" || ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'].includes(extension ?? ''));
    const isValidText = activeTab === "text" && (file.type.startsWith("text/") || ['txt', 'md', 'rtf', 'csv'].includes(extension ?? '')); // Aggiungi altri tipi testo se vuoi

    if (isValidVideo || isValidAudio || isValidText) {
      setSelectedFile(file);
      if (activeTab === 'text') {
        setTextInput("");
      }
    } else {
      toast.error("Formato non supportato", {
        description: `Il file "${file.name}" non è un ${activeTab} valido o supportato.`
      });
      clearSelection();
    }
  };

  const clearSelection = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    clearSelection()
    setTextInput("")
  }

  const handleProcessClick = async () => {
    if (sessionStatus === 'loading' || currentPhase !== 'idle') return;

    if (sessionStatus === 'unauthenticated') {
      try {
        if (selectedFile) localStorage.setItem('pendingUploadInfo', JSON.stringify({ type: activeTab, category: selectedCategory, fileName: selectedFile.name }));
        else if (activeTab === 'text' && textInput) localStorage.setItem('pendingUploadInfo', JSON.stringify({ type: activeTab, category: selectedCategory, textPreview: textInput.substring(0, 50) + '...' }));
      } catch (error) { console.error("Errore localStorage:", error); }
      router.push('/login');
    } else if (sessionStatus === 'authenticated') {
      const dataToSend = selectedFile || textInput;
      if (dataToSend) {
        const success = await startProcessing(dataToSend, selectedCategory, activeTab as 'video' | 'audio' | 'text');
        if (success && dataToSend instanceof File) {
          clearSelection();
        }
      } else {
        toast.warning("Nessun contenuto selezionato.");
      }
    }
  }

  const isButtonDisabled =
    sessionStatus === 'loading' ||
    currentPhase !== 'idle' ||
    ((activeTab !== "text" || !textInput) && !selectedFile);

  const getButtonText = () => {
    switch (currentPhase) {
      case 'gettingUrl': return "Preparo upload...";
      case 'uploading': return `Caricamento... ${uploadProgress}%`;
      case 'processing':
        if (jobMessage === "Recupero elaborazione in corso...") {
          return "Recupero elaborazione...";
        }
        return "Elaborazione in corso...";
      case 'failed': return "Errore - Riprova";
      case 'idle': default:
        if (sessionStatus === 'loading') return "Verifica...";
        if (sessionStatus === 'unauthenticated') return "Accedi per analizzare";
        return "Elabora";
    }
  }

  const getButtonIcon = () => {
    switch (currentPhase) {
      case 'gettingUrl': case 'processing': return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
      case 'uploading': return <CloudUpload className="mr-2 h-4 w-4 animate-bounce" />;
      case 'failed': return <X className="mr-2 h-4 w-4" />;
      case 'idle': default:
        if (sessionStatus === 'loading') return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
        return <Upload className="mr-2 h-4 w-4" />;
    }
  }

  return (
    <Card className="border-0 shadow-lg bg-white overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary to-primary-600 text-white rounded-t-lg md:items-start justify-between">
        <div>
          <CardTitle className="text-2xl text-center md:text-left mb-3">Carica il tuo contenuto</CardTitle>
          <CardDescription className="text-primary-100 hidden md:block">
            Carica un file video, audio o inserisci direttamente il testo
          </CardDescription>
        </div>

      </CardHeader>
      <CardContent className="p-6">
        {isUploadBlocked && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-1">
                  Upload in corso - Non chiudere questa pagina
                </h3>
                <p className="text-sm text-orange-700 mb-2">
                  Il file si sta scaricando sui nostri server. Se chiudi questa pagina o il browser, l'upload verrà interrotto e dovrai ricominciare da capo.
                </p>
              </div>
            </div>
          </div>
        )}
        {!isUploadBlocked && (
          <Tabs defaultValue="video" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="video" className="flex items-center gap-2">
                <FileVideo className="w-4 h-4" />
                Video
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <FileAudio className="w-4 h-4" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Testo
              </TabsTrigger>
            </TabsList>

            <div className="mb-6">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === "Meeting" ? "default" : "outline"}
                  className="flex-1 transition-all duration-200 ease-in-out hover:scale-90 hover:shadow-md"
                  onClick={() => setSelectedCategory("Meeting")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Meeting
                </Button>
                <Button
                  variant={selectedCategory === "Lesson" ? "default" : "outline"}
                  className="flex-1 transition-all duration-200 ease-in-out hover:scale-90 hover:shadow-md"
                  onClick={() => setSelectedCategory("Lesson")}
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Lezione
                </Button>
                <Button
                  variant={selectedCategory === "Interview" ? "default" : "outline"}
                  className="flex-1 transition-all duration-200 ease-in-out hover:scale-90 hover:shadow-md"
                  onClick={() => setSelectedCategory("Interview")}
                >
                  <Mic2 className="mr-2 h-4 w-4" />
                  Intervista
                </Button>
              </div>
            </div>

            <TabsContent value="video" className="mt-0">
              {!selectedFile ? (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 transition-colors",
                    dragActive ? "border-primary bg-primary-50" : "border-gray-300",
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileVideo className="h-12 w-12 text-primary mb-4" />
                  <p className="text-center mb-4">
                    Trascina qui il tuo file video o{" "}
                    <span
                      className="text-primary cursor-pointer hover:underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      sfoglia
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground text-center">Supporta .mp4, .mov, .avi</p>
                  <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <FileVideo className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearSelection}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="audio" className="mt-0">
              {!selectedFile ? (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 transition-colors",
                    dragActive ? "border-primary bg-primary-50" : "border-gray-300",
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileAudio className="h-12 w-12 text-primary mb-4" />
                  <p className="text-center mb-4">
                    Trascina qui il tuo file audio o{" "}
                    <span
                      className="text-primary cursor-pointer hover:underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      sfoglia
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground text-center">Supporta .mp3, .wav, .m4a, .ogg</p>
                  <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <FileAudio className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearSelection}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="text" className="mt-0">
              <div className="space-y-4">
                <div
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors",
                    dragActive ? "border-primary bg-primary-50" : "border-gray-300",
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <p className="text-center text-sm mb-2">
                    Trascina un file .txt o{" "}
                    <span
                      className="text-primary cursor-pointer hover:underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      sfoglia
                    </span>
                  </p>
                  <input ref={fileInputRef} type="file" accept="text/*,.txt" className="hidden" onChange={handleFileChange} />
                </div>

                <div className="relative">
                  <Textarea
                    placeholder="...oppure incolla direttamente il testo qui"
                    className="min-h-32 resize-none"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  {textInput && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setTextInput("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-primary mr-3" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={clearSelection}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Mostra progress bar durante l'upload */}
        {currentPhase === 'uploading' && (
          <div className="mt-6 space-y-2">
            <Progress value={uploadProgress} className="w-full h-2" />
            <p className="text-sm text-center text-muted-foreground">
              Caricamento file... ({uploadProgress}%) <br />Può richiedere qualche minuto, in base alla dimensione del file.
            </p>
          </div>
        )}

        {/* Mostra messaggio durante la preparazione */}
        {currentPhase === 'gettingUrl' && (
          <p className="text-sm text-center text-muted-foreground mt-6">
            Preparazione dell'upload sicuro...
          </p>
        )}

        {/* Mostra messaggio durante l'elaborazione */}
        {currentPhase === 'processing' && (
          <p className="text-sm text-center text-muted-foreground mt-6">
            Elaborazione in corso... L'operazione sarà completata in pochi secondi.
          </p>
        )}

      </CardContent>
      <CardFooter className="flex flex-col md:flex-row md:justify-between md:items-center border-t p-6 gap-4 md:gap-0">
        <div className="order-2 md:order-1 w-full">
          <div className="block md:hidden mt-4 max-w-md mx-auto bg-slate-50 rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
              <div className="flex items-center text-slate-500">
                {activeTab === "video" && <FileVideo className="h-4 w-4" />}
                {activeTab === "audio" && <FileAudio className="h-4 w-4" />}
                {activeTab === "text" && <FileText className="h-4 w-4" />}
                <span className="ml-2 text-sm font-medium">Formato:</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {activeTab === "video" ? "Video" :
                  activeTab === "audio" ? "Audio" : "Testo"}
              </p>

              <div className="flex items-center text-slate-500">
                <div className={cn("w-2.5 h-2.5 rounded-full mr-2",
                  selectedCategory === "Meeting" ? "bg-blue-500" :
                    selectedCategory === "Lesson" ? "bg-primary" :
                      "bg-yellow-500"
                )}></div>
                <span className="text-sm font-medium">Tipo:</span>
              </div>
              <p className={cn("text-sm font-semibold",
                selectedCategory === "Meeting" ? "text-blue-700" :
                  selectedCategory === "Lesson" ? "text-primary" :
                    "text-yellow-700"
              )}>
                {selectedCategory === "Lesson" ? "Lezione" : selectedCategory === "Interview" ? "Intervista" : "Meeting"}
              </p>

              <div className="flex items-center text-slate-500">
                {!selectedFile && !textInput && <Clock className="h-4 w-4" />}
                {(selectedFile || textInput) && <FileCheck className="h-4 w-4 text-green-600" />}
                <span className="ml-2 text-sm font-medium">Stato:</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {selectedFile ? "File pronto" :
                  textInput ? "Testo pronto" :
                    "In attesa..."}
              </p>
            </div>
          </div>
          <div className="hidden md:block max-w-[350px] bg-slate-50 rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 text-sm">
              <div className="flex items-center text-slate-500">
                {activeTab === "video" && <FileVideo className="h-4 w-4" />}
                {activeTab === "audio" && <FileAudio className="h-4 w-4" />}
                {activeTab === "text" && <FileText className="h-4 w-4" />}
                <span className="ml-2 font-medium">Formato:</span>
              </div>
              <p className="font-semibold text-slate-700">
                {activeTab === "video" ? "Video" :
                  activeTab === "audio" ? "Audio" : "Testo"}
              </p>

              <div className="flex items-center text-slate-500">
                <div className={cn("w-2.5 h-2.5 rounded-full mr-2",
                  selectedCategory === "Meeting" ? "bg-blue-500" :
                    selectedCategory === "Lesson" ? "bg-pink-500" :
                      "bg-yellow-500"
                )}></div>
                <span className="font-medium">Tipo:</span>
              </div>
              <p className={cn("font-semibold",
                selectedCategory === "Meeting" ? "text-blue-700" :
                  selectedCategory === "Lesson" ? "text-purple-700" :
                    "text-yellow-700"
              )}>
                {selectedCategory === "Lesson" ? "Lezione" : selectedCategory === "Interview" ? "Intervista" : "Meeting"}
              </p>

              <div className="flex items-center text-slate-500">
                {!selectedFile && !textInput && <Clock className="h-4 w-4" />}
                {(selectedFile || textInput) && <FileCheck className="h-4 w-4 text-green-600" />}
                <span className="ml-2 font-medium">Stato:</span>
              </div>
              <p className="font-semibold text-slate-700">
                {selectedFile ? "File pronto" :
                  textInput ? "Testo pronto" :
                    "In attesa..."}
              </p>
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2 w-full flex justify-center md:w-auto md:justify-start">
          <Button
            className="bg-primary text-white hover:bg-primary/90 min-w-[180px]"
            onClick={handleProcessClick}
            disabled={isButtonDisabled}
          >
            {getButtonIcon()}
            {getButtonText()}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
