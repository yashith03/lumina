//app/reading/[bookId].tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlayerBar } from '../../src/components/PlayerBar';
import { VoicePickerModal } from '../../src/components/VoicePickerModal';
import { useAuth } from '../../src/hooks/useAuth';
import { useReadingProgress } from '../../src/hooks/useReadingProgress';
import { useTTS } from '../../src/hooks/useTTS';
import { booksService } from '../../src/services/booksService';
import { textExtractionService } from '../../src/services/textExtractionService';
import {
  splitIntoParagraphs,
  splitParagraphIntoSentences,
} from '../../src/utils/textChunking';

interface ReadingState {
  currentParagraphIndex: number;
  currentSentenceIndex: number;
  currentOffset: number;
}

export default function ReadingScreen() {
  const router = useRouter();
  const { bookId } = useLocalSearchParams();
  const { user } = useAuth();

  const [book, setBook] = useState<any>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [sentences, setSentences] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [readingState, setReadingState] = useState<ReadingState>({
    currentParagraphIndex: 0,
    currentSentenceIndex: 0,
    currentOffset: 0,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const {
    ttsEnabled,
    currentVoice,
    speed,
    language,
    speak,
    stop,
    pause,
    resume,
  } = useTTS();

  const { progress, saveProgress } = useReadingProgress(bookId as string);

  // Load book and extracted text
  useEffect(() => {
    const loadBook = async () => {
      if (!bookId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch book metadata
        const { data: bookData, error: bookError } = await booksService.getBookById(
          bookId as string,
          user?.id
        );

        if (bookError) throw new Error(bookError);
        if (!bookData) throw new Error('Book not found');

        setBook(bookData);

        // Extract text from PDF/EPUB
        const { data: text, error: extractError } =
          await textExtractionService.extractText(bookData.file_path);

        if (extractError) {
          console.warn('Text extraction error:', extractError);
          setError(
            'Unable to extract text from this book. This might be a scanned PDF.'
          );
          setExtractedText('');
        } else if (text) {
          setExtractedText(text);

          // Parse into paragraphs and sentences
          const parsedParagraphs = splitIntoParagraphs(text).map(
            (p) => p.content
          );
          setParagraphs(parsedParagraphs);

          const parsedSentences = parsedParagraphs.map((para) =>
            splitParagraphIntoSentences(para)
          );
          setSentences(parsedSentences);

          // Restore reading position
          if (progress) {
            setReadingState({
              currentParagraphIndex: progress.position.chapterIndex || 0,
              currentSentenceIndex: progress.position.paragraphIndex || 0,
              currentOffset: progress.position.charOffset || 0,
            });
          }
        }
      } catch (err: any) {
        console.error('Load book error:', err);
        setError(err.message || 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [bookId, user?.id, progress]);

  // Auto-scroll to current reading position
  useEffect(() => {
    if (scrollViewRef.current && readingState.currentParagraphIndex >= 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: readingState.currentParagraphIndex * 150, // Approximate line height
          animated: true,
        });
      }, 100);
    }
  }, [readingState.currentParagraphIndex]);

  // Speak current sentence
  const speakCurrentSentence = useCallback(async () => {
    if (
      !extractedText ||
      sentences.length === 0 ||
      !ttsEnabled ||
      !currentVoice
    ) {
      Alert.alert('TTS Unavailable', 'Text-to-speech is not configured.');
      return;
    }

    const para = sentences[readingState.currentParagraphIndex];
    if (!para || readingState.currentSentenceIndex >= para.length) {
      // End of book
      handleEnd();
      return;
    }

    const sentence = para[readingState.currentSentenceIndex];
    setIsPlaying(true);

    speak(sentence, {
      onDone: () => {
        // Move to next sentence
        setReadingState((prev) => {
          const nextSentenceIndex = prev.currentSentenceIndex + 1;
          const currentSentences =
            sentences[prev.currentParagraphIndex] || [];

          if (nextSentenceIndex < currentSentences.length) {
            return {
              ...prev,
              currentSentenceIndex: nextSentenceIndex,
            };
          } else if (prev.currentParagraphIndex < sentences.length - 1) {
            return {
              currentParagraphIndex: prev.currentParagraphIndex + 1,
              currentSentenceIndex: 0,
              currentOffset: prev.currentOffset,
            };
          } else {
            handleEnd();
            return prev;
          }
        });
      },
      onError: (err) => {
        console.error('TTS error:', err);
        setIsPlaying(false);
      },
    });
  }, [extractedText, sentences, readingState, speak, ttsEnabled, currentVoice]);

  // Handle play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
      setIsPlaying(false);
    } else {
      speakCurrentSentence();
    }
  };

  // Handle skip
  const handleSkipBack = () => {
    setReadingState((prev) => {
      if (prev.currentSentenceIndex > 0) {
        return {
          ...prev,
          currentSentenceIndex: prev.currentSentenceIndex - 1,
        };
      } else if (prev.currentParagraphIndex > 0) {
        const prevSentences =
          sentences[prev.currentParagraphIndex - 1] || [];
        return {
          currentParagraphIndex: prev.currentParagraphIndex - 1,
          currentSentenceIndex: Math.max(0, prevSentences.length - 1),
          currentOffset: prev.currentOffset,
        };
      }
      return prev;
    });
  };

  const handleSkipForward = () => {
    setReadingState((prev) => {
      const currentSentences = sentences[prev.currentParagraphIndex] || [];
      if (prev.currentSentenceIndex < currentSentences.length - 1) {
        return {
          ...prev,
          currentSentenceIndex: prev.currentSentenceIndex + 1,
        };
      } else if (prev.currentParagraphIndex < sentences.length - 1) {
        return {
          currentParagraphIndex: prev.currentParagraphIndex + 1,
          currentSentenceIndex: 0,
          currentOffset: prev.currentOffset,
        };
      }
      return prev;
    });
  };

  // Handle end of book
  const handleEnd = () => {
    setIsPlaying(false);
    stop();
    Alert.alert('Finished', 'You have reached the end of the book.');
  };

  // Save progress periodically and on unmount
  useEffect(() => {
    const interval = setInterval(() => {
      if (bookId && user?.id) {
        saveProgress({
          position: {
            chapterIndex: readingState.currentParagraphIndex,
            paragraphIndex: readingState.currentSentenceIndex,
            charOffset: readingState.currentOffset,
          },
        });
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [readingState, bookId, user?.id, saveProgress]);

  if (loading) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="items-center justify-center flex-1 px-4">
          <Ionicons
            name="alert-circle"
            size={60}
            color="#EF4444"
            style={{ marginBottom: 16 }}
          />
          <Text className="mb-2 text-lg font-bold text-center text-gray-900 dark:text-white">
            Unable to Load Book
          </Text>
          <Text className="mb-6 text-center text-gray-600 dark:text-gray-400">
            {error || 'Book not found'}
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-lg bg-sky-500"
            onPress={() => router.back()}
          >
            <Text className="font-semibold text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#0ea5e9" />
        </TouchableOpacity>
        <Text className="flex-1 ml-3 font-bold text-center text-gray-900 dark:text-white">
          {book.title}
        </Text>
        <TouchableOpacity
          onPress={() => setShowVoiceModal(true)}
          className="p-2"
        >
          <Ionicons name="volume-high" size={24} color="#0ea5e9" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {extractedText && sentences.length > 0 ? (
        <>
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-6 py-6"
            showsVerticalScrollIndicator={true}
          >
            {paragraphs.map((paragraph, paraIndex) => (
              <View key={paraIndex} className="mb-6">
                {sentences[paraIndex]?.map((sentence, sentIndex) => (
                  <Text
                    key={`${paraIndex}-${sentIndex}`}
                    className={`text-base leading-7 mb-2 ${
                      paraIndex === readingState.currentParagraphIndex &&
                      sentIndex === readingState.currentSentenceIndex
                        ? 'bg-yellow-200 dark:bg-yellow-700 font-semibold text-gray-900 dark:text-white'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {sentence}{' '}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>

          {/* Player Bar */}
          {ttsEnabled && (
            <PlayerBar
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onSkipBack={handleSkipBack}
              onSkipForward={handleSkipForward}
              progress={
                (readingState.currentParagraphIndex /
                  Math.max(1, paragraphs.length)) *
                100
              }
              speed={speed}
            />
          )}
        </>
      ) : (
        <View className="items-center justify-center flex-1 px-6">
          <Ionicons
            name="document-text-outline"
            size={60}
            color="#9CA3AF"
            style={{ marginBottom: 16 }}
          />
          <Text className="mb-2 text-lg font-bold text-center text-gray-900 dark:text-white">
            Scanned PDF Detected
          </Text>
          <Text className="mb-6 text-center text-gray-600 dark:text-gray-400">
            This book appears to be a scanned document (image-based PDF). Text extraction failed.
            OCR support is coming soon.
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-lg bg-sky-500"
            onPress={() => router.back()}
          >
            <Text className="font-semibold text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Voice Picker Modal */}
      <VoicePickerModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />
    </SafeAreaView>
  );
}
