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
  processingStatus: string | null
}

export function UploadSection({ processingStatus }: UploadSectionProps) {
  const [activeTab, setActiveTab] = useState("video")
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState("")
  // Usa ContentCategory per lo stato
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory>("Meeting")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false); // Stato locale per feedback caricamento

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
            duration: 7000,
          });
        }

      } catch (e) {
        console.error("Errore nel parsing di pendingUploadInfo:", e);
      } finally {
        localStorage.removeItem('pendingUploadInfo');
      }
    }
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
    const fileType = file.type.split("/")[0];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    // Controlli più specifici, puoi aggiustare le estensioni/mime type se necessario
    const isValidVideo = activeTab === "video" && (fileType === "video" || ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension ?? ''));
    const isValidAudio = activeTab === "audio" && (fileType === "audio" || ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'].includes(extension ?? ''));
    const isValidText = activeTab === "text" && (file.type.startsWith("text/") || ['txt', 'md', 'rtf', 'csv'].includes(extension ?? '')); // Aggiungi altri tipi testo se vuoi

    if (isValidVideo || isValidAudio || isValidText) {
      setSelectedFile(file);
      setTextInput(""); // Pulisce l'area di testo se si carica un file di testo
    } else {
       toast({
         title: "Formato non supportato",
         description: `Il file "${file.name}" non è un ${activeTab} valido o supportato.`,
         variant: "destructive",
       });
       clearSelection(); // Pulisce la selezione
    }
  };

  const handleUploadClick = () => {
    if (activeTab === "text" && textInput) {
      handleActualUpload()
    } else if (selectedFile) {
      handleActualUpload()
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

  // --- NUOVA FUNZIONE PER GESTIRE L'UPLOAD REALE ---
  const handleActualUpload = async () => {
    // Determina cosa inviare: file o testo
    const dataToSend = selectedFile || textInput;
    if (!dataToSend) {
      toast({ title: "Nessun contenuto", description: "Seleziona un file o inserisci del testo.", variant: "destructive" });
      return;
    }

    setIsProcessing(true); // Avvia feedback caricamento

    try {
      let body: BodyInit;
      const headers: HeadersInit = {};

      if (dataToSend instanceof File) {
        // Se è un file, usa FormData
        const formData = new FormData();
        formData.append('file', dataToSend); // L'API backend si aspetta 'file'
        formData.append('category', selectedCategory);
        formData.append('type', activeTab); // Può essere utile all'API
        body = formData;
        // Non impostare Content-Type manualmente per FormData
      } else {
        // Se è testo, usa JSON
        body = JSON.stringify({ text: dataToSend, category: selectedCategory, type: activeTab });
        headers['Content-Type'] = 'application/json';
      }

      // Chiama la tua API backend
      const response = await fetch('/api/process-transcription', {
        method: 'POST',
        headers: headers,
        body: body,
      });

      const result = await response.json();

      if (response.ok) {
        // Successo!
        console.log("Elaborazione completata:", result);
        toast({
          title: "Successo!",
          description: result.message || "Contenuto elaborato correttamente."
        });
        clearSelection(); // Pulisce l'input dopo successo
        setTextInput("");
        // Qui potresti aggiornare la UI, es. ricaricare lista trascrizioni
        // onUploadSuccess?.(); // Se hai una prop per questo
        // router.refresh(); // Ricarica i dati server-side per la pagina corrente
      } else {
        // Gestione errori specifici e generici
        if (response.status === 403 && result.error === "LIMIT_REACHED") {
          // Limite raggiunto
          console.warn("Limite trascrizioni raggiunto.");
          toast({
            title: "Limite Raggiunto",
            description: result.message || "Hai esaurito le tue analisi gratuite.",
            variant: "destructive",
            duration: 9000,
          });
          // Reindirizza a Stripe se l'URL è disponibile
          if (result.checkoutUrl) {
            window.location.href = result.checkoutUrl;
            return;
          } else {
            toast({
              title: "Errore Upgrade",
              description: "Non è stato possibile generare il link per l'upgrade. Contatta il supporto.",
              variant: "destructive",
            });
          }
        } else {
          // Altri errori 
          console.error("Errore API:", response.status, result);
          toast({
            title: "Errore Elaborazione",
            description: result.error || result.message || "Si è verificato un errore imprevisto.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      // Errore di rete o eccezione JS
      console.error("Errore fetch o JS:", error);
      toast({
        title: "Errore di Rete",
        description: "Impossibile comunicare con il server. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
       // Assicura che lo stato di caricamento venga resettato
       // tranne in caso di redirect a Stripe
       if (typeof window !== 'undefined' && !window.location.href.startsWith('https://checkout.stripe.com')) {
         setIsProcessing(false);
       }
    }
  };

  const handleProcessClick = () => {
    if (sessionStatus === 'loading' || isProcessing) {
      return;
    }

    if (sessionStatus === 'unauthenticated') {
      try { 
        if (selectedFile) {
          localStorage.setItem('pendingUploadInfo', JSON.stringify({
            type: activeTab,
            category: selectedCategory,
            fileName: selectedFile.name 
          }));
        } else if (activeTab === 'text' && textInput) {
           localStorage.setItem('pendingUploadInfo', JSON.stringify({
            type: activeTab,
            category: selectedCategory,
            textPreview: textInput.substring(0, 50) + (textInput.length > 50 ? '...' : '') 
          }));
        }
      } catch (error) {
        console.error("Errore salvataggio localStorage:", error);
      }
      router.push('/login');
    } else if (sessionStatus === 'authenticated') {
      //  fetch all'API
      handleActualUpload(); 
    }
  }
  
  const isButtonDisabled =
    sessionStatus === 'loading' ||
    isProcessing || // Usa lo stato locale
    ((activeTab !== "text" || !textInput) && !selectedFile);

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
          {/* Card informativa - Versione Desktop */}
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

        <div className="order-1 md:order-2 w-full flex justify-center md:w-auto md:justify-start">
          <Button
            className="bg-primary text-white hover:bg-primary/90 min-w-[120px]" // Aggiunto min-width per evitare troppo resizing
            onClick={handleProcessClick}
            disabled={isButtonDisabled}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Elaboro...
              </>
            ) : sessionStatus === 'loading' ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 Verifica...
               </>
            ) : sessionStatus === 'unauthenticated' ? (
               <>
                 <Upload className="mr-2 h-4 w-4" />
                 Accedi
               </>
            ) : ( // Autenticato e non in elaborazione
               <>
                 <Upload className="mr-2 h-4 w-4" />
                 Elabora
               </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
