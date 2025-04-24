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

// Tipi per gli esercizi
export interface Exercise {
  description: string;
  deadline?: string; // Opzionale come nel backend
  date_iso?: string; // Opzionale come nel backend
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
  exercises: Exercise[];
  topics: string[];
  participants: Participant[];
  possibleQuestions: string[];
  bibliography: string[];
  teacher: string | null;
  transcript_id?: string;
  suggested_questions?: string[];
}

// Interfaccia per i risultati di interviste - AGGIORNATA
export interface InterviewResults {
  contentType: "intervista";
  summary: string;
  // Rimuovi i vecchi campi
  // questions: string[];
  // answers: string[];
  // Aggiungi i nuovi campi che arrivano da AnalysisResponse
  domande_principali?: string[]; // Mantenuto per potenziale uso futuro, anche se mappato da punti_salienti
  risposte_chiave?: string[];   // Mantenuto per potenziale uso futuro, anche se mappato da punti_salienti
  punti_salienti?: string[];    // La lista di stringhe "D: ... - R: ..."
  temi_principali?: string[];   // Nuovo nome per i temi
  participants: Participant[];
  intervistatore?: string | null; // Aggiunto
  intervistato?: string | null;   // Aggiunto
  transcript_id?: string;
  suggested_questions?: string[];
  // Rimuovi 'themes' se non più usato, 'temi_principali' è il campo corretto
  // themes: string[];
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