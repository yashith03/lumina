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
    } else {
      // Navigation will be handled by the auth state change
      router.replace('/(tabs)/home');
    }
  };

  const handleContinueAsGuest = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-primary-50 to-white">
      <View className="flex-1 justify-between p-6">
        {/* Logo and Title */}
        <View className="flex-1 justify-center items-center">
          <View className="bg-primary-500 rounded-full p-8 mb-6">
            <Ionicons name="book" size={64} color="white" />
          </View>
          
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            Lumina
          </Text>
          
          <Text className="text-lg text-gray-600 text-center mb-8">
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
                <View className="bg-primary-100 rounded-full p-3 mr-4">
                  <Ionicons name={feature.icon as any} size={24} color="#0ea5e9" />
                </View>
                <Text className="text-gray-700 text-base">{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Auth Buttons */}
        <View className="w-full">
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={loading}
            className="bg-white border-2 border-gray-300 rounded-full py-4 px-6 mb-3 flex-row items-center justify-center shadow-sm"
          >
            {loading ? (
              <ActivityIndicator color="#0ea5e9" />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#EA4335" />
                <Text className="text-gray-900 font-semibold text-base ml-3">
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContinueAsGuest}
            className="py-4"
          >
            <Text className="text-gray-600 text-center font-medium">
              Continue as Guest
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-500 text-xs text-center mt-4">
            By continuing, you agree to our Terms of Service{'\n'}and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
