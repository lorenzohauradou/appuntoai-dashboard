'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/src/components/ui/button"
import { Mic, Play, Trash2, Square, Loader2, Pause } from 'lucide-react'
import { useAudioRecorder } from '@/src/hooks/use-audio-recorder'
import { toast } from 'sonner'

export function InteractiveDemo() {
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
    } = useAudioRecorder()

    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleStartRecording = async () => {
        // Se l'utente non è autenticato, reindirizza al login
        if (sessionStatus === 'unauthenticated') {
            toast.info('Login necessario', {
                description: 'Effettua il login per registrare e analizzare la lezione',
            })
            router.push('/login')
            return
        }

        if (sessionStatus === 'loading') {
            return
        }

        try {
            await startRecording()
            toast.success('Registrazione avviata', {
                description: 'Parla nel microfono per registrare',
            })
        } catch (err) {
            toast.error('Errore', {
                description: 'Impossibile avviare la registrazione',
            })
        }
    }

    const handleStopRecording = () => {
        stopRecording()
        toast.info('Registrazione terminata')
    }

    const handleAnalyze = async () => {
        if (!audioBlob) return

        setIsAnalyzing(true)

        try {
            const formData = new FormData()
            const audioFile = new File(
                [audioBlob],
                `recording-${Date.now()}.webm`,
                { type: audioBlob.type }
            )
            formData.append('audio', audioFile)

            const response = await fetch('/api/analyze-live', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Errore durante l\'analisi')
            }

            const data = await response.json()

            toast.success('Analisi completata! 🎉', {
                description: 'Vai alla dashboard per vedere i risultati',
            })

            // Passa i dati attraverso sessionStorage
            sessionStorage.setItem('latestAnalysis', JSON.stringify(data))
            router.push('/dashboard?showResults=true')
        } catch (error) {
            console.error('Errore analisi:', error)
            toast.error('Errore', {
                description: 'Non è stato possibile analizzare la registrazione',
            })
        } finally {
            setIsAnalyzing(false)
        }
    }

    const progressPercentage = audioUrl ? 100 : isRecording ? 33 : 0

    return (
        <div className="relative w-full max-w-[500px] rounded-xl border bg-white p-4 shadow-lg">
            <div className="rounded-lg bg-slate-50/60 p-4">
                <h3 className="mb-4 text-center text-lg font-medium">Demo interattiva</h3>

                <div className="mx-auto mb-6 h-1.5 w-full max-w-[250px] overflow-hidden rounded-full bg-slate-200">
                    <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white/70 p-6">
                    <div className="flex h-full flex-col items-center justify-center">
                        <div className="mb-8 text-center">
                            <p className="text-5xl font-bold tracking-tight">{formatTime(recordingTime)}</p>
                            {isRecording && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    {isPaused ? 'In pausa' : 'Registrazione in corso...'}
                                </p>
                            )}
                        </div>

                        {!audioUrl && (
                            <div className="flex items-center justify-center gap-6">
                                {isRecording && (
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-14 w-14 rounded-full border-2 shadow-sm"
                                        onClick={isPaused ? resumeRecording : pauseRecording}
                                    >
                                        <span className="sr-only">{isPaused ? 'Riprendi' : 'Pausa'}</span>
                                        {isPaused ? (
                                            <Play className="h-6 w-6" />
                                        ) : (
                                            <Pause className="h-6 w-6" />
                                        )}
                                    </Button>
                                )}

                                <Button
                                    size="icon"
                                    className={`h-24 w-24 rounded-full text-white shadow-lg ${isRecording
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-[#e84bbd] hover:bg-[#e84bbd]/90'
                                        }`}
                                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                                    disabled={sessionStatus === 'loading'}
                                >
                                    <span className="sr-only">{isRecording ? 'Ferma' : 'Registra'}</span>
                                    {isRecording ? (
                                        <Square className="h-8 w-8" />
                                    ) : (
                                        <Mic className="h-10 w-10" />
                                    )}
                                </Button>

                                {isRecording && (
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-14 w-14 rounded-full border-2 shadow-sm"
                                        onClick={() => {
                                            stopRecording()
                                            clearRecording()
                                        }}
                                    >
                                        <span className="sr-only">Elimina</span>
                                        <Trash2 className="h-6 w-6" />
                                    </Button>
                                )}
                            </div>
                        )}

                        {audioUrl && !isRecording && (
                            <div className="w-full space-y-4">
                                <audio
                                    src={audioUrl}
                                    controls
                                    className="w-full rounded-lg"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        onClick={clearRecording}
                                        variant="outline"
                                        className="flex-1"
                                        disabled={isAnalyzing}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Elimina
                                    </Button>
                                </div>
                            </div>
                        )}

                        {audioUrl && !isAnalyzing && (
                            <Button
                                className="mt-6 bg-[#7c3aed] text-white hover:bg-[#7c3aed]/90 px-10 rounded-full shadow-md"
                                onClick={handleAnalyze}
                            >
                                Analizza
                            </Button>
                        )}

                        {isAnalyzing && (
                            <Button
                                className="mt-6 bg-[#7c3aed] text-white px-10 rounded-full shadow-md"
                                disabled
                            >
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Analisi in corso...
                            </Button>
                        )}

                        {!isRecording && !audioUrl && (
                            <p className="mt-8 text-sm text-slate-500 text-center">
                                {sessionStatus === 'unauthenticated'
                                    ? 'Clicca il microfono per iniziare (richiede login)'
                                    : 'Prova! Clicca il microfono per iniziare a registrare'
                                }
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

