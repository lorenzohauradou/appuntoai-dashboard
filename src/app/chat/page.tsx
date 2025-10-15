"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ChatInterface } from '@/src/components/chat/chat-interface'

function ChatContent() {
    const searchParams = useSearchParams()
    const transcriptId = searchParams.get('transcriptId')
    const fileName = searchParams.get('fileName') || 'Lezione'

    if (!transcriptId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">ID trascrizione mancante</p>
            </div>
        )
    }

    return <ChatInterface transcriptId={transcriptId} fileName={fileName} />
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Caricamento...</div>}>
            <ChatContent />
        </Suspense>
    )
}

