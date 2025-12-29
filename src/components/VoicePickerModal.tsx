import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTTS } from '../hooks/useTTS';
import { VoiceOption } from '../types/models';

interface VoicePickerModalProps {
  visible: boolean;
  onClose: () => void;
  language?: string;
}

export function VoicePickerModal({
  visible,
  onClose,
  language = 'en-US',
}: VoicePickerModalProps) {
  const { settings, updateSettings, getVoicesForLanguage } = useTTS();
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadVoices();
    }
  }, [visible, language]);

  const loadVoices = async () => {
    setLoading(true);
    const availableVoices = await getVoicesForLanguage(language);
    setVoices(availableVoices);
    setLoading(false);
  };

  const selectVoice = (voiceId: string) => {
    updateSettings({ voice: voiceId });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl max-h-[70%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Select Voice
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Voice List */}
          {loading ? (
            <View className="p-8 items-center">
              <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
          ) : voices.length === 0 ? (
            <View className="p-8 items-center">
              <Text className="text-gray-600 dark:text-gray-400">
                No voices available for this language
              </Text>
            </View>
          ) : (
            <ScrollView className="p-4">
              {voices.map((voice) => (
                <TouchableOpacity
                  key={voice.identifier}
                  onPress={() => selectVoice(voice.identifier)}
                  className={`p-4 rounded-xl mb-2 ${
                    settings.voice === voice.identifier
                      ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-gray-900 dark:text-white font-semibold mb-1">
                        {voice.name}
                      </Text>
                      <Text className="text-gray-600 dark:text-gray-400 text-sm">
                        {voice.language} • {voice.quality}
                      </Text>
                    </View>
                    {settings.voice === voice.identifier && (
                      <Ionicons name="checkmark-circle" size={24} color="#0ea5e9" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
