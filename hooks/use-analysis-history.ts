import { useState, useCallback, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast"; // O sonner se hai cambiato
import type { RawApiResult } from '@/components/dashboard/types'; // O dove definito

// Riusa la definizione di RecentFileRaw o importala
interface RecentFileRaw {
  id: string;
  name: string;
  type: string;
  contentType: string | undefined;
  date: string;
  status: string;
  rawData: RawApiResult; 
}

export function useAnalysisHistory() {
  const [analysisHistory, setAnalysisHistory] = useState<RecentFileRaw[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { toast } = useToast(); // O sonner

  const fetchAnalysisHistory = useCallback(async () => {
    setIsLoadingHistory(true); // Ora è corretto impostarlo qui
    try {
      console.log("Fetching analysis history (from hook)...");
      const response = await fetch('/api/analyses/history', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        let errorDetail = `Errore HTTP: ${response.status}`;
        try { errorDetail = (await response.json()).detail || errorDetail } catch (e) { /* ignore */ }
        throw new Error(errorDetail);
      }

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
    } catch (error) {
      console.error("Errore nel recupero della cronologia (from hook):", error);
      toast({
        title: "Errore Cronologia",
        description: "Impossibile caricare la cronologia delle analisi.",
        variant: "destructive",
      });
      setAnalysisHistory([]); // Resetta a vuoto in caso di errore
    } finally {
       setIsLoadingHistory(false);
    }
  }, [toast]);

  // Effetto per il caricamento iniziale
  useEffect(() => {
    fetchAnalysisHistory();
  }, [fetchAnalysisHistory]); // Chiama fetchAnalysisHistory quando l'hook si monta

  const handleDeleteFile = useCallback(async (transcriptIdToDelete: string) => {
    // Metti qui la logica di handleDeleteFile da Dashboard.tsx
    // ... (logica per chiamare API DELETE e aggiornare lo stato analysisHistory) ...
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
