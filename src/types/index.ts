export type CategoryKey = 'history' | 'culture' | 'festivals' | 'mythology' | 'geography';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  category: CategoryKey;
  difficulty: Difficulty;
  question: string;
  options: string[];
  answer: number;
  fact: string;
}

export interface CategoryMeta {
  name: string;
  hinglish: string;
  icon: string;
  color: string;
}

export interface PlayerProfileData {
  totalXp: number;
  coins: number;
  totalAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  gamesPlayed: number;
  perfectGames: number;
  categoryAnswered: Record<string, number>;
  categoryCorrect: Record<string, number>;
  achievements: string[];
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  totalXp: number;
  totalAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  gamesPlayed: number;
  perfectGames: number;
  level: number;
  categoryCorrect: Record<string, number>;
  sessionPerfect: boolean;
  sessionBestStreak: number;
  sessionXp: number;
  sessionCorrect: number;
  sessionLifelinesUsed: number;
}

export interface QuestionView {
  qid: string;
  category: CategoryKey;
  difficulty: Difficulty;
  text: string;
  options: string[];
  position: number;
  total: number;
}

export interface AnswerResult {
  correct: boolean;
  correctIndex: number;
  xpGained: number;
  fact: string;
  streak: number;
  finished: boolean;
  levelUps: number[];
}

export interface SessionSummary {
  category: CategoryKey | 'mixed';
  answered: number;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  bestStreak: number;
  xpEarned: number;
  coinsEarned: number;
  perfect: boolean;
  lifelinesUsed: number;
  levelUps: number[];
}

export type RootStackParamList = {
  Home: undefined;
  Quiz: { category?: CategoryKey | 'mixed' } | undefined;
  Result: {
    summary: SessionSummary;
    newBadges: string[];
  };
  Achievements: undefined;
  LevelSelect: undefined;
  RoyalElephant: { level?: number } | undefined;
};

