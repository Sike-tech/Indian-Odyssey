import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerProfileData } from '../types';

const SAVE_KEY = '@bharat_gyaan_save_v1';
const RE_SAVE_KEY = '@royal_elephant_progress_v1';

export async function loadProfile(): Promise<PlayerProfileData | null> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PlayerProfileData;
    // Temporary: inject 10k coins for testing
    if (data.coins === undefined || data.coins === 0) {
      data.coins = 10000;
      await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(data));
    }
    return data;
  } catch (e) {
    console.warn('Failed to load profile:', e);
    return null;
  }
}

export async function saveProfile(profile: PlayerProfileData): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save profile:', e);
  }
}

export async function clearProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
  } catch (e) {
    console.warn('Failed to clear profile:', e);
  }
}

export interface LevelProgress {
  stars: number; // 0 = not completed, 1-3 stars
  bestMoves: number;
}

export type LevelProgressMap = Record<number, LevelProgress>;

export async function loadLevelProgress(): Promise<LevelProgressMap> {
  try {
    const raw = await AsyncStorage.getItem(RE_SAVE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LevelProgressMap;
  } catch (e) {
    console.warn('Failed to load level progress:', e);
    return {};
  }
}

export async function saveLevelProgress(progress: LevelProgressMap): Promise<void> {
  try {
    await AsyncStorage.setItem(RE_SAVE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save level progress:', e);
  }
}
