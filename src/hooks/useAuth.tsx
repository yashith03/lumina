// src/hooks/useAuth.ts
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { Profile } from '../types/models';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then(async ({ session }) => {
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        await loadProfile(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (u: User) => {
    try {
      const { data } = await authService.getProfile(u.id);

      if (data) {
        setProfile(data);
        return;
      }

      const fullName =
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        u.email ||
        'User';

      const avatarUrl =
        u.user_metadata?.avatar_url ||
        u.user_metadata?.picture ||
        null;

      const { data: newProfile } = await authService.upsertProfile(u.id, {
        full_name: fullName,
        avatar_url: avatarUrl,
      });

      if (newProfile) setProfile(newProfile);
    } catch (e) {
      console.error('Load profile error:', e);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await authService.signInWithGoogle();
    return { error };
  };

  const signOut = async () => {
    await authService.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
