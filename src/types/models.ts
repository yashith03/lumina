// src/types/models.ts

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Book {
  id: string;
  owner_id: string;
  title: string;
  author: string;
  description: string | null;
  category: string;
  visibility: 'private' | 'public';
  file_path: string;
  cover_path: string | null;
  language: string | null;
  created_at: string;
  owner?: Profile;
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  position: {
    chapterIndex: number;
    paragraphIndex: number;
    charOffset: number;
  };
  updated_at: string;
}

export interface ExtractedTextCache {
  id: string;
  book_id: string;
  text_version: number;
  content: string;
}

export interface VoiceOption {
  identifier: string;
  name: string;
  language: string;
  quality: string;
}

export interface TTSSettings {
  language: string;
  voice: string | null;
  speed: number;
  pitch: number;
}

export interface AppSettings {
  tts: TTSSettings;
  highlightStyle: 'underline' | 'background' | 'bold';
  theme: 'light' | 'dark' | 'system';
}

export interface TextChunk {
  type: 'paragraph' | 'sentence';
  content: string;
  index: number;
  startOffset: number;
  endOffset: number;
}

export interface BookUploadData {
  title: string;
  author: string;
  description?: string;
  category: string;
  visibility: 'private' | 'public';
  language?: string;
  fileUri: string;
  coverUri?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}
