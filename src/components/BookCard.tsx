import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Book } from '../types/models';
import { formatRelativeTime } from '../utils/time';

interface BookCardProps {
  book: Book;
  onPress: () => void;
  variant?: 'grid' | 'horizontal';
}

export function BookCard({ book, onPress, variant = 'grid' }: BookCardProps) {
  const isHorizontal = variant === 'horizontal';

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
        {book.cover_path ? (
          <Image
            source={{ uri: book.cover_path }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-gradient-to-br from-primary-400 to-accent-500">
            <Text className="text-white text-2xl font-bold">
              {book.title.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Book Info */}
      <View className={`${isHorizontal ? 'flex-1 p-3' : 'p-4'}`}>
        <Text
          className="text-gray-900 dark:text-white font-semibold text-base mb-1"
          numberOfLines={2}
        >
          {book.title}
        </Text>
        
        <Text
          className="text-gray-600 dark:text-gray-400 text-sm mb-2"
          numberOfLines={1}
        >
          {book.author}
        </Text>

        {!isHorizontal && (
          <>
            <View className="flex-row items-center mb-2">
              <View className="bg-primary-100 dark:bg-primary-900 px-2 py-1 rounded-full">
                <Text className="text-primary-700 dark:text-primary-300 text-xs font-medium">
                  {book.category}
                </Text>
              </View>
              
              {book.visibility === 'public' && (
                <View className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full ml-2">
                  <Text className="text-green-700 dark:text-green-300 text-xs font-medium">
                    Public
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-gray-500 dark:text-gray-500 text-xs">
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
