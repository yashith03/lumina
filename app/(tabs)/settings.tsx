import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/hooks/useAuth';

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  label: string;
  value?: string;
  icon?: string;
  action?: () => void;
  type?: 'text' | 'toggle' | 'select';
  toggled?: boolean;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const [settings, setSettings] = useState({
    language: 'en-US',
    speed: '1.0',
    highlightStyle: 'background' as 'underline' | 'background' | 'bold',
    theme: 'system' as 'light' | 'dark' | 'system',
    autoSave: true,
    offline: true,
  });

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/welcome');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Reading Experience',
      items: [
        {
          label: 'Language',
          value: settings.language,
          icon: 'globe',
          type: 'select',
        },
        {
          label: 'TTS Speed',
          value: `${settings.speed}x`,
          icon: 'speedometer',
          type: 'select',
        },
        {
          label: 'Highlight Style',
          value: settings.highlightStyle,
          icon: 'highlighter',
          type: 'select',
        },
      ],
    },
    {
      title: 'Display & Theme',
      items: [
        {
          label: 'Theme',
          value: settings.theme,
          icon: 'moon',
          type: 'select',
        },
        {
          label: 'Auto-save Progress',
          icon: 'checkmark-circle',
          type: 'toggle',
          toggled: settings.autoSave,
          onToggle: (value) =>
            setSettings((prev) => ({ ...prev, autoSave: value })),
        },
      ],
    },
    {
      title: 'Storage & Data',
      items: [
        {
          label: 'Offline Reading',
          icon: 'download',
          type: 'toggle',
          toggled: settings.offline,
          onToggle: (value) =>
            setSettings((prev) => ({ ...prev, offline: value })),
        },
        {
          label: 'Clear Cache',
          icon: 'trash',
          action: () => {
            Alert.alert('Clear Cache', 'This will remove cached books from device.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Clear',
                onPress: () =>
                  Alert.alert('Success', 'Cache cleared successfully.'),
                style: 'destructive',
              },
            ]);
          },
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Sign Out',
          icon: 'log-out',
          action: handleLogout,
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-gray-900 dark:text-white text-2xl font-bold mb-6">
            Settings
          </Text>
        </View>

        {/* Profile Card */}
        {user && profile && (
          <View className="mx-4 mb-6 p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-full bg-sky-500 flex items-center justify-center mr-4">
                <Ionicons name="person" size={32} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 dark:text-white text-lg font-bold">
                  {profile.full_name || 'User'}
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 text-sm">
                  {user.email}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-6">
            <Text className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase px-4 mb-3 ml-1">
              {section.title}
            </Text>

            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                className={`flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800 ${
                  item.action ? '' : 'opacity-75'
                }`}
                onPress={item.action}
                disabled={!item.action && item.type !== 'toggle'}
              >
                {item.icon && (
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color="#0ea5e9"
                    style={{ marginRight: 12 }}
                  />
                )}

                <View className="flex-1">
                  <Text className="text-gray-900 dark:text-white font-semibold">
                    {item.label}
                  </Text>
                  {item.value && item.type !== 'toggle' && (
                    <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {item.value}
                    </Text>
                  )}
                </View>

                {item.type === 'toggle' && item.onToggle && (
                  <Switch
                    value={item.toggled || false}
                    onValueChange={item.onToggle}
                    trackColor={{
                      false: '#E5E7EB',
                      true: '#0ea5e9',
                    }}
                    thumbColor="#ffffff"
                  />
                )}

                {item.action && item.type !== 'toggle' && (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#D1D5DB"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* App Info */}
        <View className="px-4 py-8 border-t border-gray-100 dark:border-gray-800">
          <Text className="text-gray-600 dark:text-gray-400 text-center text-sm">
            Lumina v1.0.0
          </Text>
          <Text className="text-gray-500 dark:text-gray-500 text-center text-xs mt-2">
            © 2025 All Rights Reserved
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
