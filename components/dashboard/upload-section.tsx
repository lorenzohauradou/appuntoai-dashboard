"use client"

import type React from "react"

import { useState, useRef } from "react"
import { FileVideo, FileAudio, FileText, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface UploadSectionProps {
  onUpload: (type: string, data: any) => void
}

export function UploadSection({ onUpload }: UploadSectionProps) {
  const [activeTab, setActiveTab] = useState("video")
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      (activeTab === "text" && file.name.endsWith(".txt"))
    ) {
      setSelectedFile(file)
    } else {
      alert("Il tipo di file non corrisponde alla scheda selezionata")
    }
  }

  const handleUploadClick = () => {
    if (activeTab === "text" && textInput) {
      onUpload("text", textInput)
    } else if (selectedFile) {
      onUpload(activeTab, selectedFile)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="bg-gradient-to-r from-primary to-primary-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Carica il tuo contenuto</CardTitle>
        <CardDescription className="text-primary-100">
          Carica un file video, audio o inserisci direttamente il testo
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="video" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                <p className="text-sm text-muted-foreground text-center">Supporta .mp4, .mov, .avi (max 500MB)</p>
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
                <p className="text-sm text-muted-foreground text-center">Supporta .mp3, .wav, .m4a, .ogg (max 100MB)</p>
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
                <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={handleFileChange} />
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
      <CardFooter className="flex justify-end border-t p-6">
        <Button
          className="bg-primary text-white hover:bg-primary/90"
          onClick={handleUploadClick}
          disabled={(activeTab !== "text" || !textInput) && !selectedFile}
        >
          <Upload className="mr-2 h-4 w-4" />
          Elabora
        </Button>
      </CardFooter>
    </Card>
  )
}
