
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  FEEDBACK = 'FEEDBACK',
  TUTORIAL = 'TUTORIAL'
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
  nLevel: number; // 1-Back, 2-Back, etc.
  score: number;
  totalQuestions: number;
  maxCombo: number;
  history: {
    question: string;
    userAnswer: string;
    correctAnswer: number;
    isCorrect: boolean;
    timeTakenMs: number;
  }[];
}

export type Language = 'zh' | 'en';
