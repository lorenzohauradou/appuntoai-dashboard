"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { FileVideo, FileAudio, Upload, X, Loader2, CloudUpload } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { cn } from "@/src/lib/utils"
import { toast } from 'sonner'
import { Progress } from "@/src/components/ui/progress"
import { upload } from '@vercel/blob/client'
import { ResultsType } from "@/src/components/dashboard/types"

const MAX_FILE_SIZE = 7 * 1024 * 1024 * 1024

interface UploadSectionProps {
  onAnalysisComplete: (results: ResultsType) => void
  formatApiResult: (result: any) => ResultsType | null
}

export function UploadSection({ onAnalysisComplete, formatApiResult }: UploadSectionProps) {
  const [activeTab, setActiveTab] = useState("video")
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

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
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File Troppo Grande", {
        description: `Il file supera il limite di ${(MAX_FILE_SIZE / (1024 * 1024 * 1024)).toFixed(0)} GB.`,
        duration: 7000,
      })
      clearSelection()
      return
    }

    const fileType = file.type.split("/")[0]
    const extension = file.name.split('.').pop()?.toLowerCase()

    const isValidVideo = activeTab === "video" && (fileType === "video" || ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension ?? ''))
    const isValidAudio = activeTab === "audio" && (fileType === "audio" || ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'].includes(extension ?? ''))

    if (isValidVideo || isValidAudio) {
      setSelectedFile(file)
    } else {
      toast.error("Formato non supportato", {
        description: `Il file non è un ${activeTab} valido.`
      })
      clearSelection()
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
  }


  const handleProcessClick = async () => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (!selectedFile) {
      toast.warning("Nessun file selezionato")
      return
    }

    try {
      setIsUploading(true)

      const blob = await upload(selectedFile.name, selectedFile, {
        access: 'public',
        handleUploadUrl: '/api/blob/upload',
        onUploadProgress: (progressEvent: { loaded: number; total: number }) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          setUploadProgress(progress)
        },
      })

      setIsUploading(false)
      setIsProcessing(true)

      const analysisResponse = await fetch('/api/analyze/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_url: blob.url
        }),
      })

      if (!analysisResponse.ok) {
        let errorMsg = 'Errore elaborazione'
        try {
          const errorData = await analysisResponse.json()
          errorMsg = errorData.error || errorData.detail || errorMsg
        } catch {
          const text = await analysisResponse.text()
          errorMsg = text || errorMsg
        }
        throw new Error(errorMsg)
      }

      const analysisResult = await analysisResponse.json()

      const formatted = formatApiResult(analysisResult)

      if (formatted) {
        toast.success("Analisi completata!", {
          description: "I risultati sono pronti"
        })
        onAnalysisComplete(formatted)
      } else {
        throw new Error("Formato risultato non valido")
      }

      setIsProcessing(false)
      setSelectedFile(null)
      setActiveTab("video")

    } catch (error) {
      toast.error("Errore", {
        description: error instanceof Error ? error.message : "Errore sconosciuto"
      })
      setIsUploading(false)
      setIsProcessing(false)
    }
  }

  const isButtonDisabled = sessionStatus === 'loading' || isUploading || isProcessing || !selectedFile

  const getButtonText = () => {
    if (isUploading) return `Caricamento... ${uploadProgress}%`
    if (isProcessing) return "Elaborazione in corso..."
    if (sessionStatus === 'loading') return "Verifica..."
    if (sessionStatus === 'unauthenticated') return "Accedi per analizzare"
    return "Elabora"
  }

  const getButtonIcon = () => {
    if (isProcessing) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    if (isUploading) return <CloudUpload className="mr-2 h-4 w-4 animate-bounce" />
    if (sessionStatus === 'loading') return <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    return <Upload className="mr-2 h-4 w-4" />
  }

  return (
    <Card className="border-0 shadow-lg bg-white overflow-hidden w-full">
      <CardHeader className="bg-gradient-to-r from-primary to-primary-600 text-white rounded-t-lg p-4 sm:p-6">
        <div>
          <CardTitle className="text-xl sm:text-2xl text-center md:text-left mb-2 sm:mb-3">Carica la tua lezione</CardTitle>
          <CardDescription className="text-primary-100 text-sm hidden md:block">
            Carica un file video o audio della lezione universitaria
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 md:p-6">
        {(isUploading || isProcessing) && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-1">
                  {isUploading ? "Upload in corso" : "Elaborazione in corso"}
                </h3>
                <p className="text-sm text-orange-700">
                  {isUploading ? "Non chiudere questa pagina durante l'upload." : "Attendi il completamento dell'elaborazione."}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isUploading && !isProcessing && (
          <Tabs defaultValue="video" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="video" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <FileVideo className="w-4 h-4" />
                Video
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <FileAudio className="w-4 h-4" />
                Audio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="video" className="mt-0">
              {!selectedFile ? (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 transition-colors min-h-[200px] sm:min-h-[240px]",
                    dragActive ? "border-primary bg-primary-50" : "border-gray-300",
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileVideo className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
                  <p className="text-center mb-3 sm:mb-4 text-sm sm:text-base px-2">
                    Trascina qui il tuo file video o{" "}
                    <span
                      className="text-primary cursor-pointer hover:underline font-medium"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      sfoglia
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">Supporta .mp4, .mov, .avi</p>
                  <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <FileVideo className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{selectedFile.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearSelection} className="flex-shrink-0">
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="audio" className="mt-0">
              {!selectedFile ? (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 transition-colors min-h-[200px] sm:min-h-[240px]",
                    dragActive ? "border-primary bg-primary-50" : "border-gray-300",
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileAudio className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
                  <p className="text-center mb-3 sm:mb-4 text-sm sm:text-base px-2">
                    Trascina qui il tuo file audio o{" "}
                    <span
                      className="text-primary cursor-pointer hover:underline font-medium"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      sfoglia
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">Supporta .mp3, .wav, .m4a, .ogg</p>
                  <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <FileAudio className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{selectedFile.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearSelection} className="flex-shrink-0">
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {isUploading && (
          <div className="mt-6 space-y-2">
            <Progress value={uploadProgress} className="w-full h-2" />
            <p className="text-sm text-center text-muted-foreground">
              Caricamento file...
            </p>
          </div>
        )}

        {isProcessing && (
          <p className="text-sm text-center text-muted-foreground mt-6">
            Elaborazione in corso... L'operazione sarà completata in pochi secondi.
          </p>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t p-3 sm:p-4 md:p-6">
        <Button
          className="bg-primary text-white hover:bg-primary/90 w-full sm:w-auto sm:min-w-[200px] text-sm sm:text-base"
          onClick={handleProcessClick}
          disabled={isButtonDisabled}
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  )
}
