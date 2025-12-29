// app/(auth)/callback.tsx

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function CallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    // OAuth callback handling is done automatically by Supabase
    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="items-center justify-center flex-1 bg-white">
      <ActivityIndicator size="large" color="#0ea5e9" />
    </View>
  );
}
