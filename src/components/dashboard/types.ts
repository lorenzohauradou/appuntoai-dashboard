export type RawApiResult = any;
export interface Participant {
  name: string;
  role: string;
}

export interface LectureResults {
  contentType: "lezione";
  summary: string;
  keyPoints: string[];
  topics: string[];
  participants: Participant[];
  possibleQuestions: string[];
  bibliography: string[];
  transcript_id?: string;
  suggested_questions?: string[];
}

export type ResultsType = LectureResults;

export interface ResultsDisplayProps {
  results: ResultsType;
  onChatOpen?: () => void;
  onShare: () => void;
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