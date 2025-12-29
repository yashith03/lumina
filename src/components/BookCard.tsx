// src/components/BookCard.tsx

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getPublicUrl } from '../services/storageService';
import { Book } from '../types/models';
import { formatRelativeTime } from '../utils/time';


interface BookCardProps {
  book: Book;
  onPress: () => void;
  variant?: 'grid' | 'horizontal';
}

export function BookCard({ book, onPress, variant = 'grid' }: BookCardProps) {
  const isHorizontal = variant === 'horizontal';
  const coverUrl = book.cover_path ? getPublicUrl('covers', book.cover_path) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${
        isHorizontal ? 'flex-row' : 'flex-col'
      } bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm mb-4`}
      style={isHorizontal ? styles.horizontalCard : styles.gridCard}
      activeOpacity={0.7}
    >
      {/* Cover Image */}
      <View
        className={`${
          isHorizontal ? 'w-24 h-32' : 'w-full h-48'
        } bg-gray-200 dark:bg-gray-700`}
      >
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#38bdf8', '#d946ef']}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text className="text-2xl font-bold text-white">
              {book.title.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        )}
      </View>

      {/* Book Info */}
      <View className={`${isHorizontal ? 'flex-1 p-3' : 'p-4'}`}>
        <Text
          className="mb-1 text-base font-semibold text-gray-900 dark:text-white"
          numberOfLines={2}
        >
          {book.title}
        </Text>
        
        <Text
          className="mb-2 text-sm text-gray-600 dark:text-gray-400"
          numberOfLines={1}
        >
          {book.author}
        </Text>

        {!isHorizontal && (
          <>
            <View className="flex-row items-center mb-2">
              <View className="px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900">
                <Text className="text-xs font-medium text-primary-700 dark:text-primary-300">
                  {book.category}
                </Text>
              </View>
              
              {book.visibility === 'public' && (
                <View className="px-2 py-1 ml-2 bg-green-100 rounded-full dark:bg-green-900">
                  <Text className="text-xs font-medium text-green-700 dark:text-green-300">
                    Public
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-xs text-gray-500 dark:text-gray-500">
              Added {formatRelativeTime(book.created_at)}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    width: '48%',
    marginRight: '2%',
  },
  horizontalCard: {
    width: 200,
    marginRight: 16,
  },
});
