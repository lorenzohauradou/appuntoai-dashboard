"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { FileVideo, FileAudio, FileText, Upload, X, Users, GraduationCap, Mic2, Loader2, Clock, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

// Definisci il tipo ContentCategory qui o importalo se è definito altrove
type ContentCategory = "Meeting" | "Lezione" | "Intervista";

interface UploadSectionProps {
  // Usa ContentCategory per il parametro category
  onUpload: (type: string, category: ContentCategory, data: any) => void
  processingStatus: string | null
}

export function UploadSection({ onUpload, processingStatus }: UploadSectionProps) {
  const [activeTab, setActiveTab] = useState("video")
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState("")
  // Usa ContentCategory per lo stato
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory>("Meeting")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Usa hook per sessione e router
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  // Effetto per controllare localStorage al montaggio
  useEffect(() => {
    const pendingInfoRaw = localStorage.getItem('pendingUploadInfo');
    if (pendingInfoRaw) {
      try {
        const info = JSON.parse(pendingInfoRaw);
        console.log("Trovate informazioni pending:", info);

        let description = "";
        if (info.fileName) {
          description = `Sembra che volessi elaborare il file "${info.fileName}". Per favore, caricalo di nuovo.`
        } else if (info.text) {
          description = "Sembra che volessi elaborare del testo. Incollalo di nuovo e clicca Elabora."
          // Se vuoi ripopolare il campo textInput:
          setTextInput(info.text);
          setActiveTab(info.type);
          setSelectedCategory(info.category);
        }

        if (description) {
          toast({
            title: "Bentornato!",
            description: description,
            duration: 7000, // Durata più lunga per dare tempo di leggere
          });
        }

      } catch (e) {
        console.error("Errore nel parsing di pendingUploadInfo:", e);
      } finally {
        // Pulisce localStorage indipendentemente dall'esito del parsing
        localStorage.removeItem('pendingUploadInfo');
      }
    }
    // Esegui solo al montaggio iniziale del componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array dipendenze vuoto per eseguire solo una volta

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
    // Check if file type matches the active tab
    const fileType = file.type.split("/")[0]
    if (
      (activeTab === "video" && fileType === "video") ||
      (activeTab === "audio" && fileType === "audio") ||
      (activeTab === "text" && (file.name.endsWith(".txt") || file.type.startsWith("text/")))
    ) {
      setSelectedFile(file)
    } else {
      alert(`Il tipo di file non corrisponde alla scheda selezionata`)
    }
  }

  const handleUploadClick = () => {
    if (activeTab === "text" && textInput) {
      onUpload("text", selectedCategory, textInput)
    } else if (selectedFile) {
      onUpload(activeTab, selectedCategory, selectedFile)
    }
  }

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

  // Logica separata per l'effettivo upload (chiamata quando l'utente è autenticato)
  const triggerUpload = () => {
    if (activeTab === "text" && textInput) {
      onUpload("text", selectedCategory, textInput)
    } else if (selectedFile) {
      onUpload(activeTab, selectedCategory, selectedFile)
    }
  }

  // Nuovo gestore per il click sul pulsante "Elabora"
  const handleProcessClick = () => {
    if (sessionStatus === 'loading') {
      return;
    }

    if (sessionStatus === 'unauthenticated') {
      // --- SALVA INTENZIONE PRIMA DI REDIRECT ---
      try { // Usa try/catch per localStorage
        if (selectedFile) {
          localStorage.setItem('pendingUploadInfo', JSON.stringify({
            type: activeTab,
            category: selectedCategory,
            fileName: selectedFile.name 
          }));
          console.log('Info file salvate in localStorage:', selectedFile.name);
        } else if (activeTab === 'text' && textInput) {
           localStorage.setItem('pendingUploadInfo', JSON.stringify({
            type: activeTab,
            category: selectedCategory,
            // Salva solo una parte del testo per evitare problemi di dimensione
            textPreview: textInput.substring(0, 50) + (textInput.length > 50 ? '...' : '') 
          }));
           console.log('Info testo salvate in localStorage');
        }
      } catch (error) {
        console.error("Errore nel salvataggio in localStorage:", error);
        // Non bloccare il redirect anche se localStorage fallisce
      }
      // --- FINE SALVATAGGIO INTENZIONE ---
      
      router.push('/login');
    } else if (sessionStatus === 'authenticated') {
      triggerUpload();
    }
  }

  // Calcola se il bottone deve essere disabilitato
  const isButtonDisabled = 
    sessionStatus === 'loading' || // Disabilita se la sessione sta caricando
    processingStatus === 'processing' || // Disabilita se già in elaborazione
    ((activeTab !== "text" || !textInput) && !selectedFile); // Disabilita se non c'è input/file

  return (
    <Card className="border-0 shadow-lg bg-white overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary to-primary-600 text-white rounded-t-lg items-start justify-between">
        <div>
          <CardTitle className="text-2xl text-center md:text-left mb-3">Carica il tuo contenuto</CardTitle>
          <CardDescription className="text-primary-100 hidden md:block">
            Carica un file video, audio o inserisci direttamente il testo
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="video" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="video" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <FileVideo className="mr-2 h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="audio" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <FileAudio className="mr-2 h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <FileText className="mr-2 h-4 w-4" />
              Testo
            </TabsTrigger>
          </TabsList>

          {/* Selezione della categoria */}
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === "Meeting" ? "secondary" : "outline"}
                className="flex-1 transition-all duration-200 ease-in-out hover:scale-90 hover:shadow-md"
                onClick={() => setSelectedCategory("Meeting")}
              >
                <Users className="mr-2 h-4 w-4" />
                Meeting
              </Button>
              <Button
                variant={selectedCategory === "Lezione" ? "secondary" : "outline"}
                className="flex-1 transition-all duration-200 ease-in-out hover:scale-90 hover:shadow-md"
                onClick={() => setSelectedCategory("Lezione")}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Lezione
              </Button>
              <Button
                variant={selectedCategory === "Intervista" ? "secondary" : "outline"}
                className="flex-1 transition-all duration-200 ease-in-out hover:scale-90 hover:shadow-md"
                onClick={() => setSelectedCategory("Intervista")}
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
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t p-6">
        {/* Contenitore per le card informative (mobile e desktop) */}
        <div>
          {/* Card informativa - Versione Mobile */}
          <div className="block md:hidden bg-slate-50 rounded-lg p-4 shadow-sm border border-slate-200">
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
                  selectedCategory === "Lezione" ? "bg-primary" : 
                  "bg-yellow-500"
                )}></div>
                 <span className="text-sm font-medium">Tipo:</span>
              </div>
              <p className={cn("text-sm font-semibold",
                  selectedCategory === "Meeting" ? "text-blue-700" :
                  selectedCategory === "Lezione" ? "text-primary" : 
                  "text-yellow-700"  
                )}>
                {selectedCategory}
              </p>
              
              <div className="flex items-center text-slate-500">
                 {!selectedFile && !textInput && <Clock className="h-4 w-4" /> } 
                 {(selectedFile || textInput) && <FileCheck className="h-4 w-4 text-green-600" /> }
                 <span className="ml-2 text-sm font-medium">Stato:</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">
                  {selectedFile ? "File pronto" : 
                   textInput ? "Testo pronto" : 
                   "In attesa..."}
               </p>
            </div>
          </div>
          {/* Card informativa - Versione Desktop (spostata qui) */}
          <div className="hidden md:block min-w-[350px] bg-slate-50 rounded-lg p-4 shadow-sm border border-slate-200">
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
                  selectedCategory === "Lezione" ? "bg-pink-500" : 
                  "bg-yellow-500"
                )}></div>
                <span className="font-medium">Tipo:</span>
              </div>
              <p className={cn("font-semibold",
                  selectedCategory === "Meeting" ? "text-blue-700" :
                  selectedCategory === "Lezione" ? "text-purple-700" : 
                  "text-yellow-700"  
                )}>
                {selectedCategory}
              </p>
              
              <div className="flex items-center text-slate-500">
                 {!selectedFile && !textInput && <Clock className="h-4 w-4" /> } 
                 {(selectedFile || textInput) && <FileCheck className="h-4 w-4 text-green-600" /> }
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

        <Button
          className="bg-primary text-white hover:bg-primary/90"
          onClick={handleProcessClick}
          disabled={isButtonDisabled}
        >
          {sessionStatus === 'loading' ? (
             <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               Verifica...
             </>
           ) : processingStatus === 'processing' ? (
             <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               Elaborazione...
             </>
           ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {sessionStatus === 'unauthenticated' ? 'Accedi per Elaborare' : 'Elabora'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
