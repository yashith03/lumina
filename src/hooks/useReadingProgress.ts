// src/hooks/useReadingProgress.ts


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { progressService } from '../services/progressService';
import { useAuth } from './useAuth';

export function useReadingProgress(bookId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const progressQuery = useQuery({
    queryKey: ['progress', bookId, user?.id],
    queryFn: async () => {
      if (!user || !bookId) return null;
      const { data, error } = await progressService.getProgress(user.id, bookId);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!user && !!bookId,
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (position: {
      chapterIndex: number;
      paragraphIndex: number;
      charOffset: number;
    }) => {
      if (!user || !bookId) throw new Error('User or book not available');
      const { data, error } = await progressService.saveProgress(user.id, bookId, position);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', bookId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['recentBooks'] });
    },
  });

  return {
    progress: progressQuery.data,
    isLoading: progressQuery.isLoading,
    saveProgress: saveProgressMutation.mutate,
    isSaving: saveProgressMutation.isPending,
  };
}
