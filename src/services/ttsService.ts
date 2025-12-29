// src/services/ttsService.ts

import * as Speech from 'expo-speech';
import { TTSSettings, VoiceOption } from '../types/models';

export const ttsService = {
  /**
   * Get available voices
   */
  async getAvailableVoices(): Promise<VoiceOption[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.map((voice) => ({
        identifier: voice.identifier,
        name: voice.name,
        language: voice.language,
        quality: voice.quality,
      }));
    } catch (error) {
      console.error('Get voices error:', error);
      return [];
    }
  },

  /**
   * Get voices for a specific language
   */
  async getVoicesForLanguage(language: string): Promise<VoiceOption[]> {
    const allVoices = await this.getAvailableVoices();
    return allVoices.filter((voice) => voice.language.startsWith(language));
  },

  /**
   * Speak text with settings
   */
  speak(text: string, settings: TTSSettings, onDone?: () => void, onError?: (error: any) => void) {
    try {
      Speech.speak(text, {
        language: settings.language,
        voice: settings.voice || undefined,
        pitch: settings.pitch,
        rate: settings.speed,
        onDone,
        onError,
      });
    } catch (error) {
      console.error('Speak error:', error);
      if (onError) onError(error);
    }
  },

  /**
   * Stop speaking
   */
  stop() {
    Speech.stop();
  },

  /**
   * Pause speaking
   */
  pause() {
    Speech.pause();
  },

  /**
   * Resume speaking
   */
  resume() {
    Speech.resume();
  },

  /**
   * Check if speaking
   */
  async isSpeaking(): Promise<boolean> {
    return await Speech.isSpeakingAsync();
  },
};
