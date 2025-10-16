import { useState, useEffect, useCallback } from "react"

export function useAnalysisHistory() {
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch('/api/analyses/history')
      
      if (!response.ok) {
        console.error('Errore nel recupero della cronologia:', response.statusText)
        setAnalysisHistory([])
        return
      }

      const data = await response.json()
      
      const formattedData = data.map((item: any) => ({
        ...item,
        date: item.date ? new Date(item.date).toLocaleDateString('it-IT', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Data non disponibile'
      }))
      
      setAnalysisHistory(formattedData)
    } catch (error) {
      console.error('Errore nel caricamento della cronologia:', error)
      setAnalysisHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const refreshHistory = useCallback(() => {
    console.log("Refresh history chiamato")
    fetchHistory()
  }, [fetchHistory])

  const handleDeleteFile = useCallback(async (fileId: string) => {
    try {
      setAnalysisHistory(prev => prev.filter(f => f.id !== fileId))
      
      const response = await fetch(`/api/analyses/${fileId}`, { 
        method: 'DELETE' 
      })
      
      if (!response.ok) {
        console.error('Errore nell\'eliminazione:', response.statusText)
        fetchHistory()
        throw new Error('Errore nell\'eliminazione')
      }
      
      console.log('File eliminato con successo')
    } catch (error) {
      console.error('Errore nell\'eliminazione del file:', error)
      fetchHistory()
    }
  }, [fetchHistory])

  return {
    analysisHistory,
    isLoadingHistory,
    refreshHistory,
    handleDeleteFile
  }
}

