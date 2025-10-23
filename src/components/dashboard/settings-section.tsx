"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useToast } from "@/src/components/ui/use-toast"
import { Loader2, AlertTriangle, Crown, CheckCircle2 } from "lucide-react"
import { useSession } from "next-auth/react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog"

interface UsageInfo {
    subscriptionStatus: string
    currentCount: number
    limit: number
    remaining: number
}

export function SettingsSection() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [cancelLoading, setCancelLoading] = useState(false)
    const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null)

    useEffect(() => {
        fetchUsageInfo()
    }, [])

    const fetchUsageInfo = async () => {
        try {
            const response = await fetch('/api/usage')
            if (response.ok) {
                const data = await response.json()
                setUsageInfo(data)
            }
        } catch (error) {
            console.error('Errore nel recupero delle informazioni:', error)
        }
    }

    const handleCancelSubscription = async () => {
        setCancelLoading(true)
        try {
            const response = await fetch('/api/cancel-subscription', {
                method: 'POST',
            })

            const data = await response.json()

            if (response.ok) {
                toast({
                    title: "Abbonamento cancellato",
                    description: data.cancelAt
                        ? `Il tuo abbonamento resterà attivo fino al ${data.cancelAt}`
                        : "Il tuo abbonamento è stato cancellato con successo.",
                })
                fetchUsageInfo()
            } else {
                toast({
                    title: "Errore",
                    description: data.error || "Impossibile cancellare l'abbonamento.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error('Errore durante la cancellazione:', error)
            toast({
                title: "Errore",
                description: "Si è verificato un errore durante la cancellazione dell'abbonamento.",
                variant: "destructive",
            })
        } finally {
            setCancelLoading(false)
        }
    }

    const handleUpgrade = async (plan: 'pro' | 'business') => {
        setLoading(true)
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan }),
            })

            const data = await response.json()

            if (response.ok && data.url) {
                window.location.href = data.url
            } else {
                toast({
                    title: "Errore",
                    description: data.error || "Impossibile avviare il checkout.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error('Errore durante il checkout:', error)
            toast({
                title: "Errore",
                description: "Si è verificato un errore durante l'apertura del checkout.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const getPlanName = (status: string) => {
        switch (status) {
            case 'pro':
                return 'Premium'
            case 'business':
                return 'Business'
            default:
                return 'Gratuito'
        }
    }

    const currentPlan = usageInfo?.subscriptionStatus || 'free'
    const isPaidPlan = currentPlan !== 'free'

    return (
        <div className="container max-w-4xl py-8">
            <h1 className="mb-8 text-3xl font-bold">Impostazioni</h1>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {isPaidPlan && <Crown className="h-5 w-5 text-yellow-500" />}
                            Piano Attuale: {getPlanName(currentPlan)}
                        </CardTitle>
                        <CardDescription>
                            {session?.user?.email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {usageInfo && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Analisi questo mese:</span>
                                    <span className="font-medium">
                                        {usageInfo.currentCount} / {usageInfo.limit}
                                    </span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${(usageInfo.currentCount / usageInfo.limit) * 100}%` }}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Ti rimangono {usageInfo.remaining} analisi questo mese
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {isPaidPlan ? (
                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Gestisci Abbonamento
                            </CardTitle>
                            <CardDescription>
                                Cancella il tuo abbonamento. Resterai attivo fino alla fine del periodo di fatturazione.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={cancelLoading}>
                                        {cancelLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Disdici Abbonamento
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Cancellando l&apos;abbonamento perderai l&apos;accesso alle funzionalità premium alla fine del periodo di fatturazione.
                                            Potrai sempre riattivarlo in seguito.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleCancelSubscription}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Conferma Cancellazione
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                ) : (
                    <Card className="border-primary/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-yellow-500" />
                                Passa a Premium
                            </CardTitle>
                            <CardDescription>
                                Sblocca tutte le funzionalità con un abbonamento premium
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Premium</CardTitle>
                                        <div className="text-3xl font-bold">€6.99<span className="text-sm font-normal">/mese</span></div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>20 analisi al mese</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>Chat illimitata con AI</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>Mappe concettuali</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            onClick={() => handleUpgrade('pro')}
                                            disabled={loading}
                                        >
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Scegli Premium
                                        </Button>
                                    </CardFooter>
                                </Card>

                                <Card className="border-primary">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Business</CardTitle>
                                        <div className="text-3xl font-bold">€15.99<span className="text-sm font-normal">/mese</span></div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>60 analisi al mese</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>Chat illimitata con AI</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>Mappe concettuali</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>Supporto prioritario</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            onClick={() => handleUpgrade('business')}
                                            disabled={loading}
                                        >
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Scegli Business
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Informazioni Account</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium">{session?.user?.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Nome:</span>
                            <span className="font-medium">{session?.user?.name || 'Non impostato'}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

