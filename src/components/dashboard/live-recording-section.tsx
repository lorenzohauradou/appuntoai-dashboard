'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Progress } from '@/src/components/ui/progress'
import { Mic, Square, Pause, Play, Trash2, Send, Loader2, Radio, Waves } from 'lucide-react'
import { useAudioRecorder } from '@/src/hooks/use-audio-recorder'
import { toast } from 'sonner'
import { ResultsType } from './types'
import { cn } from '@/src/lib/utils'

interface LiveRecordingSectionProps {
    onAnalysisComplete: (results: ResultsType) => void
}

export function LiveRecordingSection({ onAnalysisComplete }: LiveRecordingSectionProps) {
    const {
        isRecording,
        isPaused,
        recordingTime,
        audioBlob,
        audioUrl,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        clearRecording,
        error,
    } = useAudioRecorder()

    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleStartRecording = async () => {
        try {
            await startRecording()
            toast.success('Registrazione avviata', {
                description: 'Parla nel microfono per registrare la lezione',
            })
        } catch (err) {
            toast.error('Errore', {
                description: 'Impossibile avviare la registrazione',
            })
        }
    }

    const handleStopRecording = () => {
        stopRecording()
        toast.info('Registrazione terminata', {
            description: 'Puoi ora analizzare la registrazione',
        })
    }

    const handleAnalyze = async () => {
        if (!audioBlob) {
            toast.error('Errore', { description: 'Nessuna registrazione disponibile' })
            return
        }

        setIsAnalyzing(true)

        try {
            const formData = new FormData()
            const audioFile = new File(
                [audioBlob],
                `recording-${Date.now()}.webm`,
                { type: audioBlob.type }
            )
            formData.append('audio', audioFile)

            const response = await fetch('/api/analyze/live', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Errore durante l\'analisi')
            }

            const data = await response.json()

            toast.success('Analisi completata! 🎉', {
                description: 'La lezione è stata analizzata con successo',
            })

            onAnalysisComplete(data)
            clearRecording()
        } catch (error) {
            console.error('Errore analisi:', error)
            toast.error('Errore', {
                description: 'Non è stato possibile analizzare la registrazione',
            })
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <Card className="w-full border-2 transition-all hover:shadow-md">
            <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            isRecording ? "bg-red-500/10" : "bg-primary/10"
                        )}>
                            <Mic className={cn(
                                "h-5 w-5",
                                isRecording ? "text-red-500" : "text-primary"
                            )} />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Registrazione Live</CardTitle>
                            <CardDescription className="text-sm">
                                Registra e analizza la lezione in tempo reale
                            </CardDescription>
                        </div>
                    </div>

                    {/* Pulsante registrazione */}
                    {!isRecording && !audioUrl && (
                        <Button
                            onClick={handleStartRecording}
                            size="lg"
                            className="h-14 px-8 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all"
                        >
                            <Mic className="h-5 w-5 mr-2" />
                            Inizia Registrazione
                        </Button>
                    )}

                    {isRecording && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                            <Radio className="h-3 w-3 text-red-500 animate-pulse" />
                            <span className="text-xs font-medium text-red-600">LIVE</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Stato registrazione attiva */}
                {isRecording && (
                    <div className="space-y-4 p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                                        <Mic className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="absolute inset-0 w-12 h-12 bg-red-500 rounded-full animate-ping opacity-75" />
                                </div>
                                <div>
                                    <p className="font-bold text-3xl tabular-nums text-gray-900">{formatTime(recordingTime)}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Waves className="h-3 w-3 text-red-600 animate-pulse" />
                                        <p className="text-sm text-gray-700 font-medium">
                                            {isPaused ? 'In pausa' : 'Registrazione in corso...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Progress
                            value={Math.min((recordingTime / 3600) * 100, 100)}
                            className="h-1.5"
                        />

                        <div className="flex gap-2">
                            {!isPaused ? (
                                <Button
                                    onClick={pauseRecording}
                                    variant="outline"
                                    className="flex-1 h-11"
                                >
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pausa
                                </Button>
                            ) : (
                                <Button
                                    onClick={resumeRecording}
                                    variant="outline"
                                    className="flex-1 h-11 border-green-500 text-green-600 hover:bg-green-50"
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    Riprendi
                                </Button>
                            )}
                            <Button
                                onClick={handleStopRecording}
                                variant="destructive"
                                className="flex-1 h-11"
                            >
                                <Square className="h-4 w-4 mr-2" />
                                Ferma
                            </Button>
                        </div>
                    </div>
                )}

                {/* Anteprima audio */}
                {audioUrl && !isRecording && (
                    <div className="space-y-4">
                        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <Mic className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Registrazione completata</p>
                                        <p className="text-xs text-gray-600">
                                            Durata: {formatTime(recordingTime)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <audio
                                src={audioUrl}
                                controls
                                className="w-full h-10 mt-3"
                                style={{
                                    borderRadius: '8px',
                                }}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="flex-1 h-12 bg-primary text-white hover:bg-primary/90"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Analisi in corso...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Analizza Lezione
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={clearRecording}
                                variant="outline"
                                size="icon"
                                className="h-12 w-12"
                                disabled={isAnalyzing}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
