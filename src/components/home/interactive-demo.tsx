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

            const response = await fetch('/api/analyze/live', {
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
        <div className="relative w-full max-w-[500px]">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-8 shadow-2xl backdrop-blur-sm">
                <h3 className="mb-6 text-center text-2xl font-semibold text-slate-800">Demo interattiva</h3>

                <div className="mx-auto mb-8 h-2 w-full max-w-[280px] overflow-hidden rounded-full bg-slate-200/80 shadow-inner">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#e84bbd] transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-white p-8 shadow-inner">
                    <div className="flex h-full min-h-[380px] flex-col items-center justify-center">
                        <div className="mb-10 text-center">
                            <p className="text-6xl font-bold tracking-tight text-slate-800">
                                {formatTime(recordingTime)}
                            </p>
                            {isRecording && (
                                <div className="mt-3 flex items-center justify-center gap-2">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                    <p className="text-sm font-medium text-slate-600">
                                        {isPaused ? 'In pausa' : 'Registrazione in corso'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {!audioUrl && (
                            <div className="flex items-center justify-center gap-4">
                                {isRecording && (
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-16 w-16 rounded-full border-2 border-slate-300 bg-white shadow-lg transition-all hover:scale-105 hover:border-[#7c3aed] hover:bg-white"
                                        onClick={isPaused ? resumeRecording : pauseRecording}
                                    >
                                        <span className="sr-only">{isPaused ? 'Riprendi' : 'Pausa'}</span>
                                        {isPaused ? (
                                            <Play className="h-7 w-7 text-slate-700" fill="currentColor" />
                                        ) : (
                                            <Pause className="h-7 w-7 text-slate-700" />
                                        )}
                                    </Button>
                                )}

                                <button
                                    className={`group relative h-32 w-32 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ${isRecording
                                        ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                        : 'bg-gradient-to-br from-[#e84bbd] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#e84bbd]'
                                        }`}
                                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                                    disabled={sessionStatus === 'loading'}
                                >
                                    <span className="sr-only">{isRecording ? 'Ferma' : 'Registra'}</span>
                                    <div className="flex h-full w-full items-center justify-center">
                                        {isRecording ? (
                                            <Square className="h-12 w-12 text-white" fill="currentColor" />
                                        ) : (
                                            <Mic className="h-16 w-16 text-white transition-transform group-hover:scale-110" strokeWidth={2} />
                                        )}
                                    </div>
                                </button>

                                {isRecording && (
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-16 w-16 rounded-full border-2 border-slate-300 bg-white shadow-lg transition-all hover:scale-105 hover:border-red-400 hover:bg-white"
                                        onClick={() => {
                                            stopRecording()
                                            clearRecording()
                                        }}
                                    >
                                        <span className="sr-only">Elimina</span>
                                        <Trash2 className="h-7 w-7 text-red-500" />
                                    </Button>
                                )}
                            </div>
                        )}
                        {audioUrl && !isRecording && (
                            <div className="w-full space-y-5">
                                <div className="overflow-hidden rounded-xl bg-white p-4 shadow-md">
                                    <audio
                                        src={audioUrl}
                                        controls
                                        className="w-full"
                                    />
                                </div>
                                <Button
                                    onClick={clearRecording}
                                    variant="outline"
                                    className="w-full rounded-xl border-2 border-slate-300 bg-white py-6 text-slate-700 shadow-sm transition-all hover:border-red-400 hover:bg-white"
                                    disabled={isAnalyzing}
                                >
                                    <Trash2 className="mr-2 h-5 w-5 text-red-500" />
                                    Elimina registrazione
                                </Button>
                            </div>
                        )}

                        {audioUrl && !isAnalyzing && (
                            <Button
                                className="mt-6 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#e84bbd] px-12 py-6 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                                onClick={handleAnalyze}
                            >
                                Analizza Registrazione
                            </Button>
                        )}

                        {isAnalyzing && (
                            <Button
                                className="mt-6 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#e84bbd] px-12 py-6 text-lg font-semibold text-white shadow-lg"
                                disabled
                            >
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Analisi in corso...
                            </Button>
                        )}

                        {!isRecording && !audioUrl && (
                            <p className="mt-10 max-w-[280px] text-center text-sm text-slate-500">
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

