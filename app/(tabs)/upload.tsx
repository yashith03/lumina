import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryChips } from '../../src/components/CategoryChips';
import { SegmentedTabs } from '../../src/components/SegmentedTabs';
import { useAuth } from '../../src/hooks/useAuth';
import { useUpload } from '../../src/hooks/useUpload';

export default function UploadScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { upload, isLoading } = useUpload();

  const [activeTab, setActiveTab] = useState<'personal' | 'public'>('personal');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fiction');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to upload books.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(auth)/welcome'),
        },
      ]);
    }
  }, [user, router]);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/epub+zip'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        setShowForm(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file. Please try again.');
      console.error('File pick error:', error);
    }
  };

  const handleUpload = async () => {
    if (!title.trim() || !author.trim() || !selectedFile) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      await upload({
        title: title.trim(),
        author: author.trim(),
        description: description.trim() || undefined,
        category,
        visibility: activeTab === 'personal' ? 'private' : 'public',
        fileUri: selectedFile.uri,
      });

      Alert.alert('Success', 'Book uploaded successfully!', [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'Please try again.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setDescription('');
    setCategory('Fiction');
    setSelectedFile(null);
    setShowForm(false);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons
            name="cloud-upload-outline"
            size={60}
            color="#9CA3AF"
            style={{ marginBottom: 16 }}
          />
          <Text className="text-gray-900 dark:text-white text-xl font-bold text-center mb-2">
            Sign In Required
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
            You need to sign in to upload books.
          </Text>
          <TouchableOpacity
            className="bg-sky-500 px-6 py-3 rounded-lg"
            onPress={() => router.replace('/(auth)/welcome')}
          >
            <Text className="text-white font-semibold text-center">Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-gray-900 dark:text-white text-2xl font-bold mb-4">
            Upload Book
          </Text>
        </View>

        {/* Tab Selector */}
        <View className="px-4 mb-6">
          <SegmentedTabs
            tabs={[
              { id: 'personal', label: 'Personal Library' },
              { id: 'public', label: 'Public Gallery' },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as 'personal' | 'public')}
          />
        </View>

        {/* Upload Button */}
        <View className="px-4 mb-6">
          <TouchableOpacity
            className="bg-sky-500 rounded-lg py-4 flex-row items-center justify-center"
            onPress={pickFile}
            disabled={isLoading}
          >
            <Ionicons
              name="cloud-upload"
              size={24}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text className="text-white font-semibold text-base">
              {selectedFile ? 'Change File' : 'Select Book File'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selected File Info */}
        {selectedFile && (
          <View className="px-4 mb-6 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
            <View className="flex-row items-center mb-2">
              <Ionicons name="document" size={20} color="#0ea5e9" />
              <Text className="ml-2 text-gray-900 dark:text-white font-semibold flex-1">
                {selectedFile.name}
              </Text>
            </View>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </Text>
          </View>
        )}

        {/* Form */}
        {showForm && selectedFile && (
          <View className="px-4 pb-6">
            {/* Title */}
            <View className="mb-4">
              <Text className="text-gray-900 dark:text-white font-semibold mb-2">
                Book Title *
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3"
                placeholder="Enter book title"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
                editable={!isLoading}
              />
            </View>

            {/* Author */}
            <View className="mb-4">
              <Text className="text-gray-900 dark:text-white font-semibold mb-2">
                Author *
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3"
                placeholder="Enter author name"
                placeholderTextColor="#9CA3AF"
                value={author}
                onChangeText={setAuthor}
                editable={!isLoading}
              />
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-gray-900 dark:text-white font-semibold mb-2">
                Description
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3 min-h-24"
                placeholder="Enter book description (optional)"
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                editable={!isLoading}
                textAlignVertical="top"
              />
            </View>

            {/* Category */}
            <View className="mb-6">
              <Text className="text-gray-900 dark:text-white font-semibold mb-2">
                Category
              </Text>
              <CategoryChips
                selected={category}
                onSelect={setCategory}
              />
            </View>

            {/* Visibility Info */}
            <View className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <View className="flex-row items-start">
                <Ionicons
                  name={activeTab === 'personal' ? 'lock-closed' : 'globe'}
                  size={20}
                  color="#0ea5e9"
                  style={{ marginTop: 2, marginRight: 8 }}
                />
                <View className="flex-1">
                  <Text className="text-gray-900 dark:text-white font-semibold mb-1">
                    {activeTab === 'personal' ? 'Private' : 'Public'}
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm">
                    {activeTab === 'personal'
                      ? 'Only you can access this book'
                      : 'Anyone can find and read this book'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Upload Button */}
            <TouchableOpacity
              className={`rounded-lg py-4 flex-row items-center justify-center ${
                isLoading ? 'bg-gray-400' : 'bg-green-500'
              }`}
              onPress={handleUpload}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white font-semibold">Uploading...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark" size={24} color="white" />
                  <Text className="text-white font-semibold ml-2">Upload Book</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              className="rounded-lg py-3 mt-3 border border-gray-300 dark:border-gray-600"
              onPress={resetForm}
              disabled={isLoading}
            >
              <Text className="text-gray-900 dark:text-white font-semibold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
