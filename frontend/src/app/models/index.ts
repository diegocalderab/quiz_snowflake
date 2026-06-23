export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Question {
  id: number;
  area: string;
  question: string;
  options: string[];
  choose_n: number;
  correct: string[];
  explanation: string;
  reference: string;
  attempts?: number;
  correct_streak?: number;
  last_correct?: boolean;
  last_seen?: string;
  next_due?: string;
}

export interface AreaStat {
  area: string;
  total: number;
  attempted: number;
  correct: number;
  due: number;
}

export interface GlobalStat {
  total: number;
  attempted: number;
  correct: number;
  due: number;
}

export interface StatsResponse {
  global: GlobalStat;
  areas: AreaStat[];
  recent_sessions: QuizSession[];
}

export interface QuizSession {
  mode: string;
  area?: string;
  total: number;
  correct: number;
  finished_at: string;
}
