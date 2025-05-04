import { ResultsType } from '@/components/dashboard/types'; // Assicurati che il percorso sia corretto

// Tipo per i risultati grezzi dall'API (esempio, potrebbe essere più specifico)
type RawApiResult = any; 

// Estrai la funzione formatApiResult
export const formatApiResult = (result: RawApiResult): ResultsType | null => {
  console.log("[[[ formatApiResult INIZIO (da lib/formatters) ]]]"); 
  if (!result) {
    console.error("[[[ formatApiResult ERRORE (da lib/formatters): Input 'result' è null o undefined ]]]");
    // Restituisci un oggetto di errore minimo ma valido per ResultsType
    return { 
      summary: "Errore: Dati API grezzi mancanti o non validi.", 
      contentType: 'meeting', // o un valore di default sensato
      decisions:[], 
      tasks:[], 
      themes:[], 
      participants:[], 
      transcript_id: undefined, 
      suggested_questions: [] 
      // Aggiungi qui altri campi obbligatori di ResultsType con valori vuoti/default
    };
  }

  console.log("[[[ formatApiResult Input 'result' RAW (da lib/formatters) ]]]:", result);
  try {
    console.log("[[[ formatApiResult Input 'result' JSON.stringify (da lib/formatters) ]]]:", JSON.stringify(result));
  } catch (e) {
    console.error("[[[ formatApiResult ERRORE JSON.stringify (da lib/formatters) ]]]:", e);
  }

  // Assicurati che tipo_contenuto sia una stringa prima di chiamare toLowerCase
  const category = typeof result.tipo_contenuto === 'string' ? result.tipo_contenuto.toLowerCase() : 'meeting'; // Default a meeting se non è stringa
  console.log(`[[[ formatApiResult Categoria rilevata (da lib/formatters): ${category} ]]]`);

  let formattedResults: ResultsType;

  if (category === "lesson" || category === "lezione") { // Gestisci entrambi per sicurezza
      console.log("[[[ formatApiResult Blocco 'lezione' ESEGUITO (da lib/formatters) ]]]");
      formattedResults = {
        summary: result.riassunto || "",
        contentType: "lezione" as const,
        keyPoints: result.concetti_chiave || [],
        exercises: (result.esercizi || []).map((ex: { descrizione: string; scadenza?: string; data_iso?: string }) => ({
           description: ex.descrizione || "N/A",
           deadline: ex.scadenza,
           date_iso: ex.data_iso
        })),
        topics: result.argomenti || [],
        participants: (result.partecipanti || []).map((participant: { nome: string; ruolo?: string }) => ({
          name: participant.nome || "Non specificato",
          role: participant.ruolo || 'Docente/Relatore',
        })),
        possibleQuestions: result.possibili_domande_esame || [],
        bibliography: result.bibliografia || [],
        transcript_id: result.transcript_id,
        suggested_questions: result.suggested_questions || [],
      };
    } else if (category === "interview" || category === "intervista") { // Gestisci entrambi
       console.log("[[[ formatApiResult Blocco 'intervista' ESEGUITO (da lib/formatters) ]]]");
       const interviewData = result as any; 
       formattedResults = {
         summary: interviewData.riassunto || "",
         contentType: "intervista" as const,
         domande_principali: interviewData.domande_principali || [],
         risposte_chiave: interviewData.risposte_chiave || [],
         punti_salienti: interviewData.punti_salienti || [],
         temi_principali: interviewData.temi_principali || [], 
         participants: (interviewData.partecipanti || []).map((participant: { nome: string; ruolo?: string }) => ({
          name: participant.nome || "Non specificato",
          role: participant.ruolo || 'Intervistatore/Intervistato',
         })),
         transcript_id: interviewData.transcript_id,
         suggested_questions: interviewData.suggested_questions || [],
       };
    } else { // Default a Meeting
      console.log(`[[[ formatApiResult Blocco 'meeting' (default) ESEGUITO (da lib/formatters) perché categoria è '${category}' ]]]`);
      formattedResults = {
        summary: result.riassunto || "",
        contentType: "meeting" as const,
        decisions: result.decisioni || [],
        tasks: (result.tasks || []).map((task: { descrizione: string; assegnatario?: string; scadenza?: string; priorita?: string; categoria?: string }) => ({
          task: task.descrizione || "",
          assignee: task.assegnatario || "Non specificato",
          deadline: task.scadenza || 'Non specificata',
          priority: task.priorita || 'Media',
          category: task.categoria || 'Generale',
        })),
        themes: result.temi_principali || [],
        participants: (result.partecipanti || []).map((participant: { nome: string; ruolo?: string }) => ({
          name: participant.nome || "Non specificato",
          role: participant.ruolo || 'Partecipante',
        })),
        transcript_id: result.transcript_id,
        suggested_questions: result.suggested_questions || [],
      };
    }
    console.log("[[[ formatApiResult Ritorno formattato (da lib/formatters): ]]]", formattedResults);
    return formattedResults;
};
