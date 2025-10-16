"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Youtube, Loader2, Link } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { toast } from 'sonner'
import { ResultsType } from "@/src/components/dashboard/types"

interface YoutubeSectionProps {
    onAnalysisComplete: (results: ResultsType) => void
    formatApiResult: (result: any) => ResultsType | null
}

export function YoutubeSection({ onAnalysisComplete, formatApiResult }: YoutubeSectionProps) {
    const [youtubeUrl, setYoutubeUrl] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const { data: session, status: sessionStatus } = useSession()

    const extractVideoId = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
        ]

        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match) return match[1]
        }

        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
            return url
        }

        return null
    }

    const handleAnalyze = async () => {
        if (sessionStatus === 'unauthenticated') {
            toast.error("Accesso richiesto", {
                description: "Devi effettuare l'accesso per analizzare video YouTube"
            })
            return
        }

        if (!youtubeUrl.trim()) {
            toast.warning("URL mancante", {
                description: "Inserisci un URL di YouTube valido"
            })
            return
        }

        const videoId = extractVideoId(youtubeUrl)
        if (!videoId) {
            toast.error("URL non valido", {
                description: "L'URL di YouTube inserito non è valido"
            })
            return
        }

        try {
            setIsProcessing(true)

            const response = await fetch('/api/analyze-youtube', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ youtube_url: youtubeUrl }),
            })

            if (!response.ok) {
                let errorMsg = 'Errore elaborazione'
                try {
                    const errorData = await response.json()
                    errorMsg = errorData.error || errorData.detail || errorMsg
                } catch {
                    const text = await response.text()
                    errorMsg = text || errorMsg
                }
                throw new Error(errorMsg)
            }

            const analysisResult = await response.json()
            const formatted = formatApiResult(analysisResult)

            if (formatted) {
                toast.success("Analisi completata!", {
                    description: "Il video YouTube è stato analizzato con successo"
                })
                onAnalysisComplete(formatted)
                setYoutubeUrl("")
            } else {
                throw new Error("Formato risultato non valido")
            }

        } catch (error) {
            toast.error("Errore", {
                description: error instanceof Error ? error.message : "Errore sconosciuto"
            })
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Card className="border-0 shadow-md bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-primary-600 text-white rounded-t-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                        <Youtube className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl font-semibold mb-1">
                            Analizza Video YouTube
                        </CardTitle>
                        <CardDescription className="text-purple-50 text-sm">
                            Inserisci l'URL di un video YouTube per analizzarlo
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                            <Input
                                type="text"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                disabled={isProcessing}
                                className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 h-11"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isProcessing) {
                                        handleAnalyze()
                                    }
                                }}
                            />
                        </div>
                        <Button
                            onClick={handleAnalyze}
                            disabled={isProcessing || !youtubeUrl.trim()}
                            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white min-w-[130px] h-11 font-medium shadow-md hover:shadow-lg transition-all"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analisi...
                                </>
                            ) : (
                                <>
                                    <Youtube className="mr-2 h-4 w-4" />
                                    Analizza
                                </>
                            )}
                        </Button>
                    </div>

                    {isProcessing && (
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 rounded-full p-2">
                                    <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-purple-900">
                                        Elaborazione video YouTube in corso...
                                    </p>
                                    <p className="text-xs text-purple-700 mt-1">
                                        Stiamo scaricando i sottotitoli e analizzando il contenuto
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-purple-50/50 to-violet-50/50 border border-purple-100 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="text-purple-600 text-lg flex-shrink-0 mt-0.5">💡</div>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium text-purple-900">Suggerimento:</span> Funziona con qualsiasi video YouTube che ha sottotitoli disponibili (automatici o manuali).
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

