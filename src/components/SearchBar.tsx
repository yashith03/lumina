import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search books...' }: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-3 mb-4">
      <Ionicons name="search" size={20} color="#9CA3AF" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="flex-1 ml-2 text-gray-900 dark:text-white text-base"
      />
      {value.length > 0 && (
        <Ionicons
          name="close-circle"
          size={20}
          color="#9CA3AF"
          onPress={() => onChangeText('')}
        />
      )}
    </View>
  );
}
