import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
        <Ionicons name={icon} size={48} color="#9CA3AF" />
      </View>
      <Text className="text-gray-900 dark:text-white text-xl font-semibold mb-2 text-center">
        {title}
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 text-center">
        {description}
      </Text>
    </View>
  );
}
