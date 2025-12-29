import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookCard } from '../../src/components/BookCard';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingSkeleton } from '../../src/components/LoadingSkeleton';
import { useAuth } from '../../src/hooks/useAuth';
import { useRecentBooks, useRecommendedBooks } from '../../src/hooks/useBooks';

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const {
    data: recentBooks,
    isLoading: recentLoading,
    refetch: refetchRecent,
  } = useRecentBooks(5);
  
  const {
    data: recommendedBooks,
    isLoading: recommendedLoading,
    refetch: refetchRecommended,
  } = useRecommendedBooks(10);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchRecent(), refetchRecommended()]);
    setRefreshing(false);
  };

  const handleBookPress = (bookId: string) => {
    router.push(`/reading/${bookId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="p-6 pb-4">
          <Text className="text-gray-600 dark:text-gray-400 text-sm mb-1">
            Welcome back,
          </Text>
          <Text className="text-gray-900 dark:text-white text-2xl font-bold">
            {profile?.full_name || user?.email || 'Guest'}
          </Text>
        </View>

        {/* Recent Books */}
        {user && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between px-6 mb-4">
              <Text className="text-gray-900 dark:text-white text-xl font-bold">
                Continue Reading
              </Text>
              {recentBooks && recentBooks.length > 0 && (
                <TouchableOpacity onPress={() => router.push('/(tabs)/library')}>
                  <Text className="text-primary-500 font-semibold">See All</Text>
                </TouchableOpacity>
              )}
            </View>

            {recentLoading ? (
              <View className="px-6">
                <LoadingSkeleton />
              </View>
            ) : recentBooks && recentBooks.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24 }}
              >
                {recentBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onPress={() => handleBookPress(book.id)}
                    variant="horizontal"
                  />
                ))}
              </ScrollView>
            ) : (
              <View className="px-6">
                <EmptyState
                  icon="book-outline"
                  title="No recent books"
                  description="Start reading to see your books here"
                />
              </View>
            )}
          </View>
        )}

        {/* Recommended Books */}
        <View className="mb-6">
          <View className="px-6 mb-4">
            <Text className="text-gray-900 dark:text-white text-xl font-bold">
              {user ? 'Recommended for You' : 'Explore Books'}
            </Text>
          </View>

          {recommendedLoading ? (
            <View className="px-6">
              <LoadingSkeleton />
            </View>
          ) : recommendedBooks && recommendedBooks.length > 0 ? (
            <View className="px-6 flex-row flex-wrap">
              {recommendedBooks.slice(0, 6).map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onPress={() => handleBookPress(book.id)}
                  variant="grid"
                />
              ))}
            </View>
          ) : (
            <View className="px-6">
              <EmptyState
                icon="library-outline"
                title="No books available"
                description="Check back later for new books"
              />
            </View>
          )}
        </View>

        {/* CTA for guests */}
        {!user && (
          <View className="mx-6 mb-6 bg-primary-50 dark:bg-primary-900 rounded-2xl p-6">
            <Ionicons name="star" size={32} color="#0ea5e9" />
            <Text className="text-gray-900 dark:text-white text-lg font-bold mt-3 mb-2">
              Sign in for more features
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 mb-4">
              Upload your own books, sync progress, and get personalized recommendations
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/welcome')}
              className="bg-primary-500 rounded-full py-3 px-6"
            >
              <Text className="text-white font-semibold text-center">
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
