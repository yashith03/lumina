//src/components/LoadingSkeleton.tsx

import React from 'react';
import { View } from 'react-native';

export function LoadingSkeleton() {
  return (
    <View className="p-4">
      {[1, 2, 3].map((item) => (
        <View key={item} className="mb-4 overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-xl">
          <View className="h-48 bg-gray-300 dark:bg-gray-700" />
          <View className="p-4">
            <View className="w-3/4 h-4 mb-2 bg-gray-300 rounded dark:bg-gray-700" />
            <View className="w-1/2 h-3 bg-gray-300 rounded dark:bg-gray-700" />
          </View>
        </View>
      ))}
    </View>
  );
}
