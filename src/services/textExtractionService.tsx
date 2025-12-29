import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export interface TextExtractionResult {
  text: string;
  isImageBased: boolean;
  pageCount?: number;
}

const CACHE_PREFIX = 'text_cache_';

export const textExtractionService = {
  /**
   * Extract text from PDF (placeholder implementation)
   */
  async extractFromPDF(fileUri: string): Promise<TextExtractionResult> {
    try {
      const cached = await this.getCachedText(fileUri);
      if (cached) {
        return cached;
      }

      const isImageBased = await this.detectImageOnlyPDF(fileUri);

      if (isImageBased) {
        return {
          text: '',
          isImageBased: true,
          pageCount: 0,
        };
      }

      // Placeholder text
      const extractedText = 'Sample extracted text from PDF...';

      const result: TextExtractionResult = {
        text: extractedText,
        isImageBased: false,
      };

      await this.cacheText(fileUri, result);
      return result;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw error;
    }
  },

  /**
   * Extract text from EPUB (placeholder implementation)
   */
  async extractFromEPUB(fileUri: string): Promise<TextExtractionResult> {
    try {
      const cached = await this.getCachedText(fileUri);
      if (cached) {
        return cached;
      }

      const extractedText = 'Sample extracted text from EPUB...';

      const result: TextExtractionResult = {
        text: extractedText,
        isImageBased: false,
      };

      await this.cacheText(fileUri, result);
      return result;
    } catch (error) {
      console.error('EPUB extraction error:', error);
      throw error;
    }
  },

  /**
   * Detect image-only PDFs (simple heuristic)
   */
  async detectImageOnlyPDF(fileUri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (fileInfo.exists && fileInfo.size && fileInfo.size > 50 * 1024 * 1024) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Image detection error:', error);
      return false;
    }
  },

  /**
   * Cache extracted text
   */
  async cacheText(fileUri: string, result: TextExtractionResult) {
    try {
      const key = `${CACHE_PREFIX}${fileUri}`;
      await AsyncStorage.setItem(key, JSON.stringify(result));
    } catch (error) {
      console.error('Cache text error:', error);
    }
  },

  /**
   * Get cached text
   */
  async getCachedText(fileUri: string): Promise<TextExtractionResult | null> {
    try {
      const key = `${CACHE_PREFIX}${fileUri}`;
      const cached = await AsyncStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Get cached text error:', error);
      return null;
    }
  },

  /**
   * Clear cache for a file
   */
  async clearCache(fileUri: string) {
    try {
      const key = `${CACHE_PREFIX}${fileUri}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  },

  /**
   * Clear all cache
   */
  async clearAllCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const textKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(textKeys);
    } catch (error) {
      console.error('Clear all cache error:', error);
    }
  },

  /**
   * Main wrapper used by the app
   */
  async extractText(
    fileUri: string
  ): Promise<{ data: string | null; error: string | null }> {
    try {
      const lowerUri = fileUri.toLowerCase();
      let result: TextExtractionResult;

      if (lowerUri.endsWith('.pdf')) {
        result = await this.extractFromPDF(fileUri);
      } else if (lowerUri.endsWith('.epub')) {
        result = await this.extractFromEPUB(fileUri);
      } else {
        throw new Error('Unsupported file format');
      }

      if (result.isImageBased) {
        console.warn('Scanned PDF detected. No text available.');
        return { data: '', error: null };
      }

      return { data: result.text, error: null };
    } catch (error: any) {
      console.error('Text extraction error:', error);
      return { data: null, error: error.message };
    }
  },
};
