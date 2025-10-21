"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Progress } from "@/src/components/ui/progress"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Crown, Zap } from "lucide-react"
import Link from "next/link"

interface UsageInfo {
    subscriptionStatus: string
    currentCount: number
    limit: number
    remaining: number
}

export function UsageLimitBadge() {
    const { data: session, status } = useSession()
    const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "authenticated") {
            fetchUsageInfo()
        }
    }, [status])

    const fetchUsageInfo = async () => {
        try {
            const response = await fetch('/api/usage')
            if (response.ok) {
                const data = await response.json()
                setUsageInfo(data)
            }
        } catch (error) {
            console.error('Errore nel recupero delle info di utilizzo:', error)
        } finally {
            setLoading(false)
        }
    }

    if (status !== "authenticated" || loading || !usageInfo) {
        return null
    }

    const percentage = (usageInfo.currentCount / usageInfo.limit) * 100
    const isFree = usageInfo.subscriptionStatus === "free"
    const isNearLimit = percentage >= 80

    return (
        <div className="px-3 py-2 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isFree ? (
                        <Badge variant="outline" className="text-xs">
                            Piano Gratuito
                        </Badge>
                    ) : (
                        <Badge className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                            <Crown className="h-3 w-3 mr-1" />
                            {usageInfo.subscriptionStatus === "pro" ? "Premium" : "Business"}
                        </Badge>
                    )}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                    {usageInfo.currentCount}/{usageInfo.limit} analisi
                </span>
            </div>

            <Progress
                value={percentage}
                className={`h-1.5 ${isNearLimit ? 'bg-red-100' : ''}`}
            />

            {isFree && isNearLimit && (
                <Link href="/#prezzi">
                    <Button
                        size="sm"
                        className="w-full h-8 text-xs bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700"
                    >
                        <Zap className="h-3 w-3 mr-1" />
                        Passa a Premium
                    </Button>
                </Link>
            )}
        </div>
    )
}

