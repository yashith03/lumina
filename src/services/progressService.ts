// src/services/progressService.ts

import { supabase } from './supabaseClient';

export const progressService = {
  /**
   * Get reading progress for a book
   */
  async getProgress(userId: string, bookId: string) {
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw error;
      }

      return { data: data || null, error: null };
    } catch (error: any) {
      console.error('Get progress error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Save reading progress
   */
  async saveProgress(
    userId: string,
    bookId: string,
    position: { chapterIndex: number; paragraphIndex: number; charOffset: number }
  ) {
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: userId,
          book_id: bookId,
          position,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Save progress error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get all reading progress for a user
   */
  async getAllProgress(userId: string) {
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Get all progress error:', error);
      return { data: [], error: error.message };
    }
  },

  /**
   * Delete reading progress
   */
  async deleteProgress(userId: string, bookId: string) {
    try {
      const { error } = await supabase
        .from('reading_progress')
        .delete()
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Delete progress error:', error);
      return { error: error.message };
    }
  },
};
