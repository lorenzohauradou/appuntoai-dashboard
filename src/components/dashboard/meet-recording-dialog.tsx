'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Progress } from '@/src/components/ui/progress'
import {
    Video,
    MonitorPlay,
    Volume2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Square,
    Trash2,
    Send
} from 'lucide-react'
import Image from 'next/image'
import { useScreenRecorder } from '@/src/hooks/use-screen-recorder'
import { toast } from 'sonner'
import { ResultsType } from './types'
import { cn } from '@/src/lib/utils'
import { upload } from '@vercel/blob/client'

interface MeetRecordingDialogProps {
    onAnalysisComplete: (results: ResultsType) => void
}

export function MeetRecordingDialog({ onAnalysisComplete }: MeetRecordingDialogProps) {
    const [open, setOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const {
        isRecording,
        isStopped,
        recordingTime,
        audioBlob,
        audioUrl,
        error,
        startRecording,
        stopRecording,
        clearRecording,
    } = useScreenRecorder()

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleStartRecording = async () => {
        await startRecording()
        setCurrentStep(1)
    }

    const handleAnalyze = async () => {
        if (!audioBlob) {
            toast.error('Errore', { description: 'Nessuna registrazione disponibile' })
            return
        }

        try {
            setIsUploading(true)

            const fileName = `meet-recording-${Date.now()}.webm`
            const blob = await upload(fileName, audioBlob, {
                access: 'public',
                handleUploadUrl: '/api/blob/upload',
                onUploadProgress: (progressEvent: { loaded: number; total: number }) => {
                    const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
                    setUploadProgress(progress)
                },
            })

            setIsUploading(false)
            setIsAnalyzing(true)

            const analysisResponse = await fetch('/api/analyze/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_url: blob.url
                }),
            })

            if (!analysisResponse.ok) {
                throw new Error('Errore durante l\'analisi')
            }

            const analysisResult = await analysisResponse.json()

            toast.success('Analisi completata! 🎉', {
                description: 'La lezione di Google Meet è stata analizzata con successo',
            })

            onAnalysisComplete(analysisResult)
            clearRecording()
            setOpen(false)
            setCurrentStep(1)
        } catch (error) {
            console.error('Errore analisi:', error)
            toast.error('Errore', {
                description: 'Non è stato possibile analizzare la registrazione',
            })
        } finally {
            setIsUploading(false)
            setIsAnalyzing(false)
        }
    }

    const handleClose = () => {
        if (isRecording) {
            stopRecording()
        }
        clearRecording()
        setOpen(false)
        setCurrentStep(1)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 border-2 border-green-500/30 hover:bg-green-50 hover:border-green-500 transition-all"
                >
                    <Image
                        src="/meet.png"
                        alt="Google Meet"
                        width={20}
                        height={20}
                        className="mr-2"
                    />
                    Registra Google Meet
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-transparent rounded-lg">
                            <Image
                                src="/meet.png"
                                alt="Google Meet"
                                width={32}
                                height={32}
                            />
                        </div>
                        <div>
                            <DialogTitle>Registra Lezione da Google Meet</DialogTitle>
                            <DialogDescription>
                                Cattura l'audio della tua chiamata Meet per analizzarlo
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {!isRecording && !isStopped && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div
                                            className={cn(
                                                "h-2 w-8 rounded-full transition-colors",
                                                step === currentStep ? "bg-primary" : step < currentStep ? "bg-primary/40" : "bg-slate-200"
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>

                            {currentStep === 1 && (
                                <div className="space-y-6 animate-in fade-in-50 duration-300">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-bold text-slate-800">Seleziona "Scheda Chrome"</h3>
                                        <p className="text-slate-600">
                                            Nel pop-up che apparirà, clicca sulla tab in alto "Scheda Chrome"
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <div className="aspect-video bg-white rounded-lg overflow-hidden">
                                            <Image
                                                src="/step/step1.png"
                                                alt="Step 1: Seleziona Scheda Chrome"
                                                width={800}
                                                height={450}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setCurrentStep(2)}
                                        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold"
                                        size="lg"
                                    >
                                        Avanti
                                    </Button>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6 animate-in fade-in-50 duration-300">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-bold text-slate-800">Scegli la scheda di Google Meet</h3>
                                        <p className="text-slate-600">
                                            Dalla lista, seleziona la scheda dove è aperta la chiamata Meet
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <div className="aspect-video bg-white rounded-lg overflow-hidden">
                                            <Image
                                                src="/step/step2.png"
                                                alt="Step 2: Scegli scheda Google Meet"
                                                width={800}
                                                height={450}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => setCurrentStep(1)}
                                            variant="outline"
                                            className="flex-1 h-12"
                                            size="lg"
                                        >
                                            Indietro
                                        </Button>
                                        <Button
                                            onClick={() => setCurrentStep(3)}
                                            className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-semibold"
                                            size="lg"
                                        >
                                            Avanti
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6 animate-in fade-in-50 duration-300">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-bold text-slate-800">Spunta "Condividi audio scheda"</h3>
                                        <p className="text-slate-600">
                                            <span className="font-semibold text-emerald-600">⚠️ FONDAMENTALE:</span> In basso a destra del pop-up, assicurati di spuntare la casella "Condividi anche l'audio della scheda"!
                                        </p>
                                    </div>

                                    <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-200">
                                        <div className="aspect-video bg-white rounded-lg overflow-hidden">
                                            <Image
                                                src="/step/step3.png"
                                                alt="Step 3: Spunta Condividi audio scheda"
                                                width={800}
                                                height={450}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>

                                    <Alert className="border-slate-200 bg-slate-50">
                                        <AlertCircle className="h-4 w-4 text-slate-600" />
                                        <AlertDescription className="text-slate-700 text-sm">
                                            Se non spunti questa casella, l'audio non verrà registrato
                                        </AlertDescription>
                                    </Alert>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => setCurrentStep(2)}
                                            variant="outline"
                                            className="flex-1 h-12"
                                            size="lg"
                                        >
                                            Indietro
                                        </Button>
                                        <Button
                                            onClick={handleStartRecording}
                                            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                            size="lg"
                                        >
                                            <Video className="mr-2 h-5 w-5" />
                                            Inizia Registrazione
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-900">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {isRecording && (
                        <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
                                            <Video className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="absolute inset-0 w-12 h-12 bg-green-500 rounded-full animate-ping opacity-75" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-3xl tabular-nums text-gray-900">{formatTime(recordingTime)}</p>
                                        <p className="text-sm text-green-700 font-medium flex items-center gap-2 mt-1">
                                            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                            Registrazione Meet in corso...
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={stopRecording}
                                variant="destructive"
                                className="w-full h-11"
                            >
                                <Square className="h-4 w-4 mr-2" />
                                Ferma Registrazione
                            </Button>
                        </div>
                    )}

                    {audioUrl && isStopped && !isUploading && !isAnalyzing && (
                        <div className="space-y-4">
                            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Registrazione completata</p>
                                        <p className="text-xs text-gray-600">
                                            Durata: {formatTime(recordingTime)}
                                        </p>
                                    </div>
                                </div>

                                <audio
                                    src={audioUrl}
                                    controls
                                    className="w-full h-10 mt-3"
                                    style={{ borderRadius: '8px' }}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleAnalyze}
                                    className="flex-1 h-12 bg-primary text-white hover:bg-primary/90"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Analizza Lezione
                                </Button>
                                <Button
                                    onClick={clearRecording}
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {(isUploading || isAnalyzing) && (
                        <div className="space-y-4 p-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-6 w-6 text-orange-600 animate-spin" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-orange-900">
                                        {isUploading ? 'Caricamento in corso...' : 'Analisi in corso...'}
                                    </h3>
                                    <p className="text-sm text-orange-700">
                                        {isUploading
                                            ? 'Stiamo caricando la registrazione'
                                            : 'Stiamo analizzando la lezione, attendi qualche secondo'}
                                    </p>
                                </div>
                            </div>

                            {isUploading && (
                                <div className="space-y-2">
                                    <Progress value={uploadProgress} className="h-2" />
                                    <p className="text-sm text-center text-orange-600">{uploadProgress}%</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

