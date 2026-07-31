import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerProfileData } from '../types';

const SAVE_KEY = '@bharat_gyaan_save_v1';

export async function loadProfile(): Promise<PlayerProfileData | null> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlayerProfileData;
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
