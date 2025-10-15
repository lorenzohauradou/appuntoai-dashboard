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
      suggested_questions: []
    };
  }

  const formattedResults: ResultsType = {
    summary: result.riassunto || "",
    contentType: "lezione" as const,
    keyPoints: result.concetti_chiave || [],
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
  
  return formattedResults;
};
