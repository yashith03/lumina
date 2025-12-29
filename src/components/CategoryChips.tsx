// src/components/CategoryChips.tsx

import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { booksService } from '../services/booksService';

interface CategoryChipsProps {
  selected?: string | null;
  onSelect?: (category: string | null) => void;
  categories?: string[];
}

export function CategoryChips({
  selected = null,
  onSelect,
  categories: providedCategories,
}: CategoryChipsProps) {
  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await booksService.getCategories();
      if (error) return [];
      return data || [];
    },
    enabled: !providedCategories,
  });

  const categories = providedCategories || fetchedCategories;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ paddingRight: 16 }}
    >
      <TouchableOpacity
        onPress={() => onSelect?.(null)}
        className={`px-4 py-2 rounded-full mr-2 ${
          selected === null ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <Text
          className={`font-medium ${
            selected === null
              ? 'text-white'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          All
        </Text>
      </TouchableOpacity>

      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          onPress={() => onSelect?.(category)}
          className={`px-4 py-2 rounded-full mr-2 ${
            selected === category ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <Text
            className={`font-medium ${
              selected === category
                ? 'text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
