// app/(auth)/welcome.tsx

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/hooks/useAuth';

export default function WelcomeScreen() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      alert('Sign in failed: ' + error);
      setLoading(false);
    }
    // ✅ Let auth state listener + index.tsx handle navigation
  };

  const handleContinueAsGuest = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-primary-50 to-white">
      <View className="justify-between flex-1 p-6">
        {/* Logo and Title */}
        <View className="items-center justify-center flex-1">
          <View className="p-8 mb-6 rounded-full bg-primary-500">
            <Ionicons name="book" size={64} color="white" />
          </View>
          
          <Text className="mb-2 text-4xl font-bold text-gray-900">
            Lumina
          </Text>
          
          <Text className="mb-8 text-lg text-center text-gray-600">
            Your personal ebook reader with{'\n'}text-to-speech
          </Text>

          {/* Features */}
          <View className="w-full max-w-sm">
            {[
              { icon: 'headset', text: 'Listen to your books' },
              { icon: 'cloud-upload', text: 'Upload PDFs & EPUBs' },
              { icon: 'sync', text: 'Sync across devices' },
            ].map((feature, index) => (
              <View key={index} className="flex-row items-center mb-4">
                <View className="p-3 mr-4 rounded-full bg-primary-100">
                  <Ionicons name={feature.icon as any} size={24} color="#0ea5e9" />
                </View>
                <Text className="text-base text-gray-700">{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Auth Buttons */}
        <View className="w-full">
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={loading}
            className="flex-row items-center justify-center px-6 py-4 mb-3 bg-white border-2 border-gray-300 rounded-full shadow-sm"
          >
            {loading ? (
              <ActivityIndicator color="#0ea5e9" />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#EA4335" />
                <Text className="ml-3 text-base font-semibold text-gray-900">
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContinueAsGuest}
            className="py-4"
          >
            <Text className="font-medium text-center text-gray-600">
              Continue as Guest
            </Text>
          </TouchableOpacity>

          <Text className="mt-4 text-xs text-center text-gray-500">
            By continuing, you agree to our Terms of Service{'\n'}and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
