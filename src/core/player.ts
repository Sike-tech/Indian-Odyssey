import { PlayerProfileData } from '../types';
import { levelForXp, titleForLevel } from '../data/achievements';

export const DEFAULT_PROFILE: PlayerProfileData = {
  totalXp: 0,
  coins: 10000,
  totalAnswered: 0,
  totalCorrect: 0,
  bestStreak: 0,
  gamesPlayed: 0,
  perfectGames: 0,
  categoryAnswered: {},
  categoryCorrect: {},
  achievements: [],
};

export class PlayerProfile {
  data: PlayerProfileData;

  constructor(data: Partial<PlayerProfileData> = {}) {
    this.data = { ...DEFAULT_PROFILE, ...data };
  }

  get totalXp(): number {
    return this.data.totalXp;
  }

  set totalXp(value: number) {
    this.data.totalXp = value;
  }

  get coins(): number {
    return this.data.coins;
  }

  addCoins(amount: number): void {
    this.data.coins = Math.max(0, this.data.coins + amount);
  }

  get level(): number {
    return levelForXp(this.data.totalXp);
  }

  get title(): string {
    return titleForLevel(this.level);
  }

  get totalAnswered(): number {
    return this.data.totalAnswered;
  }

  get totalCorrect(): number {
    return this.data.totalCorrect;
  }

  get bestStreak(): number {
    return this.data.bestStreak;
  }

  set bestStreak(value: number) {
    this.data.bestStreak = Math.max(this.data.bestStreak, value);
  }

  get gamesPlayed(): number {
    return this.data.gamesPlayed;
  }

  get perfectGames(): number {
    return this.data.perfectGames;
  }

  get achievements(): string[] {
    return this.data.achievements;
  }

  get categoryCorrect(): Record<string, number> {
    return this.data.categoryCorrect;
  }

  xpProgress(): { into: number; needed: number } {
    const currentFloor = 50 * (this.level - 1) * this.level;
    const nextFloor = 50 * this.level * (this.level + 1);
    return {
      into: this.data.totalXp - currentFloor,
      needed: nextFloor - currentFloor,
    };
  }

  addXp(amount: number): { oldLevel: number; newLevel: number } {
    const old = this.level;
    this.data.totalXp += Math.max(0, Math.round(amount));
    return { oldLevel: old, newLevel: this.level };
  }

  recordAnswer(category: string, correct: boolean): void {
    this.data.totalAnswered += 1;
    this.data.categoryAnswered[category] =
      (this.data.categoryAnswered[category] ?? 0) + 1;
    if (correct) {
      this.data.totalCorrect += 1;
      this.data.categoryCorrect[category] =
        (this.data.categoryCorrect[category] ?? 0) + 1;
    }
  }

  recordSession(bestStreak: number, perfect: boolean): void {
    this.data.gamesPlayed += 1;
    this.data.bestStreak = Math.max(this.data.bestStreak, bestStreak);
    if (perfect) {
      this.data.perfectGames += 1;
    }
  }

  addAchievement(id: string): void {
    if (!this.data.achievements.includes(id)) {
      this.data.achievements.push(id);
    }
  }

  reset(): void {
    this.data = { ...DEFAULT_PROFILE };
  }

  toJSON(): PlayerProfileData {
    return { ...this.data };
  }

  static fromJSON(data: unknown): PlayerProfile {
    if (typeof data !== 'object' || data === null) {
      return new PlayerProfile();
    }
    const d = data as Partial<PlayerProfileData>;
    return new PlayerProfile({
      totalXp: d.totalXp ?? 0,
      coins: d.coins ?? 0,
      totalAnswered: d.totalAnswered ?? 0,
      totalCorrect: d.totalCorrect ?? 0,
      bestStreak: d.bestStreak ?? 0,
      gamesPlayed: d.gamesPlayed ?? 0,
      perfectGames: d.perfectGames ?? 0,
      categoryAnswered: d.categoryAnswered ?? {},
      categoryCorrect: d.categoryCorrect ?? {},
      achievements: d.achievements ?? [],
    });
  }
}

export { levelForXp, titleForLevel };
