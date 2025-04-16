"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProcessingStatusProps {
  status: string
}

export function ProcessingStatus({ status }: ProcessingStatusProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (status === "processing") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 5
        })
      }, 150)

      return () => clearInterval(interval)
    } else if (status === "completed") {
      setProgress(100)
    }
  }, [status])

  if (status === "completed") {
    return null
  }

  return (
    <Card className="border-0 shadow-md bg-white dark:bg-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          {status === "processing" && <Loader2 className="mr-2 h-5 w-5 animate-spin text-teal-600" />}
          Elaborazione in corso
        </CardTitle>
        <CardDescription>
          {progress < 30 && "Estrazione dell'audio..."}
          {progress >= 30 && progress < 60 && "Trascrizione in corso..."}
          {progress >= 60 && progress < 90 && "Analisi del contenuto..."}
          {progress >= 90 && "Generazione dei risultati..."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="h-2 bg-slate-200 [&>div]:bg-teal-600" />
        <p className="text-right text-sm text-muted-foreground mt-1">{progress}%</p>
      </CardContent>
    </Card>
  )
}
