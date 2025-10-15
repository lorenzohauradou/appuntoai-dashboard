"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { MessageSquare, Send, User, Bot, Loader2 } from "lucide-react"
import { toast } from 'sonner'

interface ChatMessage {
    role: "user" | "assistant"
    content: string
}

interface ChatInterfaceProps {
    transcriptId: string
    fileName: string
}

export function ChatInterface({ transcriptId, fileName }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = input
        setInput("")
        setMessages(prev => [...prev, { role: "user", content: userMessage }])

        const isFirstMessage = messages.length === 0
        if (isFirstMessage) {
            setIsInitializing(true)
        } else {
            setIsLoading(true)
        }

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transcript_id: transcriptId,
                    message: userMessage,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Errore sconosciuto" }))
                throw new Error(errorData.detail || `Errore ${response.status}`)
            }

            const data = await response.json()
            setMessages(prev => [...prev, { role: "assistant", content: data.response }])
        } catch (error: any) {
            console.error("Errore invio messaggio:", error)
            toast.error("Errore", { description: error.message || "Impossibile inviare il messaggio" })
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: "Mi dispiace, si è verificato un errore. Riprova." }
            ])
        } finally {
            setIsLoading(false)
            setIsInitializing(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-background to-muted/20">
            <div className="flex items-center gap-3 p-4 border-b bg-card shadow-sm">
                <MessageSquare className="h-6 w-6 text-primary" />
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-semibold truncate">Chat con {fileName}</h1>
                    <p className="text-sm text-muted-foreground">Fai domande sulla lezione</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isInitializing ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                        <p className="text-lg font-medium">
                            Inizializzazione chat...
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Sto preparando il documento per la chat
                        </p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">
                            Inizia a chattare!
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Fai una domanda sulla lezione per iniziare
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, i) => (
                            <div
                                key={i}
                                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`flex gap-3 max-w-[80%] p-4 rounded-lg shadow-sm ${message.role === "user"
                                        ? "bg-primary text-primary-foreground ml-auto"
                                        : "bg-card border"
                                        }`}
                                >
                                    {message.role === "assistant" && (
                                        <Bot className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    )}
                                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                    {message.role === "user" && (
                                        <User className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 max-w-[80%] p-4 rounded-lg shadow-sm bg-card border">
                                    <Bot className="h-5 w-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-muted-foreground">Sto pensando...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <div className="p-4 border-t bg-card shadow-lg">
                <div className="flex gap-2 max-w-4xl mx-auto">
                    <Input
                        placeholder="Scrivi un messaggio..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading || isInitializing}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading || isInitializing}
                        size="icon"
                        className="shrink-0"
                    >
                        {isLoading || isInitializing ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

