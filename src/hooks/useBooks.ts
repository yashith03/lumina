// src/hooks/useBooks.ts

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { booksService } from '../services/booksService';
import { useAuth } from './useAuth';

/**
 * Hook to fetch books with pagination and filters
 */
export function useBooks(params: {
  category?: string;
  search?: string;
  visibility?: 'private' | 'public';
  limit?: number;
}) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['books', params, user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await booksService.getBooks({
        ...params,
        userId: user?.id,
        offset: pageParam,
      });

      if (error) throw new Error(error);
      return data;
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage) return undefined;
      return lastPage.hasMore ? pages.length * (params.limit || 20) : undefined;
    },
    initialPageParam: 0,
  });
}

/**
 * Hook to fetch a single book
 */
export function useBook(bookId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) return null;
      const { data, error } = await booksService.getBookById(bookId, user?.id);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!bookId,
  });
}

/**
 * Hook to fetch recent books
 */
export function useRecentBooks(limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recentBooks', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await booksService.getRecentBooks(user.id, limit);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!user,
  });
}

/**
 * Hook to fetch recommended books
 */
export function useRecommendedBooks(limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recommendedBooks', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await booksService.getRecommendedBooks(user?.id, limit);
      if (error) throw new Error(error);
      return data;
    },
  });
}

/**
 * Hook to fetch categories
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await booksService.getCategories();
      if (error) throw new Error(error);
      return data;
    },
  });
}

/**
 * Hook to delete a book
 */
export function useDeleteBook() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (bookId: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await booksService.deleteBook(bookId, user.id);
      if (error) throw new Error(error);
    },
    onSuccess: () => {
      // Invalidate all book queries
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['recentBooks'] });
    },
  });
}
