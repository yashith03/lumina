// src/services/storageService.ts
import { supabase } from './supabaseClient';

export function getPublicUrl(bucket: 'ebooks' | 'covers', path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
