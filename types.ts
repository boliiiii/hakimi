

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  FEEDBACK = 'FEEDBACK',
  TUTORIAL = 'TUTORIAL',
  DAILY_SETUP = 'DAILY_SETUP',
  STAGE_TRANSITION = 'STAGE_TRANSITION'
}

export enum GameMode {
  ADVENTURE = 'ADVENTURE', // Replaces CLASSIC
  DAILY = 'DAILY'
}

export enum HakimiMood {
  NEUTRAL = 'NEUTRAL',
  HAPPY = 'HAPPY',
  ANGRY = 'ANGRY',
  THINKING = 'THINKING',
  DEVIL = 'DEVIL'
}

export enum LayoutMode {
  AUTO = 'AUTO',
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE'
}

export interface MathProblem {
  id: string;
  expression: string;
  answer: number;
}

export interface GameSession {
  mode: GameMode;
  nLevel: number; // Current level (for Adventure) or Ending level (for Daily)
  score: number;
  totalQuestions: number;
  maxCombo: number;
  durationMinutes?: number;
  maxDailyLevelReached?: number; // Track peak performance in daily
  history: {
    question: string;
    userAnswer: string;
    correctAnswer: number;
    isCorrect: boolean;
    timeTakenMs: number;
    stageLevel?: number; // Track which level this question belonged to
  }[];
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  nLevel: number; // Max level reached
  score: number;
}

export type Language = 'zh' | 'en';