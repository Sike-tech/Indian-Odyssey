import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { PlayerProfile } from '../core/player';
import { clearProfile, loadProfile, saveProfile } from '../core/storage';

interface ProfileContextValue {
  profile: PlayerProfile;
  loading: boolean;
  save: () => Promise<void>;
  reset: () => Promise<void>;
  refresh: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile>(() => new PlayerProfile());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadProfile().then((data) => {
      if (!mounted) return;
      setProfile(PlayerProfile.fromJSON(data));
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const save = useCallback(async () => {
    await saveProfile(profile.toJSON());
  }, [profile]);

  const reset = useCallback(async () => {
    profile.reset();
    await clearProfile();
    setProfile(new PlayerProfile(profile.toJSON()));
  }, [profile]);

  const refresh = useCallback(() => {
    setProfile(new PlayerProfile(profile.toJSON()));
  }, [profile]);

  return (
    <ProfileContext.Provider value={{ profile, loading, save, reset, refresh }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}
