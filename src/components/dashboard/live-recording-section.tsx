'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Progress } from '@/src/components/ui/progress'
import { Mic, Square, Pause, Play, Trash2, Send, Loader2, Radio, Waves } from 'lucide-react'
import { useAudioRecorder } from '@/src/hooks/use-audio-recorder'
import { toast } from 'sonner'
import { ResultsType } from './types'
import { MeetRecordingDialog } from './meet-recording-dialog'

interface LiveRecordingSectionProps {
    onAnalysisComplete: (results: ResultsType) => void
}

export function LiveRecordingSection({ onAnalysisComplete }: LiveRecordingSectionProps) {
    const { data: session, status: sessionStatus } = useSession()
    const router = useRouter()
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
        if (sessionStatus === 'unauthenticated') {
            toast.error('Accesso richiesto', {
                description: 'Devi effettuare l\'accesso per registrare',
                action: {
                    label: 'Accedi',
                    onClick: () => window.location.href = '/login'
                }
            })
            return
        }

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
                const errorData = await response.json().catch(() => ({}))
                const errorMsg = errorData.error || 'Errore durante l\'analisi'

                if (response.status === 403) {
                    toast.error("Limite Raggiunto", {
                        description: errorMsg,
                        duration: 10000,
                        action: {
                            label: "Passa a Premium",
                            onClick: () => router.push('/#prezzi')
                        }
                    })
                    setIsAnalyzing(false)
                    return
                }

                throw new Error(errorMsg)
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
            <CardHeader className="space-y-1 pb-4 p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <div>
                            <CardTitle className="text-lg sm:text-xl">Registrazione Live</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                Registra e analizza la lezione in tempo reale
                            </CardDescription>
                        </div>
                    </div>

                    {!isRecording && !audioUrl && (
                        <div className="flex gap-2 w-full sm:w-auto">
                            <MeetRecordingDialog onAnalysisComplete={onAnalysisComplete} />
                            <Button
                                onClick={handleStartRecording}
                                size="default"
                                className="h-11 sm:h-14 px-4 sm:px-8 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all text-sm sm:text-base flex-1 sm:flex-initial"
                            >
                                <Mic className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Registra Audio</span>
                                <span className="sm:hidden">Audio</span>
                            </Button>
                        </div>
                    )}

                    {isRecording && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                            <Radio className="h-3 w-3 text-red-500 animate-pulse" />
                            <span className="text-xs font-medium text-red-600">LIVE</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4 p-3 sm:p-4 md:p-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {isRecording && (
                    <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                                        <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    </div>
                                    <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-full animate-ping opacity-75" />
                                </div>
                                <div>
                                    <p className="font-bold text-2xl sm:text-3xl tabular-nums text-gray-900">{formatTime(recordingTime)}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Waves className="h-3 w-3 text-red-600 animate-pulse" />
                                        <p className="text-xs sm:text-sm text-gray-700 font-medium">
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

                {audioUrl && !isRecording && (
                    <div className="space-y-3 sm:space-y-4">
                        <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <Mic className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900">Registrazione completata</p>
                                        <p className="text-xs text-gray-600">
                                            Durata: {formatTime(recordingTime)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <audio
                                src={audioUrl}
                                controls
                                className="w-full h-8 sm:h-10 mt-3"
                                style={{
                                    borderRadius: '8px',
                                }}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="flex-1 h-11 sm:h-12 bg-primary text-white hover:bg-primary/90 text-sm sm:text-base"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        <span className="hidden sm:inline">Analisi in corso...</span>
                                        <span className="sm:hidden">Analizzando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Analizza Lezione</span>
                                        <span className="sm:hidden">Analizza</span>
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={clearRecording}
                                variant="outline"
                                size="icon"
                                className="h-11 sm:h-12 w-11 sm:w-12"
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
