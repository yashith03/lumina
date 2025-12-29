// src/hooks/useUpload.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { uploadService } from '../services/uploadService';
import { BookUploadData } from '../types/models';
import { validateBookUpload } from '../utils/validators';
import { useAuth } from './useAuth';

export function useUpload() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: async (bookData: BookUploadData) => {
      if (!user) throw new Error('User not authenticated');

      // Validate data
      const validation = validateBookUpload(bookData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Upload book
      setProgress(0);
      const { data, error } = await uploadService.createBook(user.id, bookData);
      
      if (error) throw new Error(error);
      setProgress(100);
      
      return data;
    },
    onSuccess: () => {
      // Invalidate books queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setProgress(0);
    },
    onError: () => {
      setProgress(0);
    },
  });

  const pickDocument = async () => {
    return await uploadService.pickDocument();
  };

  const pickImage = async () => {
    return await uploadService.pickImage();
  };

  return {
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error,
    progress,
    pickDocument,
    pickImage,
  };
}
