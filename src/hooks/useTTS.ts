// src/hooks/useTTS.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { ttsService } from '../services/ttsService';
import { TTSSettings, VoiceOption } from '../types/models';
import { cleanTextForTTS } from '../utils/textChunking';

const DEFAULT_SETTINGS: TTSSettings = {
  language: 'en-US',
  voice: null,
  speed: 1.0,
  pitch: 1.0,
};

export function useTTS() {
  const [settings, setSettings] = useState<TTSSettings>(DEFAULT_SETTINGS);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  // Load settings from storage
  useEffect(() => {
    loadSettings();
    loadVoices();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('tts_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Load TTS settings error:', error);
    }
  };

  const saveSettings = async (newSettings: TTSSettings) => {
    try {
      await AsyncStorage.setItem('tts_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Save TTS settings error:', error);
    }
  };

  const loadVoices = async () => {
    const voices = await ttsService.getAvailableVoices();
    setAvailableVoices(voices);
  };

  const getVoicesForLanguage = async (language: string) => {
    return await ttsService.getVoicesForLanguage(language);
  };

  const speak = useCallback(
    (text: string, onDone?: () => void, onError?: (error: any) => void) => {
      const cleanText = cleanTextForTTS(text);
      setIsPlaying(true);

      ttsService.speak(
        cleanText,
        settings,
        () => {
          setIsPlaying(false);
          if (onDone) onDone();
        },
        (error) => {
          setIsPlaying(false);
          if (onError) onError(error);
        }
      );
    },
    [settings]
  );

  const stop = useCallback(() => {
    ttsService.stop();
    setIsPlaying(false);
    setCurrentSentenceIndex(0);
  }, []);

  const pause = useCallback(() => {
    ttsService.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    ttsService.resume();
    setIsPlaying(true);
  }, []);

  const updateSettings = useCallback(
    (updates: Partial<TTSSettings>) => {
      const newSettings = { ...settings, ...updates };
      saveSettings(newSettings);
    },
    [settings]
  );

  return {
    settings,
    updateSettings,
    availableVoices,
    getVoicesForLanguage,
    speak,
    stop,
    pause,
    resume,
    ttsEnabled: isPlaying,
    isPlaying,
    currentVoice: settings.voice,
    speed: settings.speed,
    language: settings.language,
    currentSentenceIndex,
    setCurrentSentenceIndex,
  };
}
