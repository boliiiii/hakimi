
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  FEEDBACK = 'FEEDBACK',
  TUTORIAL = 'TUTORIAL',
  DAILY_SETUP = 'DAILY_SETUP'
}

export enum GameMode {
  CLASSIC = 'CLASSIC',
  DAILY = 'DAILY'
}

export enum HakimiMood {
  NEUTRAL = 'NEUTRAL',
  HAPPY = 'HAPPY',
  ANGRY = 'ANGRY',
  THINKING = 'THINKING',
  DEVIL = 'DEVIL'
}

export interface MathProblem {
  id: string;
  expression: string;
  answer: number;
}

export interface GameSession {
  mode: GameMode;
  nLevel: number; // 1-Back, 2-Back, etc.
  score: number;
  totalQuestions: number;
  maxCombo: number;
  durationMinutes?: number;
  history: {
    question: string;
    userAnswer: string;
    correctAnswer: number;
    isCorrect: boolean;
    timeTakenMs: number;
  }[];
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  nLevel: number;
  score: number;
}

export type Language = 'zh' | 'en';
