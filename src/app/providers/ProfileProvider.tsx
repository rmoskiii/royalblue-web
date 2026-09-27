import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router';
import { setActiveProfileId } from '@/api/client';
import { useProfiles } from '@/api/hooks';
import type { Profile, ProfileType } from '@/api/types';
import { storage } from '@/lib/storage';

export const PROFILE_STORAGE_KEY = 'rb.profile';

interface ProfileContextValue {
  profiles: Profile[];
  /** Active profile; personal until profiles load */
  profile: Profile | undefined;
  profileType: ProfileType;
  switchProfile: (id: string) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

/**
 * One-tap switching between Personal and Business profiles (PRD FR-04).
 * Mounted inside the signed-in shell. Switching refetches all data for the
 * new profile and returns to Home.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { data: profiles = [] } = useProfiles();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(() => {
    // Set the header before the first queries fire, so they load the right profile's data.
    const saved = storage.get(PROFILE_STORAGE_KEY);
    setActiveProfileId(saved);
    return saved;
  });

  const profile =
    profiles.find((p) => p.id === activeId) ?? profiles.find((p) => p.type === 'personal');

  // Keep the API client's profile header in step with the active profile.
  useEffect(() => {
    setActiveProfileId(profile?.id ?? null);
  }, [profile?.id]);

  const switchProfile = useCallback(
    (id: string) => {
      if (id === profile?.id) return;
      setActiveProfileId(id);
      storage.set(PROFILE_STORAGE_KEY, id);
      setActiveId(id);
      navigate('/');
      queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'profiles' });
    },
    [profile?.id, navigate, queryClient],
  );

  const value = useMemo(
    () => ({ profiles, profile, profileType: profile?.type ?? 'personal', switchProfile }),
    [profiles, profile, switchProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
