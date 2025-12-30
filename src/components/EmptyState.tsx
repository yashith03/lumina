// src/components/EmptyState.tsx

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center flex-1 p-8">
      <View className="p-6 mb-4 bg-gray-100 rounded-full dark:bg-gray-800">
        <Ionicons name={icon} size={48} color="#9CA3AF" />
      </View>
      <Text className="mb-2 text-xl font-semibold text-center text-gray-900 dark:text-white">
        {title}
      </Text>
      <Text className="mb-8 text-center text-gray-600 dark:text-gray-400">
        {description}
      </Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.7}
          className="px-8 py-3 bg-primary-500 rounded-xl"
        >
          <Text className="font-semibold text-white">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
