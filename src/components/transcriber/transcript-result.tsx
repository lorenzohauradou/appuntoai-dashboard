import { Copy, Check } from 'lucide-react'
import { Button } from '@/src/components/ui/button'

interface TranscriptResultProps {
    transcript: string
    videoTitle: string
    copied: boolean
    onCopy: () => void
}

export function TranscriptResult({ transcript, videoTitle, copied, onCopy }: TranscriptResultProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-lg text-slate-900">
                        {videoTitle}
                    </h3>
                    <p className="text-sm text-slate-600">
                        {transcript.length.toLocaleString()} caratteri
                    </p>
                </div>
                <Button
                    onClick={onCopy}
                    variant="outline"
                    className="gap-2"
                >
                    {copied ? (
                        <>
                            <Check className="h-4 w-4" />
                            Copiato!
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4" />
                            Copia
                        </>
                    )}
                </Button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-h-96 overflow-y-auto">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {transcript}
                </p>
            </div>
        </div>
    )
}

