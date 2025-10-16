export type RawApiResult = any;
export interface Participant {
  name: string;
  role: string;
}

export interface ExamQuestion {
  domanda: string;
  risposta: string;
}

export interface LectureResults {
  contentType: "lezione";
  summary: string;
  keyPoints: string[];
  topics: string[];
  participants: Participant[];
  possibleQuestions: (string | ExamQuestion)[];
  bibliography: string[];
  transcript_id?: string;
  suggested_questions?: string[];
  title?: string;
}

export type ResultsType = LectureResults;

export interface ResultsDisplayProps {
  results: ResultsType;
  onChatOpen?: () => void;
}

export interface RecentFileRaw {
  id: string;
  name: string;
  type: string; // file_type: 'audio', 'video'
  contentType: string; // content_type: 'lesson', 'lezione'
  date: string;
  status: string;
  rawData: RawApiResult;
}