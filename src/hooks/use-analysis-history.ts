import { useState, useEffect } from "react"

export function useAnalysisHistory() {
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  useEffect(() => {
    setAnalysisHistory([])
  }, [])

  const refreshHistory = () => {
    console.log("Refresh history chiamato")
  }

  const handleDeleteFile = (fileId: string) => {
    setAnalysisHistory(prev => prev.filter(f => f.id !== fileId))
  }

  return {
    analysisHistory,
    isLoadingHistory,
    refreshHistory,
    handleDeleteFile
  }
}

