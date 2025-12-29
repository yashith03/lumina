import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/hooks/useAuth';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  // Redirect to auth or tabs based on authentication status
  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
