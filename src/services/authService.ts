// src/services/authService.ts

import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabaseClient';

WebBrowser.maybeCompleteAuthSession();

const redirectUrl = makeRedirectUri({
  scheme: 'lumina',
  path: 'auth/callback',
});

export const authService = {
  /**
   * Sign in with Google OAuth (Expo-safe)
   */
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // IMPORTANT
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No OAuth URL returned');

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type !== 'success' || !result.url) {
        throw new Error('Authentication cancelled');
      }

      // ✅ Exchange the code for a session (CRITICAL FIX)
      const { data: exchangeData, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(result.url);

      if (exchangeError) throw exchangeError;

      return { data: exchangeData.session, error: null };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: error.message };
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session: data.session, error: null };
    } catch (error: any) {
      console.error('Get session error:', error);
      return { session: null, error: error.message };
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error: any) {
      console.error('Get user error:', error);
      return { user: null, error: error.message };
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Create or update user profile
   */
  async upsertProfile(
    userId: string,
    profileData: { full_name?: string; avatar_url?: string }
  ) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Upsert profile error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Get profile error:', error);
      return { data: null, error: error.message };
    }
  },
};
