'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'
import { TranscriberHero } from '@/src/components/transcriber/transcriber-hero'
import { TranscriberForm } from '@/src/components/transcriber/transcriber-form'
import { TranscriptResult } from '@/src/components/transcriber/transcript-result'
import { HowItWorks } from '@/src/components/transcriber/how-it-works'
import { UpgradeCTADialog } from '@/src/components/transcriber/upgrade-cta-dialog'
import { Sparkles } from 'lucide-react'

export default function YouTubeTranscriberPage() {
    const [youtubeUrl, setYoutubeUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [videoTitle, setVideoTitle] = useState('')
    const [copied, setCopied] = useState(false)
    const [showCTADialog, setShowCTADialog] = useState(false)

    const handleTranscribe = async () => {
        if (!youtubeUrl.trim()) {
            toast.error('Inserisci un URL di YouTube valido')
            return
        }

        setIsLoading(true)
        setTranscript('')
        setVideoTitle('')

        try {
            const response = await fetch('/api/public-transcribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    youtube_url: youtubeUrl
                }),
            })

            if (!response.ok) {
                const error = await response.json()

                if (response.status === 429) {
                    throw new Error('Hai raggiunto il limite di trascrizioni gratuite. Riprova tra qualche minuto o registrati per limiti più alti.')
                }

                throw new Error(error.error || 'Errore durante la trascrizione')
            }

            const data = await response.json()
            setTranscript(data.transcript)
            setVideoTitle(data.title)

            toast.success('Trascrizione completata!', {
                description: 'Il testo è pronto'
            })

            setTimeout(() => {
                setShowCTADialog(true)
            }, 1000)

        } catch (error) {
            toast.error('Errore', {
                description: error instanceof Error ? error.message : 'Impossibile trascrivere il video'
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(transcript)
        setCopied(true)
        toast.success('Testo copiato!')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <TranscriberHero />

                <TranscriberForm
                    youtubeUrl={youtubeUrl}
                    isLoading={isLoading}
                    onUrlChange={setYoutubeUrl}
                    onSubmit={handleTranscribe}
                />

                {transcript && (
                    <Card className="shadow-xl border-2 mt-6">
                        <CardContent className="p-6">
                            <TranscriptResult
                                transcript={transcript}
                                videoTitle={videoTitle}
                                copied={copied}
                                onCopy={handleCopy}
                            />

                            <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-violet-50 mt-6">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 rounded-full p-3 flex-shrink-0">
                                            <Sparkles className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-slate-900 mb-2">
                                                Trascrizione completata!
                                            </h4>
                                            <p className="text-slate-700 mb-3">
                                                Ora puoi copiare il testo oppure scoprire come <span className="font-semibold text-primary">AppuntoAI</span> può aiutarti a studiare meglio.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                )}

                <HowItWorks />

                <footer className="mt-16 text-center text-slate-600 text-sm">
                    <p>
                        Powered by <Link href="/" className="text-primary hover:underline font-semibold">AppuntoAI</Link> - L'assistente AI per studenti
                    </p>
                </footer>
            </div>

            <UpgradeCTADialog
                open={showCTADialog}
                onClose={() => setShowCTADialog(false)}
            />
        </div>
    )
}


