# Lumina API Quick Reference

## Auth Service API

### `authService.signInWithGoogle()`
Signs in user with Google OAuth
```typescript
const { data, error } = await authService.signInWithGoogle();
// Returns: { data: { user, session }, error: null | string }
```

### `authService.signOut()`
Signs out current user
```typescript
const { error } = await authService.signOut();
```

### `authService.getSession()`
Get current session
```typescript
const { session, error } = await authService.getSession();
// session: { user, access_token, refresh_token }
```

### `authService.getCurrentUser()`
Get current authenticated user
```typescript
const { user, error } = await authService.getCurrentUser();
```

### `authService.onAuthStateChange(callback)`
Listen to auth changes
```typescript
const { data: { subscription } } = authService.onAuthStateChange(
  (event, session) => {
    console.log(event); // 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED'
  }
);
// Must unsubscribe: subscription.unsubscribe();
```

### `authService.upsertProfile(userId, data)`
Create or update user profile
```typescript
const { data, error } = await authService.upsertProfile(userId, {
  full_name: 'John Doe',
  avatar_url: 'https://...'
});
```

### `authService.getProfile(userId)`
Get user profile
```typescript
const { data: profile, error } = await authService.getProfile(userId);
```

---

## Books Service API

### `booksService.getBooks(params)`
Fetch books with filtering & pagination
```typescript
const { data, error } = await booksService.getBooks({
  userId: 'user-id',           // Optional
  category: 'Fiction',          // Optional
  search: 'harry',              // Optional - searches title/author
  visibility: 'public',         // Optional - 'private' | 'public'
  limit: 20,                    // Optional - items per page (default: 20)
  offset: 0,                    // Optional - pagination offset
});
// data: { data: Book[], count: number, hasMore: boolean }
```

### `booksService.getBookById(bookId, userId?)`
Get a single book by ID
```typescript
const { data: book, error } = await booksService.getBookById(
  'book-uuid',
  'user-id'  // For checking access permissions
);
```

### `booksService.getRecentBooks(userId, limit?)`
Get user's recently opened books
```typescript
const { data: books, error } = await booksService.getRecentBooks(
  'user-id',
  5  // Number of books to fetch
);
```

### `booksService.getRecommendedBooks(userId?, limit?)`
Get public books (excluding user's own)
```typescript
const { data: books, error } = await booksService.getRecommendedBooks(
  'user-id',  // Optional
  10
);
```

### `booksService.getCategories()`
Get all available categories
```typescript
const { data: categories, error } = await booksService.getCategories();
// Returns: ['Fiction', 'Science', 'History', ...]
```

### `booksService.deleteBook(bookId, userId)`
Delete a book (only owner can delete)
```typescript
const { error } = await booksService.deleteBook(
  'book-id',
  'user-id'
);
```

---

## Upload Service API

### `uploadService.pickDocument()`
Open document picker for PDF/EPUB
```typescript
const { uri, name, mimeType, error } = await uploadService.pickDocument();
```

### `uploadService.pickImage()`
Open image picker for cover
```typescript
const { uri, name, error } = await uploadService.pickImage();
```

### `uploadService.uploadFile(fileUri, bucket, fileName, userId)`
Upload file to Supabase Storage
```typescript
const { path, error } = await uploadService.uploadFile(
  'file://path/to/file',
  'ebooks',              // Bucket name
  'my-book.pdf',
  'user-id'
);
// path: 'user-id/1234567890_my-book.pdf'
```

### `uploadService.createBook(userId, bookData)`
Create book record in database
```typescript
const { data: book, error } = await uploadService.createBook(
  'user-id',
  {
    title: 'My Book',
    author: 'John Doe',
    description: 'About this book',
    category: 'Fiction',
    visibility: 'private',
    language: 'en-US',
    fileUri: 'file://path',
    coverUri: 'file://path'  // Optional
  }
);
```

---

## Progress Service API

### `progressService.getProgress(userId, bookId)`
Get reading position for a book
```typescript
const { data: progress, error } = await progressService.getProgress(
  'user-id',
  'book-id'
);
// progress: { position: { chapterIndex, paragraphIndex, charOffset } }
```

### `progressService.saveProgress(userId, bookId, position)`
Save or update reading position
```typescript
const { data, error } = await progressService.saveProgress(
  'user-id',
  'book-id',
  {
    chapterIndex: 5,       // Paragraph number
    paragraphIndex: 2,     // Sentence number
    charOffset: 150        // Character offset (future use)
  }
);
```

### `progressService.getAllProgress(userId)`
Get all reading progress for user
```typescript
const { data: allProgress, error } = await progressService.getAllProgress(
  'user-id'
);
// data: ReadingProgress[]
```

### `progressService.deleteProgress(userId, bookId)`
Delete reading progress
```typescript
const { error } = await progressService.deleteProgress(
  'user-id',
  'book-id'
);
```

---

## Text Extraction Service API

### `textExtractionService.extractText(filePath)`
Extract text from PDF/EPUB
```typescript
const { data, error } = await textExtractionService.extractText(
  'file://path/to/book.pdf'
);
// data: { text: string, isImageBased: boolean, pageCount?: number }
```

### `textExtractionService.getCachedText(fileUri)`
Get cached extracted text
```typescript
const cached = textExtractionService.getCachedText('file-uri');
```

### `textExtractionService.cacheText(fileUri, result)`
Cache extracted text locally
```typescript
textExtractionService.cacheText(
  'file-uri',
  { text: '...', isImageBased: false }
);
```

### `textExtractionService.detectImageOnlyPDF(fileUri)`
Detect if PDF is image-based (scanned)
```typescript
const isImageBased = await textExtractionService.detectImageOnlyPDF(
  'file-uri'
);
```

---

## TTS Service API

### `ttsService.getAvailableVoices()`
Get all available voices on device
```typescript
const voices = await ttsService.getAvailableVoices();
// voices: VoiceOption[]
// VoiceOption: { identifier, name, language, quality }
```

### `ttsService.getVoicesForLanguage(language)`
Get voices for specific language
```typescript
const voices = await ttsService.getVoicesForLanguage('en-US');
```

### `ttsService.speak(text, settings, onDone?, onError?)`
Speak text with TTS
```typescript
ttsService.speak(
  'Hello world',
  {
    language: 'en-US',
    voice: 'voice-id',  // Optional - uses system default if not set
    speed: 1.0,         // 0.5 - 2.0
    pitch: 1.0          // Typical range: 0.5 - 2.0
  },
  () => console.log('Done'),
  (error) => console.error('Error', error)
);
```

### `ttsService.stop()`
Stop speaking
```typescript
ttsService.stop();
```

### `ttsService.pause()`
Pause speaking
```typescript
ttsService.pause();
```

### `ttsService.resume()`
Resume speaking
```typescript
ttsService.resume();
```

### `ttsService.isSpeaking()`
Check if currently speaking
```typescript
const isSpeaking = await ttsService.isSpeaking();
```

---

## React Hooks

### `useAuth()`
Access authentication state and methods
```typescript
const {
  session,           // Current session
  user,             // Current user
  profile,          // User profile
  loading,          // Loading state
  signInWithGoogle, // Sign in function
  signOut,          // Sign out function
  refreshProfile    // Refresh profile function
} = useAuth();
```

### `useBooks(params)`
Fetch books with React Query
```typescript
const {
  data,              // { pages: [ { data, count, hasMore } ] }
  isLoading,
  error,
  refetch,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage
} = useBooks({
  category: 'Fiction',
  search: 'harry',
  visibility: 'public',
  limit: 20
});
```

### `useBook(bookId)`
Fetch single book
```typescript
const {
  data: book,
  isLoading,
  error,
  refetch
} = useBook('book-id');
```

### `useRecentBooks(limit?)`
Fetch user's recent books
```typescript
const {
  data: books,
  isLoading,
  error,
  refetch
} = useRecentBooks(10);
```

### `useRecommendedBooks(limit?)`
Fetch recommended public books
```typescript
const {
  data: books,
  isLoading,
  error,
  refetch
} = useRecommendedBooks(10);
```

### `useUpload()`
Handle book uploads
```typescript
const {
  upload,           // Mutation function
  isUploading,      // Loading state
  error,            // Error state
  progress,         // Upload progress (0-100)
  pickDocument,     // Open document picker
  pickImage         // Open image picker
} = useUpload();

// Usage:
await upload({
  title: 'My Book',
  author: 'Author',
  description: 'Description',
  category: 'Fiction',
  visibility: 'private',
  language: 'en-US',
  fileUri: 'file://...',
  coverUri: 'file://...'  // Optional
});
```

### `useReadingProgress(bookId)`
Manage reading progress
```typescript
const {
  progress,         // Current progress
  isLoading,
  saveProgress,     // Save function
  isSaving
} = useReadingProgress('book-id');

// Usage:
await saveProgress({
  chapterIndex: 5,
  paragraphIndex: 2,
  charOffset: 150
});
```

### `useTTS()`
Control text-to-speech
```typescript
const {
  settings,                // TTSSettings
  availableVoices,         // VoiceOption[]
  isPlaying,
  currentSentenceIndex,
  loadSettings,
  saveSettings,
  loadVoices,
  getVoicesForLanguage,
  speak,                   // (text, onDone?, onError?) => void
  stop,
  pause,
  resume,
  updateSettings,
  ttsEnabled
} = useTTS();
```

### `useColorScheme()`
Get device theme
```typescript
const colorScheme = useColorScheme();
// Returns: 'light' | 'dark' | null (if not determinable)
```

---

## Utility Functions

### `debounce(fn, wait)`
Debounce function calls
```typescript
const debouncedSearch = debounce((text) => {
  setSearchQuery(text);
}, 300);

// Call multiple times, only fires after 300ms without calls
```

### `throttle(fn, limit)`
Throttle function calls
```typescript
const throttledScroll = throttle(() => {
  // Handle scroll
}, 1000);
```

### `retryWithBackoff(fn, maxRetries?, delayMs?)`
Retry with exponential backoff
```typescript
const result = await retryWithBackoff(
  () => fetch('...'),
  3,     // Max retries
  1000   // Initial delay
);
```

### `formatBytes(bytes, decimals?)`
Format bytes to human readable
```typescript
formatBytes(1024 * 1024);  // '1 MB'
formatBytes(512);           // '512 Bytes'
```

### `truncateText(text, maxLength)`
Truncate text with ellipsis
```typescript
truncateText('Very long text', 10);  // 'Very long ...'
```

### `capitalizeFirstLetter(text)`
Capitalize first letter
```typescript
capitalizeFirstLetter('hello');  // 'Hello'
```

### `formatDate(date)`
Format date to readable string
```typescript
formatDate(new Date());  // 'December 29, 2025'
```

### `formatDuration(seconds)`
Format duration (seconds to mm:ss)
```typescript
formatDuration(125);  // '2:05'
```

### `formatRelativeTime(date)`
Format relative time
```typescript
formatRelativeTime(new Date());  // 'Just now'
formatRelativeTime(dateLastWeek);  // '5 days ago'
```

### Text Chunking
```typescript
import {
  splitIntoParagraphs,
  splitIntoSentences,
  splitParagraphIntoSentences,
  getSentenceAtPosition,
  cleanTextForTTS
} from '../utils/textChunking';

const paragraphs = splitIntoParagraphs(text);
const sentences = splitIntoSentences(text);
const clean = cleanTextForTTS(text);
```

### Validators
```typescript
import {
  isValidEmail,
  validateBookUpload,
  sanitizeFilename
} from '../utils/validators';

isValidEmail('user@example.com');  // true
validateBookUpload(data);          // { valid: bool, errors: [] }
sanitizeFilename('my book.pdf');   // 'my_book.pdf'
```

---

## Component Props

### `BookCard`
```typescript
interface BookCardProps {
  book: Book;
  onPress: () => void;
  variant?: 'grid' | 'horizontal';  // Default: 'grid'
}
```

### `SearchBar`
```typescript
interface SearchBarProps {
  value?: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}
```

### `CategoryChips`
```typescript
interface CategoryChipsProps {
  selected?: string | null;
  onSelect?: (category: string | null) => void;
  categories?: string[];  // Optional override
}
```

### `PlayerBar`
```typescript
interface PlayerBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  progress?: number;        // 0-100
  duration?: number;
  speed?: number;           // 0.75-2.0
  onSpeedChange?: (speed: number) => void;
}
```

### `VoicePickerModal`
```typescript
interface VoicePickerModalProps {
  visible: boolean;
  onClose: () => void;
  language?: string;        // Default: 'en-US'
}
```

### `SegmentedTabs`
```typescript
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
```

### `EmptyState`
```typescript
interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

### `LoadingSkeleton`
```typescript
interface LoadingSkeletonProps {
  count?: number;  // Number of skeleton items
  height?: string; // Height of each item
}
```

---

## Error Handling

All services return `{ data, error }` pattern:

```typescript
// Service call
const { data, error } = await someService.method();

// Check for errors
if (error) {
  console.error('Error:', error);
  Alert.alert('Error', error);
  return;
}

// Use data
console.log('Success:', data);
```

## Supabase Errors

Common Supabase error codes:
- `PGRST116` - No rows returned (not always an error)
- `42P01` - Undefined table
- `23505` - Unique constraint violation
- `P0001` - Raised exception
- Auth errors - Check Supabase logs

---

This API reference covers all major functions in Lumina. For more details, consult the source code or specific documentation files.
