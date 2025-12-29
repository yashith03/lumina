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
    // Get initial session
    authService.getSession().then(({ session }) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data } = await authService.getProfile(userId);
      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile } = await authService.upsertProfile(userId, {
          full_name: user?.user_metadata?.full_name || user?.email || 'User',
          avatar_url: user?.user_metadata?.avatar_url || null,
        });
        if (newProfile) {
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setLoading(false);
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
    if (user) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
