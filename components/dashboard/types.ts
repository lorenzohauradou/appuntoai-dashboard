// Definizioni di tipi condivisi per i componenti della dashboard

export type RawApiResult = any;
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
  transcript_id?: string;
  suggested_questions?: string[];
}

// Interfaccia per i risultati di interviste - AGGIORNATA
export interface InterviewResults {
  contentType: "intervista";
  summary: string;
  //campi che arrivano da AnalysisResponse
  domande_principali?: string[]; // Mantenuto per potenziale uso futuro, anche se mappato da punti_salienti
  risposte_chiave?: string[];   // Mantenuto per potenziale uso futuro, anche se mappato da punti_salienti
  punti_salienti?: string[];    // La lista di stringhe "D: ... - R: ..."
  temi_principali?: string[];
  participants: Participant[];

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

export interface RecentFileRaw {
  id: string;
  name: string;
  type: string; // file_type: 'audio', 'video', 'text'
  contentType: string; // content_type: 'meeting', 'lesson', 'interview'
  date: string;
  status: string;
  rawData: RawApiResult;
}
export type PriorityStyle = {
  variant: "destructive" | "default" | "secondary" | "outline";
  icon: React.ReactNode | null;
  className: string;
}