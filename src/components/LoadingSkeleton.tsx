import React from 'react';
import { View } from 'react-native';

export function LoadingSkeleton() {
  return (
    <View className="p-4">
      {[1, 2, 3].map((item) => (
        <View key={item} className="mb-4 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden">
          <View className="h-48 bg-gray-300 dark:bg-gray-700" />
          <View className="p-4">
            <View className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4" />
            <View className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
          </View>
        </View>
      ))}
    </View>
  );
}
