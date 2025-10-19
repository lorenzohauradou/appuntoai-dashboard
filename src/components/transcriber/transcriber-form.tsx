import { Youtube, Loader2 } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'

interface TranscriberFormProps {
    youtubeUrl: string
    isLoading: boolean
    onUrlChange: (url: string) => void
    onSubmit: () => void
}

export function TranscriberForm({ youtubeUrl, isLoading, onUrlChange, onSubmit }: TranscriberFormProps) {
    return (
        <Card className="shadow-xl border-2">
            <CardHeader className="bg-gradient-to-r from-primary to-violet-600 text-white">
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Youtube className="h-6 w-6" />
                    Trascrizione Automatica
                </CardTitle>
                <CardDescription className="text-white/90">
                    Incolla l'URL del video YouTube qui sotto
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex gap-3 mb-6">
                    <Input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => onUrlChange(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 h-12 text-base"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isLoading) {
                                onSubmit()
                            }
                        }}
                    />
                    <Button
                        onClick={onSubmit}
                        disabled={isLoading || !youtubeUrl.trim()}
                        size="lg"
                        className="bg-primary hover:bg-primary/90 px-8"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Trascrizione...
                            </>
                        ) : (
                            <>
                                <Youtube className="mr-2 h-5 w-5" />
                                Trascrivi
                            </>
                        )}
                    </Button>
                </div>

                {isLoading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                        <p className="text-blue-900 font-medium">
                            Stiamo scaricando i sottotitoli...
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                            Questo richiederà solo pochi secondi
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

