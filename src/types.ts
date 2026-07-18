export type PracticeModule = 'communication' | 'hr' | 'technical';

export interface Question {
  id: string;
  module: PracticeModule;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  promptText: string;
  rubricId: string;
  companyStyle?: string;
  codeTemplate?: string;
  language?: string;
}

export interface DimensionScore {
  name: string;
  score: number; // 1 to 5
  description: string;
}

export interface Evaluation {
  id: string;
  responseId: string;
  overallScore: number; // 1-100 or 1-5 average
  dimensionScores: DimensionScore[];
  strengths: string[];
  improvements: string[];
  rewrittenSentence?: string; // Communication Lab specific
  followUpQuestion?: string; // HR specific
  suggestedCodeSolution?: string; // Technical specific
  evaluatedAt: string;
}

export interface ResponseAttempt {
  id: string;
  questionId: string;
  module: PracticeModule;
  rawText: string; // User speech/text answer
  code?: string; // Technical specific code
  thinkAloudText?: string; // Technical specific explanation
  submittedAt: string;
  evaluation?: Evaluation;
  followUpAnswers?: {
    question: string;
    answer: string;
    evaluation?: Evaluation;
  }[];
}

export interface STARStory {
  id: string;
  competency: string;
  questionId: string;
  questionText: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection: string;
  lastUpdated: string;
}

export interface UserStats {
  streak: number;
  lastActive: string | null;
  totalSessions: number;
  totalEvaluations: number;
  rollingAverages: {
    [module: string]: {
      [dimension: string]: number;
    };
  };
}
