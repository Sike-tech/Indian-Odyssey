import { CategoryKey, Difficulty, Question, QuestionView, AnswerResult, SessionSummary } from '../types';
import { DIFFICULTY_XP, questionsForCategory } from '../data/questions';
import { checkNewAchievements } from '../data/achievements';
import { PlayerProfile } from './player';

export const QUESTIONS_PER_GAME = 10;
export const FIFTY_FIFTY_USES = 2;
export const SKIP_USES = 2;
export const STREAK_STEP = 0.1;
export const STREAK_CAP = 10;

export class QuizSession {
  profile: PlayerProfile;
  category: CategoryKey | 'mixed' | null;
  rng: () => number;
  questions: Question[];

  index = 0;
  answered = 0;
  correctCount = 0;
  wrongCount = 0;
  skippedCount = 0;
  streak = 0;
  bestStreak = 0;
  xpEarned = 0;
  levelUps: number[] = [];
  lifelines = { fifty: FIFTY_FIFTY_USES, skip: SKIP_USES };

  private currentOptions: string[] = [];
  private currentCorrect = 0;
  private currentRaw?: Question;
  private fiftyRemoved = new Set<number>();
  private fiftyUsedHere = false;
  private answeredCurrent = false;

  constructor(
    profile: PlayerProfile,
    category?: CategoryKey | 'mixed' | null,
    numQuestions = QUESTIONS_PER_GAME,
    rng: () => number = Math.random
  ) {
    this.profile = profile;
    this.category =
      category && category !== 'mixed'
        ? (category as CategoryKey)
        : null;
    this.rng = rng;

    const pool = questionsForCategory(this.category);
    this.questions = shuffle(pool, this.rng).slice(0, Math.max(1, numQuestions));
  }

  get total(): number {
    return this.questions.length;
  }

  get finished(): boolean {
    return this.index >= this.total;
  }

  get perfect(): boolean {
    return (
      this.wrongCount === 0 &&
      this.skippedCount === 0 &&
      this.correctCount === this.total
    );
  }

  currentQuestion(): QuestionView {
    const raw = this.questions[this.index];
    const order = shuffleIndices(4, this.rng);
    this.currentOptions = order.map((i) => raw.options[i]);
    this.currentCorrect = order.indexOf(raw.answer);
    this.currentRaw = raw;
    this.fiftyRemoved.clear();
    this.fiftyUsedHere = false;
    this.answeredCurrent = false;

    return {
      qid: raw.id,
      category: raw.category,
      difficulty: raw.difficulty as Difficulty,
      text: raw.question,
      options: [...this.currentOptions],
      position: this.index + 1,
      total: this.total,
    };
  }

  answer(optionIndex: number): AnswerResult {
    if (this.finished || this.answeredCurrent) {
      throw new Error('No active question to answer');
    }
    if (this.fiftyRemoved.has(optionIndex)) {
      throw new Error('Option was removed by 50:50');
    }

    this.answeredCurrent = true;
    const raw = this.currentRaw!;
    const isCorrect = optionIndex === this.currentCorrect;
    this.answered += 1;
    let xp = 0;
    const gainedLevels: number[] = [];

    if (isCorrect) {
      this.correctCount += 1;
      this.streak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      const base = DIFFICULTY_XP[raw.difficulty as Difficulty];
      const mult = 1 + STREAK_STEP * Math.min(this.streak - 1, STREAK_CAP);
      xp = Math.round(base * mult);
      const { oldLevel, newLevel } = this.profile.addXp(xp);
      this.xpEarned += xp;
      if (newLevel > oldLevel) {
        for (let l = oldLevel + 1; l <= newLevel; l += 1) {
          gainedLevels.push(l);
          this.levelUps.push(l);
        }
      }
    } else {
      this.wrongCount += 1;
      this.streak = 0;
    }

    this.profile.recordAnswer(raw.category, isCorrect);
    this.index += 1;

    return {
      correct: isCorrect,
      correctIndex: this.currentCorrect,
      xpGained: xp,
      fact: raw.fact,
      streak: this.streak,
      finished: this.finished,
      levelUps: gainedLevels,
    };
  }

  useFiftyFifty(): number[] {
    if (this.answeredCurrent || this.finished) {
      throw new Error('Cannot use 50:50 now');
    }
    if (this.fiftyUsedHere) {
      throw new Error('50:50 already used on this question');
    }
    if (this.lifelines.fifty <= 0) {
      throw new Error('No 50:50 lifelines left');
    }

    const wrong = Array.from({ length: 4 }, (_, i) => i).filter(
      (i) => i !== this.currentCorrect && !this.fiftyRemoved.has(i)
    );
    const removed = shuffle(wrong, this.rng).slice(0, 2).sort((a, b) => a - b);
    removed.forEach((i) => this.fiftyRemoved.add(i));
    this.fiftyUsedHere = true;
    this.lifelines.fifty -= 1;
    return removed;
  }

  useSkip(): void {
    if (this.answeredCurrent || this.finished) {
      throw new Error('Cannot skip now');
    }
    if (this.lifelines.skip <= 0) {
      throw new Error('No skip lifelines left');
    }
    this.lifelines.skip -= 1;
    this.skippedCount += 1;
    this.index += 1;
  }

  get lifelinesUsed(): number {
    return (
      FIFTY_FIFTY_USES -
      this.lifelines.fifty +
      (SKIP_USES - this.lifelines.skip)
    );
  }

  summary(): SessionSummary {
    return {
      category: this.category ?? 'mixed',
      answered: this.answered,
      correct: this.correctCount,
      wrong: this.wrongCount,
      skipped: this.skippedCount,
      total: this.total,
      bestStreak: this.bestStreak,
      xpEarned: this.xpEarned,
      perfect: this.perfect,
      lifelinesUsed: this.lifelinesUsed,
      levelUps: [...this.levelUps],
    };
  }

  finalize() {
    this.profile.recordSession(this.bestStreak, this.perfect);
    const newBadges = checkNewAchievements(this.profile.toJSON(), this.summary());
    newBadges.forEach((b) => this.profile.addAchievement(b.id));
    return newBadges;
  }
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleIndices(n: number, rng: () => number): number[] {
  return shuffle(Array.from({ length: n }, (_, i) => i), rng);
}
