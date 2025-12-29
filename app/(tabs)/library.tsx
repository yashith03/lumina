import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookCard } from '../../src/components/BookCard';
import { CategoryChips } from '../../src/components/CategoryChips';
import { EmptyState } from '../../src/components/EmptyState';
import { SearchBar } from '../../src/components/SearchBar';
import { useAuth } from '../../src/hooks/useAuth';
import { useBooks } from '../../src/hooks/useBooks';
import { debounce } from '../../src/utils/helpers';

const ITEMS_PER_PAGE = 20;

export default function LibraryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: booksPages,
    isLoading,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useBooks({
    search: searchQuery,
    category: selectedCategory || undefined,
    visibility: user ? undefined : 'public',
    limit: ITEMS_PER_PAGE,
  });

  const allBooks = booksPages?.pages?.flatMap((page) => page.data || []) || [];

  const handleSearch = useCallback(
    debounce((text: string) => {
      setSearchQuery(text);
    }, 300),
    []
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleBookPress = (bookId: string) => {
    router.push(`/reading/${bookId}`);
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderFooter = () => {
    if (!isFetchingNextPage || allBooks.length === 0) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Text className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Library
          </Text>
          <SearchBar
            placeholder="Search books..."
            onChangeText={handleSearch}
          />
        </View>

        {/* Category Filter */}
        <View className="px-4 py-3">
          <CategoryChips
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </View>

        {/* Books List */}
        {isLoading && allBooks.length === 0 ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator size="large" color="#0ea5e9" />
          </View>
        ) : allBooks.length === 0 ? (
          <EmptyState
            icon="book-outline"
            title="No books found"
            description="Try adjusting your search or filters"
            actionLabel="Browse public books"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory(null);
              handleRefresh();
            }}
          />
        ) : (
          <FlatList
            data={allBooks}
            renderItem={({ item }) => (
              <View className="px-4 mb-4">
                <BookCard
                  book={item}
                  onPress={() => handleBookPress(item.id)}
                />
              </View>
            )}
            keyExtractor={(item) => item.id}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
              />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
