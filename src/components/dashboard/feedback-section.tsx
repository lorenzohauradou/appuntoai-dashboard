'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/src/components/ui/button'
import { Textarea } from '@/src/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Send, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/src/lib/utils'

export function FeedbackWidget() {
    const { data: session } = useSession()
    const [isExpanded, setIsExpanded] = useState(false)
    const [feedback, setFeedback] = useState('')
    const [isSending, setIsSending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!feedback.trim()) {
            toast.warning('Scrivi qualcosa!', {
                description: 'Il messaggio non può essere vuoto',
            })
            return
        }

        setIsSending(true)

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback }),
            })

            if (!response.ok) {
                throw new Error('Errore invio feedback')
            }

            toast.success('Grazie per il tuo feedback! 💜', {
                description: 'Il tuo messaggio è stato inviato con successo',
            })

            setFeedback('')
            setIsExpanded(false)
        } catch (error) {
            toast.error('Errore', {
                description: 'Non è stato possibile inviare il feedback',
            })
        } finally {
            setIsSending(false)
        }
    }

    const userInitials = session?.user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'U'

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out origin-right",
                    isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
                )}
            >
                <div className="w-[380px] rounded-2xl border-2 border-primary/20 bg-white shadow-2xl">
                    <div className="border-b border-slate-200 bg-gradient-to-r from-primary/5 to-primary/10 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-800">Il tuo feedback conta davvero 💜</h3>
                                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                    Stai usando Appuntoai tra i primi. Il tuo parere è fondamentale: sentiti libero di scrivere tutto ciò che vorresti vedere nell'app!
                                </p>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="text-slate-400 transition-colors hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 space-y-3">
                        <div className="relative">
                            <Textarea
                                placeholder="Scrivi qui il tuo feedback..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                disabled={isSending}
                                rows={4}
                                maxLength={1000}
                                className={cn(
                                    "resize-none border-2 transition-all text-sm",
                                    "focus:border-primary focus:ring-primary/20",
                                    "placeholder:text-muted-foreground/60"
                                )}
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                                {feedback.length}/1000
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSending || !feedback.trim()}
                            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
                            size="sm"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Invio...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Invia Feedback
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "group relative transition-all duration-300",
                    isExpanded && "scale-90"
                )}
            >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/60 opacity-75 blur transition-opacity group-hover:opacity-100" />
                <Avatar className="relative h-14 w-14 border-3 border-white shadow-xl transition-transform group-hover:scale-105">
                    <AvatarImage
                        src={session?.user?.image || undefined}
                        alt={session?.user?.name || 'User'}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-semibold text-lg">
                        {userInitials}
                    </AvatarFallback>
                </Avatar>

                {!isExpanded && (
                    <div className="absolute -right-1 -top-1 h-4 w-4">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-4 w-4 rounded-full bg-primary" />
                    </div>
                )}
            </button>
        </div>
    )
}

