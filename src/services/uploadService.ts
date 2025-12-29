// src/services/uploadService.ts

import { decode } from 'base64-arraybuffer';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { BookUploadData } from '../types/models';
import { sanitizeFilename } from '../utils/validators';
import { supabase } from './supabaseClient';

export const uploadService = {
  /**
   * Pick a document (PDF/EPUB)
   */
  async pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/epub+zip'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return { uri: null, error: null };
      }

      const file = result.assets[0];
      return { uri: file.uri, name: file.name, mimeType: file.mimeType, error: null };
    } catch (error: any) {
      console.error('Pick document error:', error);
      return { uri: null, error: error.message };
    }
  },

  /**
   * Pick an image for book cover
   */
  async pickImage() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return { uri: null, error: null };
      }

      const file = result.assets[0];
      return { uri: file.uri, name: file.name, error: null };
    } catch (error: any) {
      console.error('Pick image error:', error);
      return { uri: null, error: error.message };
    }
  },

  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(
    fileUri: string,
    bucket: 'ebooks' | 'covers',
    fileName: string,
    userId: string,
    contentType: string
  ) {
    try {
      // Read file as base64
      const fileData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Generate unique file path with sanitized filename
      const timestamp = Date.now();
      const safeName = sanitizeFilename(fileName);
      const filePath = `${userId}/${timestamp}_${safeName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, decode(fileData), {
          contentType,
          upsert: false,
        });

      if (error) throw error;

      return { path: data.path, error: null };
    } catch (error: any) {
      console.error('Upload file error:', error);
      return { path: null, error: error.message };
    }
  },

  /**
   * Create book record in database
   */
  async createBook(userId: string, bookData: BookUploadData) {
    try {
      // Detect file type
      const isEpub = bookData.fileUri.toLowerCase().endsWith('.epub');
      const ebookFileName = `${bookData.title}.${isEpub ? 'epub' : 'pdf'}`;
      const ebookContentType = isEpub ? 'application/epub+zip' : 'application/pdf';

      // Upload ebook file
      const { path: filePath, error: fileError } = await this.uploadFile(
        bookData.fileUri,
        'ebooks',
        ebookFileName,
        userId,
        ebookContentType
      );

      if (fileError || !filePath) {
        throw new Error(fileError || 'Failed to upload ebook file');
      }

      // Upload cover image if provided
      let coverPath = null;
      if (bookData.coverUri) {
        const { path, error: coverError } = await this.uploadFile(
          bookData.coverUri,
          'covers',
          `${bookData.title}_cover.jpg`,
          userId,
          'image/jpeg'
        );

        if (!coverError && path) {
          coverPath = path;
        }
      }

      // Create book record
      const { data, error } = await supabase
        .from('books')
        .insert({
          owner_id: userId,
          title: bookData.title.trim(),
          author: bookData.author.trim(),
          description: bookData.description?.trim() || null,
          category: bookData.category.trim(),
          visibility: bookData.visibility,
          file_path: filePath,
          cover_path: coverPath,
          language: bookData.language || 'en-US',
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Create book error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: 'ebooks' | 'covers', path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Download file for offline access
   */
  async downloadFile(bucket: 'ebooks' | 'covers', path: string, localFileName: string) {
    try {
      const publicUrl = this.getPublicUrl(bucket, path);
      const localUri = `${FileSystem.documentDirectory}${localFileName}`;

      const downloadResult = await FileSystem.downloadAsync(publicUrl, localUri);

      return { uri: downloadResult.uri, error: null };
    } catch (error: any) {
      console.error('Download file error:', error);
      return { uri: null, error: error.message };
    }
  },
};
