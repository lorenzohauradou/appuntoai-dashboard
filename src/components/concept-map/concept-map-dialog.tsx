'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { ReactFlowViewer } from './reactflow-viewer'
import { MapLoadingAnimation } from './loading-animation'
import { Download, Network, Info } from 'lucide-react'
import { useToast } from '@/src/components/ui/use-toast'

interface ConceptNode {
    id: string
    label: string
    description: string
    type: string
    category: string
    level: number
}

interface ConceptEdge {
    id: string
    source: string
    target: string
    label: string
    type: string
}

interface ConceptMapDialogProps {
    transcriptId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ConceptMapDialog({ transcriptId, open, onOpenChange }: ConceptMapDialogProps) {
    const [nodes, setNodes] = useState<ConceptNode[]>([])
    const [edges, setEdges] = useState<ConceptEdge[]>([])
    const [loading, setLoading] = useState(false)
    const [nodeCount, setNodeCount] = useState(0)
    const [maxDepth, setMaxDepth] = useState(0)
    const { toast } = useToast()

    const generateMap = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/generate-concept-map', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transcript_id: transcriptId
                }),
            })

            if (!response.ok) {
                throw new Error('Errore nella generazione della mappa')
            }

            const data = await response.json()
            setNodes(data.nodes)
            setEdges(data.edges)
            setNodeCount(data.node_count)
            setMaxDepth(data.max_depth)

            toast({
                title: 'Mappa Generata! ✨',
                description: `${data.node_count} concetti organizzati in ${data.max_depth} livelli`,
            })
        } catch (error) {
            console.error('Errore generazione mappa:', error)
            toast({
                title: 'Errore',
                description: 'Non è stato possibile generare la mappa concettuale',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const exportMap = async () => {
        if (nodes.length === 0) return

        try {
            const reactFlowElement = document.querySelector('.react-flow') as HTMLElement
            if (!reactFlowElement) {
                throw new Error('Elemento React Flow non trovato')
            }

            // Usa html2canvas per catturare la mappa
            const html2canvas = (await import('html2canvas')).default
            const canvas = await html2canvas(reactFlowElement, {
                backgroundColor: '#f9fafb',
                scale: 2, // Alta qualità
                logging: false,
            })

            // Converti in PNG e scarica
            canvas.toBlob((blob) => {
                if (!blob) return
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'mappa-concettuale.png'
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)

                toast({
                    title: 'Mappa Esportata! 📸',
                    description: 'La mappa è stata salvata come immagine PNG',
                })
            })
        } catch (error) {
            console.error('Errore durante l\'esportazione:', error)
            toast({
                title: 'Errore',
                description: 'Non è stato possibile esportare la mappa',
                variant: 'destructive',
            })
        }
    }

    // Auto-genera la mappa quando si apre il dialog
    useEffect(() => {
        if (open && nodes.length === 0 && !loading) {
            generateMap()
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        Mappa Concettuale Interattiva
                    </DialogTitle>
                    <DialogDescription>
                        Esplora i concetti chiave della lezione in modo visuale
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <MapLoadingAnimation />
                ) : nodes.length > 0 ? (
                    <>
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <div className="flex-1 text-sm text-muted-foreground">
                                {nodeCount} concetti • {maxDepth} livelli di profondità
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportMap}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Esporta PNG
                            </Button>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <ReactFlowViewer nodes={nodes} edges={edges} />
                        </div>

                        <div className="pt-2 border-t">
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p><strong>Come usare:</strong> Zoom con rotella mouse • Pan con click e trascina • Clicca sui nodi per info</p>
                                    <div className="flex gap-4 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <span className="inline-block w-3 h-3 rounded bg-purple-500"></span>
                                            Concetto Principale
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="inline-block w-3 h-3 rounded bg-blue-500"></span>
                                            Concetti Chiave
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="inline-block w-3 h-3 rounded bg-green-500"></span>
                                            Definizioni
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="inline-block w-3 h-3 rounded bg-yellow-500"></span>
                                            Esempi
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <Network className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground">Nessuna mappa disponibile</p>
                        <Button onClick={generateMap}>
                            Genera Mappa Concettuale
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
