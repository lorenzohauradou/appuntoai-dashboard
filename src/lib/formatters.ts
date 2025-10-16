import { ResultsType } from '@/src/components/dashboard/types'; // Assicurati che il percorso sia corretto

type RawApiResult = any;

export const formatApiResult = (result: RawApiResult): ResultsType | null => {
  if (!result) {
    console.error("formatApiResult: Input 'result' è null o undefined");
    return {
      summary: "Errore: Dati API grezzi mancanti o non validi.",
      contentType: 'lezione',
      keyPoints: [],
      topics: [],
      participants: [],
      possibleQuestions: [],
      bibliography: [],
      transcript_id: undefined,
      suggested_questions: [],
      title: "Lezione"
    };
  }

  const formattedResults: ResultsType = {
    summary: result.riassunto || "",
    contentType: "lezione" as const,
    keyPoints: Array.isArray(result.punti_chiave) ? result.punti_chiave : (Array.isArray(result.concetti_chiave) ? result.concetti_chiave : []),
    topics: Array.isArray(result.argomenti) ? result.argomenti : [],
    participants: Array.isArray(result.partecipanti) ? result.partecipanti.map((participant: { nome: string; ruolo?: string }) => ({
      name: participant.nome || "Non specificato",
      role: participant.ruolo || 'Docente/Relatore',
    })) : [],
    possibleQuestions: Array.isArray(result.possibili_domande) ? result.possibili_domande : (Array.isArray(result.possibili_domande_esame) ? result.possibili_domande_esame : []),
    bibliography: Array.isArray(result.bibliografia) ? result.bibliografia : [],
    transcript_id: result.transcript_id,
    suggested_questions: Array.isArray(result.suggested_questions) ? result.suggested_questions : [],
    title: result.title || "Lezione",
  };
  
  console.log("formatApiResult output:", formattedResults);
  return formattedResults;
};
