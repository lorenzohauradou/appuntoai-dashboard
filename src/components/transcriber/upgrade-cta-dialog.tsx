'use client'

import { Dialog, DialogContent, DialogTitle } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Sparkles, X } from 'lucide-react'
import Link from 'next/link'

interface UpgradeCTADialogProps {
    open: boolean
    onClose: () => void
}

export function UpgradeCTADialog({ open, onClose }: UpgradeCTADialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogTitle className="sr-only">
                    Scopri AppuntoAI
                </DialogTitle>

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <div className="text-center pt-6 pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-violet-600 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-3">
                        Trascrizione Completata! 🎉
                    </h2>

                    <p className="text-slate-600 mb-6">
                        Vuoi sfruttare al massimo questa trascrizione con l'intelligenza artificiale?
                    </p>

                    <div className="bg-gradient-to-br from-primary/5 to-violet-50 rounded-lg p-5 mb-6 text-left">
                        <h3 className="font-semibold text-slate-900 mb-3">
                            Con AppuntoAI puoi:
                        </h3>
                        <ul className="space-y-2.5">
                            <li className="flex items-start gap-2.5 text-sm text-slate-700">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span><strong>Generare riassunti</strong> intelligenti in pochi secondi</span>
                            </li>
                            <li className="flex items-start gap-2.5 text-sm text-slate-700">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span><strong>Creare mappe concettuali</strong> interattive</span>
                            </li>
                            <li className="flex items-start gap-2.5 text-sm text-slate-700">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span><strong>Chattare con l'AI</strong> per approfondire</span>
                            </li>
                            <li className="flex items-start gap-2.5 text-sm text-slate-700">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span><strong>Generare flashcard</strong> per studiare meglio</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <Link href="/dashboard" className="block">
                            <Button
                                className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 text-white h-12 text-base font-semibold shadow-lg"
                            >
                                <Sparkles className="mr-2 h-5 w-5" />
                                Prova Gratis AppuntoAI
                            </Button>
                        </Link>

                        <Button
                            onClick={onClose}
                            variant="ghost"
                            className="w-full text-slate-600"
                        >
                            No, grazie
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

