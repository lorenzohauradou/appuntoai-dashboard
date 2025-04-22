// Definizioni di tipi condivisi per i componenti della dashboard

// Tipi per i partecipanti
export interface Participant {
  name: string;
  role: string;
}

// Tipi per i task
export interface Task {
  task: string;
  assignee: string;
  deadline: string;
  priority: string;
  category: string;
}

// Interfaccia per i risultati di meeting
export interface MeetingResults {
  contentType: "meeting";
  summary: string;
  decisions: string[];
  tasks: Task[];
  themes: string[];
  participants: Participant[];
  transcript_id?: string;
  suggested_questions?: string[];
}

// Interfaccia per i risultati di lezioni
export interface LectureResults {
  contentType: "lezione";
  summary: string;
  keyPoints: string[];
  exercises: string[];
  topics: string[];
  participants: Participant[];
  possibleQuestions: string[];
  bibliography: string[];
  teacher: string | null;
  transcript_id?: string;
  suggested_questions?: string[];
}

// Interfaccia per i risultati di interviste
export interface InterviewResults {
  contentType: "intervista";
  summary: string;
  questions: string[]; // Domande principali
  answers: string[];   // Risposte significative
  quotes: string[];    // Citazioni rilevanti
  participants: Participant[];
  themes: string[];      // Temi trattati
  transcript_id?: string;
  suggested_questions?: string[];
}

// Tipo unione per tutti i tipi di risultati
export type ResultsType = MeetingResults | LectureResults | InterviewResults;

// Interfaccia per le props del componente ResultsDisplay
export interface ResultsDisplayProps {
  results: ResultsType;
  onChatOpen: () => void;
  onDownload: () => void;
  onShare: () => void;
} 