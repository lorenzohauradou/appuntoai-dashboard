import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from "@/components/ui/use-toast";
import { RecentFileRaw } from '@/components/dashboard/types';

export function useAnalysisHistory() {
  const [analysisHistory, setAnalysisHistory] = useState<RecentFileRaw[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { toast } = useToast(); // O sonner
  const { data: session, status: sessionStatus } = useSession(); // Usa useSession

  const fetchAnalysisHistory = useCallback(async () => {
    if (sessionStatus !== 'authenticated') {
        console.log("useAnalysisHistory: Utente non autenticato, fetch cronologia saltato.");
        setAnalysisHistory([]); // Assicura che la cronologia sia vuota
        setIsLoadingHistory(false); // Togli il caricamento se era attivo
        return; 
    }
    
    setIsLoadingHistory(true); 
    try {
      console.log("Fetching analysis history (from hook, authenticated)...");
      const response = await fetch('/api/analyses/history', {
        method: 'GET',
        headers: { 
            'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
            console.warn("useAnalysisHistory: Ricevuto 401 durante il fetch della cronologia.");
            setAnalysisHistory([]); // Resetta la cronologia
        } else {
            let errorDetail = `Errore HTTP: ${response.status}`;
            try { errorDetail = (await response.json()).detail || errorDetail } catch (e) { /* ignore */ }
            throw new Error(errorDetail);
        }
      } else {
        const historyData = await response.json();
        const rawHistory = historyData.map((item: any): RecentFileRaw => ({
           id: item.transcript_id, // Assicurati che il nome del campo sia corretto
           name: item.title || "Analisi senza titolo",
           type: item.file_type || "text",
           contentType: item.content?.tipo_contenuto || undefined,
           date: new Date(item.created_at).toLocaleString('it-IT'),
           status: "Completato",
           rawData: item.content 
        }));

        setAnalysisHistory(rawHistory);
        console.log("Analysis history fetched and set (from hook):", rawHistory);
      }
    } catch (error) {
      console.error("Errore nel recupero della cronologia (from hook):", error);
      toast({
        title: "Errore Cronologia",
        description: "Impossibile caricare la cronologia delle analisi.",
        variant: "destructive",
      });
      setAnalysisHistory([]); 
    } finally {
       setIsLoadingHistory(false);
    }
  }, [toast, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
        setAnalysisHistory([]);
        setIsLoadingHistory(false);
    } else if (sessionStatus === 'authenticated') {
        fetchAnalysisHistory();
    }
  }, [fetchAnalysisHistory, sessionStatus]);

  const handleDeleteFile = useCallback(async (transcriptIdToDelete: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa analisi? L'azione non può essere annullata.")) {
      return false; // Indica che l'eliminazione non è avvenuta
    }

    console.log(`Tentativo di eliminazione (hook) per ID: ${transcriptIdToDelete}`);
    try {
      const response = await fetch(`/api/analyses/${transcriptIdToDelete}`, {
        method: 'DELETE',
      });

      if (response.status === 204 || response.ok) {
         console.log(`Analisi ${transcriptIdToDelete} eliminata con successo dal server.`);
         // Aggiorna lo stato locale
         setAnalysisHistory(prevHistory => 
           prevHistory.filter(file => file.id !== transcriptIdToDelete)
         );
         toast({ 
           title: "Analisi Eliminata", 
           description: "L'analisi selezionata è stata rimossa con successo.",
         });
         return true; // Successo
      } else {
        let errorDetail = `Errore eliminazione: ${response.status}`;
        try { errorDetail = (await response.json()).detail || errorDetail } catch (e) { /* ignore */ }
        throw new Error(errorDetail);
      }
    } catch (error) {
      console.error("Errore durante l'eliminazione (hook):", error);
      toast({ 
        title: "Errore Eliminazione", 
        description: error instanceof Error ? error.message : "Impossibile eliminare l'analisi.",
        variant: "destructive",
      });
      return false; // Fallimento
    }
  }, [toast]); // Aggiungi dipendenze se necessario

  // La funzione per forzare un refresh della cronologia, se serve
  const refreshHistory = useCallback(() => {
     fetchAnalysisHistory();
  }, [fetchAnalysisHistory]);


  return {
    analysisHistory,
    isLoadingHistory,
    handleDeleteFile,
    refreshHistory // Esponi la funzione di refresh
  };
}
