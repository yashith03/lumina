// src/components/SegmentedTabs.tsx

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Tab {
  id: string | number;
  label: string;
}

interface SegmentedTabsProps {
  tabs: Tab[] | string[];
  activeTab?: string | number;
  selectedIndex?: number;
  onChange?: (tabId: string | number) => void;
  onSelectTab?: (index: number) => void;
}

export function SegmentedTabs({
  tabs,
  activeTab,
  selectedIndex = 0,
  onChange,
  onSelectTab,
}: SegmentedTabsProps) {
  const isObjectArray = tabs.length > 0 && typeof tabs[0] === 'object';
  const actualTabs: Tab[] = isObjectArray
    ? (tabs as Tab[])
    : (tabs as string[]).map((t) => ({ id: t, label: t }));

  const handlePress = (index: number, id: string | number) => {
    if (onSelectTab) onSelectTab(index);
    if (onChange) onChange(activeTab !== undefined ? id : index);
  };

  const isActive = (index: number, id: string | number) => {
    if (activeTab !== undefined) return activeTab === id;
    return selectedIndex === index;
  };

  return (
    <View className="flex-row p-1 mb-4 bg-gray-200 rounded-full dark:bg-gray-800">
      {actualTabs.map((tab, index) => (
        <TouchableOpacity
          key={`${tab.id}`}
          onPress={() => handlePress(index, tab.id)}
          className={`flex-1 py-2 rounded-full ${
            isActive(index, tab.id)
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-center font-medium ${
              isActive(index, tab.id)
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
