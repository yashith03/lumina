// src/services/booksService.ts

import { Book, PaginatedResponse } from '../types/models';
import { supabase } from './supabaseClient';

export const booksService = {
  /**
   * Fetch books with pagination and filters
   */
  async getBooks(params: {
    userId?: string;
    category?: string;
    search?: string;
    visibility?: 'private' | 'public';
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('books')
        .select('*, owner:profiles!owner_id(*)', { count: 'exact' });

      // Filter by visibility
      if (params.visibility === 'public') {
        query = query.eq('visibility', 'public');
      } else if (params.userId) {
        // Show user's private books + all public books
        query = query.or(`owner_id.eq.${params.userId},visibility.eq.public`);
      } else {
        // Guest: only public books
        query = query.eq('visibility', 'public');
      }

      // Filter by category
      if (params.category) {
        query = query.eq('category', params.category);
      }

      // Search (escape special characters)
      if (params.search) {
        const searchTerm = params.search.replace(/[%_]/g, '\\$&');
        query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`);
      }

      // Pagination
      const limit = params.limit || 20;
      const offset = params.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Order by created_at desc
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      const response: PaginatedResponse<Book> = {
        data: data || [],
        count: count || 0,
        hasMore: (count || 0) > offset + limit,
      };

      return { data: response, error: null };
    } catch (error: any) {
      console.error('Get books error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get a single book by ID
   */
  async getBookById(bookId: string, userId?: string) {
    try {
      let query = supabase
        .from('books')
        .select('*, owner:profiles!owner_id(*)')
        .eq('id', bookId)
        .single();

      const { data, error } = await query;

      if (error) throw error;

      // Check access permissions
      if (data.visibility === 'private' && data.owner_id !== userId) {
        throw new Error('Access denied: This book is private');
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Get book error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get user's recent books (based on reading progress)
   */
  async getRecentBooks(userId: string, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('book_id, books!inner(*, owner:profiles!owner_id(*))')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Extract books from the nested structure
      const books = data?.map((item: any) => item.books) || [];

      return { data: books, error: null };
    } catch (error: any) {
      console.error('Get recent books error:', error);
      return { data: [], error: error.message };
    }
  },

  /**
   * Get recommended books (public books, excluding user's own)
   */
  async getRecommendedBooks(userId?: string, limit = 10) {
    try {
      let query = supabase
        .from('books')
        .select('*, owner:profiles!owner_id(*)')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.neq('owner_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Get recommended books error:', error);
      return { data: [], error: error.message };
    }
  },

  /**
   * Get categories (distinct from books)
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('category')
        .eq('visibility', 'public');

      if (error) throw error;

      // Get unique categories
      const categories = [...new Set(data?.map((item) => item.category))].filter(Boolean);

      return { data: categories, error: null };
    } catch (error: any) {
      console.error('Get categories error:', error);
      return { data: [], error: error.message };
    }
  },

  /**
   * Delete a book (owner only)
   */
  async deleteBook(bookId: string, userId: string) {
    try {
      // First verify ownership
      const { data: book, error: fetchError } = await supabase
        .from('books')
        .select('owner_id, file_path, cover_path')
        .eq('id', bookId)
        .single();

      if (fetchError) throw fetchError;

      if (book.owner_id !== userId) {
        throw new Error('Access denied: You can only delete your own books');
      }

      // Delete files from storage
      if (book.file_path) {
        await supabase.storage.from('ebooks').remove([book.file_path]);
      }
      if (book.cover_path) {
        await supabase.storage.from('covers').remove([book.cover_path]);
      }

      // Delete book record
      const { error: deleteError } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (deleteError) throw deleteError;

      return { error: null };
    } catch (error: any) {
      console.error('Delete book error:', error);
      return { error: error.message };
    }
  },
};
