import { AchievementDef, AchievementContext, PlayerProfileData, SessionSummary } from '../types';

const categoryCorrect = (ctx: AchievementContext, category: string): number =>
  ctx.categoryCorrect[category] ?? 0;

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Answer your first question',
    icon: 'foot-print',
    condition: (c) => c.totalAnswered >= 1,
  },
  {
    id: 'streak_3',
    name: 'Hat-Trick',
    description: 'Get a 3 answer streak',
    icon: 'fire',
    condition: (c) => c.bestStreak >= 3,
  },
  {
    id: 'streak_5',
    name: 'Hot Streak',
    description: 'Get a 5 answer streak',
    icon: 'fire-circle',
    condition: (c) => c.bestStreak >= 5,
  },
  {
    id: 'streak_10',
    name: 'Trial by Fire',
    description: 'Get a 10 answer streak',
    icon: 'lightning-bolt',
    condition: (c) => c.bestStreak >= 10,
  },
  {
    id: 'perfect_game',
    name: 'Flawless Victory',
    description: 'Finish a game with every answer correct',
    icon: 'trophy',
    condition: (c) => c.perfectGames >= 1 || c.sessionPerfect,
  },
  {
    id: 'no_lifeline',
    name: 'Apne Dum Par',
    description: 'Score 8+ in a game without using lifelines',
    icon: 'arm-flex',
    condition: (c) => c.sessionLifelinesUsed === 0 && c.sessionCorrect >= 8,
  },
  {
    id: 'historian',
    name: 'History Buff',
    description: 'Answer 10 History questions correctly',
    icon: 'bank',
    condition: (c) => categoryCorrect(c, 'history') >= 10,
  },
  {
    id: 'culture_fan',
    name: 'Culture Master',
    description: 'Answer 10 Culture questions correctly',
    icon: 'theater',
    condition: (c) => categoryCorrect(c, 'culture') >= 10,
  },
  {
    id: 'festival_fan',
    name: 'Festival Fan',
    description: 'Answer 10 Festival questions correctly',
    icon: 'party-popper',
    condition: (c) => categoryCorrect(c, 'festivals') >= 10,
  },
  {
    id: 'myth_scholar',
    name: 'Mythology Scholar',
    description: 'Answer 10 Mythology questions correctly',
    icon: 'book-open-page-variant',
    condition: (c) => categoryCorrect(c, 'mythology') >= 10,
  },
  {
    id: 'geographer',
    name: 'Geography Whiz',
    description: 'Answer 10 Geography questions correctly',
    icon: 'earth',
    condition: (c) => categoryCorrect(c, 'geography') >= 10,
  },
  {
    id: 'level_5',
    name: 'Scholar',
    description: 'Reach level 5',
    icon: 'shield-star',
    condition: (c) => c.level >= 5,
  },
  {
    id: 'level_10',
    name: 'Grandmaster',
    description: 'Reach level 10',
    icon: 'crown',
    condition: (c) => c.level >= 10,
  },
  {
    id: 'correct_50',
    name: 'Half-Century',
    description: '50 total correct answers',
    icon: 'star-circle',
    condition: (c) => c.totalCorrect >= 50,
  },
  {
    id: 'correct_100',
    name: 'Centurion',
    description: '100 total correct answers',
    icon: 'star-shooting',
    condition: (c) => c.totalCorrect >= 100,
  },
  {
    id: 'games_10',
    name: 'Regular Player',
    description: 'Play 10 games',
    icon: 'gamepad-variant',
    condition: (c) => c.gamesPlayed >= 10,
  },
];

const byId = new Map<string, AchievementDef>(ACHIEVEMENTS.map((a) => [a.id, a]));

export function getAchievement(id: string): AchievementDef {
  const a = byId.get(id);
  if (!a) throw new Error(`Unknown achievement: ${id}`);
  return a;
}

export function checkNewAchievements(
  profile: PlayerProfileData,
  sessionSummary: SessionSummary
): AchievementDef[] {
  const ctx: AchievementContext = {
    totalXp: profile.totalXp,
    totalAnswered: profile.totalAnswered,
    totalCorrect: profile.totalCorrect,
    bestStreak: profile.bestStreak,
    gamesPlayed: profile.gamesPlayed,
    perfectGames: profile.perfectGames,
    level: levelForXp(profile.totalXp),
    categoryCorrect: { ...profile.categoryCorrect },
    sessionPerfect: sessionSummary.perfect,
    sessionBestStreak: sessionSummary.bestStreak,
    sessionXp: sessionSummary.xpEarned,
    sessionCorrect: sessionSummary.correct,
    sessionLifelinesUsed: sessionSummary.lifelinesUsed,
  };

  const earned = new Set(profile.achievements);
  return ACHIEVEMENTS.filter((a) => !earned.has(a.id) && a.condition(ctx));
}

export function xpToReach(level: number): number {
  return 50 * (level - 1) * level;
}

export function levelForXp(totalXp: number): number {
  let level = 1;
  while (xpToReach(level + 1) <= totalXp) {
    level += 1;
  }
  return level;
}

const LEVEL_TITLES: [number, string][] = [
  [13, 'Grandmaster'],
  [11, 'Illuminated'],
  [9, 'Mentor'],
  [7, 'Pundit'],
  [5, 'Scholar'],
  [3, 'Apprentice'],
  [1, 'Novice'],
];

export function titleForLevel(level: number): string {
  for (const [minLevel, title] of LEVEL_TITLES) {
    if (level >= minLevel) return title;
  }
  return LEVEL_TITLES[LEVEL_TITLES.length - 1][1];
}
