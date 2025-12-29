# Lumina Architecture & Developer Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App (Expo)                   │
├─────────────────────────────────────────────────────────────┤
│
│  ┌─── App Navigation (expo-router) ─────────────────────┐
│  │  ├─ (auth) Stack → Welcome, Callback               │
│  │  └─ (tabs) Tabs → Home, Library, Upload, Settings  │
│  │     └─ reading/[bookId] → Reading Screen          │
│  └──────────────────────────────────────────────────────┘
│
│  ┌─── UI Layer (React Components + NativeWind) ────────┐
│  │  ├─ Pages (10 screens)                              │
│  │  ├─ Components (8 reusable)                         │
│  │  └─ Modals (Voice Picker)                           │
│  └──────────────────────────────────────────────────────┘
│
│  ┌─── State Management ──────────────────────────────────┐
│  │  ├─ React Context (Auth)                             │
│  │  ├─ TanStack Query (Server State)                    │
│  │  ├─ AsyncStorage (User Preferences)                  │
│  │  └─ MMKV (High-Performance Cache)                    │
│  └──────────────────────────────────────────────────────┘
│
│  ┌─── Custom Hooks (Business Logic) ────────────────────┐
│  │  ├─ useAuth() → Auth state & sign-in                │
│  │  ├─ useBooks() → Book queries with pagination       │
│  │  ├─ useUpload() → File upload mutations             │
│  │  ├─ useTTS() → Text-to-speech control               │
│  │  └─ useReadingProgress() → Progress tracking        │
│  └──────────────────────────────────────────────────────┘
│
│  ┌─── Services Layer (External Integration) ─────────────┐
│  │  ├─ authService → Google OAuth & session            │
│  │  ├─ booksService → CRUD operations                  │
│  │  ├─ uploadService → Storage file operations         │
│  │  ├─ progressService → Progress tracking DB          │
│  │  ├─ textExtractionService → PDF/EPUB parsing        │
│  │  └─ ttsService → expo-speech integration            │
│  └──────────────────────────────────────────────────────┘
│
│  ┌─── Utilities & Helpers ──────────────────────────────┐
│  │  ├─ validators → Form & data validation             │
│  │  ├─ textChunking → Text parsing (para/sentence)     │
│  │  ├─ helpers → Debounce, format, retry               │
│  │  ├─ ocrDetection → Image-based PDF heuristic        │
│  │  └─ time → Date/time formatting                     │
│  └──────────────────────────────────────────────────────┘
│
└─────────────────────────────────────────────────────────────┘
                            ↓ API Calls
┌─────────────────────────────────────────────────────────────┐
│                        Supabase                              │
├─────────────────────────────────────────────────────────────┤
│
│  ┌─ PostgreSQL Database ──────────────────────────────┐
│  │  ├─ profiles (user info)                           │
│  │  ├─ books (metadata)                               │
│  │  ├─ reading_progress (position tracking)           │
│  │  └─ extracted_text_cache (performance)             │
│  └──────────────────────────────────────────────────────┘
│
│  ┌─ Authentication (Google OAuth) ────────────────────┐
│  │  ├─ Sign in with Google                            │
│  │  ├─ Session management                             │
│  │  └─ Auto token refresh                             │
│  └──────────────────────────────────────────────────────┘
│
│  ┌─ Storage Buckets ─────────────────────────────────┐
│  │  ├─ ebooks/ (private PDF/EPUB files)              │
│  │  └─ covers/ (public cover images)                  │
│  └──────────────────────────────────────────────────────┘
│
│  ┌─ Row-Level Security (RLS) ───────────────────────┐
│  │  ├─ User-specific data isolation                  │
│  │  ├─ Public/private book visibility                │
│  │  └─ Database-level enforcement                    │
│  └──────────────────────────────────────────────────────┘
│
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Authentication Flow
```
User taps "Sign in with Google"
    ↓
authService.signInWithGoogle()
    ↓
Supabase OAuth → Google → Browser → Callback
    ↓
useAuth context updates (user, session, profile)
    ↓
Router navigates to /(tabs)/home
    ↓
Profile auto-created via database trigger
```

### Book Upload Flow
```
User selects file in Upload screen
    ↓
uploadService.uploadFile() → Supabase Storage
    ↓
uploadService.createBook() → Insert in books table
    ↓
useUpload hook invalidates query cache
    ↓
Home/Library screens refresh with new book
```

### Reading Experience Flow
```
User opens book from library
    ↓
textExtractionService.extractText() from PDF/EPUB
    ↓
Text split into paragraphs & sentences
    ↓
Current reading position restored from DB
    ↓
Page renders with sentence highlighting
    ↓
User presses play → TTS speaks current sentence
    ↓
On completion, move to next sentence
    ↓
Every 30s: progressService.saveProgress() updates DB
    ↓
Auto-scroll keeps highlighted sentence in view
```

### Search & Filter Flow
```
User types in search box (debounced 300ms)
    ↓
useBooks hook re-queries with search parameter
    ↓
booksService.getBooks() filters in Supabase
    ↓
Results filtered by:
  - Title/author search (ilike)
  - Category (eq)
  - Visibility (private/public based on user)
    ↓
Infinite scroll pagination loads more on scroll
    ↓
User can select different category chips
    ↓
Results update in real-time
```

---

## Data Models

### User Profile
```typescript
interface Profile {
  id: string;                    // UUID from auth.users
  full_name: string | null;      // From Google OAuth
  avatar_url: string | null;     // Profile picture
  created_at: string;            // ISO timestamp
}
```

### Book Metadata
```typescript
interface Book {
  id: string;                    // UUID primary key
  owner_id: string;              // FK to profiles
  title: string;                 // Book title
  author: string;                // Author name
  description: string | null;    // Optional description
  category: string;              // Fiction, Science, etc.
  visibility: 'private' | 'public'; // Access control
  file_path: string;             // Storage path to PDF/EPUB
  cover_path: string | null;     // Cover image path
  language: string | null;       // 'en-US', 'si-LK', etc.
  created_at: string;            // Upload timestamp
  updated_at: string;            // Last modified
}
```

### Reading Progress
```typescript
interface ReadingProgress {
  id: string;                    // UUID
  user_id: string;               // Who's reading
  book_id: string;               // Which book
  position: {
    chapterIndex: number;        // Paragraph number
    paragraphIndex: number;      // Sentence in paragraph
    charOffset: number;          // Character offset (future use)
  };
  updated_at: string;            // Last updated
}
```

### TTS Settings
```typescript
interface TTSSettings {
  language: string;              // 'en-US', 'es-ES', etc.
  voice: string | null;          // Voice identifier
  speed: number;                 // 0.75 - 2.0
  pitch: number;                 // Voice pitch (1.0 default)
}
```

---

## Key Patterns & Best Practices

### 1. Service Layer Pattern
Each service encapsulates logic for a specific domain:
```typescript
// src/services/authService.ts
export const authService = {
  async signInWithGoogle() { /* ... */ },
  async signOut() { /* ... */ },
  async getSession() { /* ... */ },
  // ...
};
```

**Benefits:**
- Separation of concerns
- Easy to test
- Reusable across components
- Centralized error handling

### 2. Custom Hooks for Business Logic
Hooks wrap services with React Query/State:
```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
}
```

**Benefits:**
- Encapsulates side effects
- Handles loading/error states
- Automatic caching with React Query
- Simple component integration

### 3. Context for Global State
Auth state shared via React Context:
```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  // Set up auth state...
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Benefits:**
- Avoids prop drilling
- Single source of truth
- Easy to test with mocked providers

### 4. Query Caching Strategy
TanStack Query handles server state:
```typescript
const query = useQuery({
  queryKey: ['books', params],  // Cache key
  queryFn: async () => { /* fetch books */ },
  staleTime: 5 * 60 * 1000,     // 5 min before refetch
  retry: 2,                       // Retry failed requests
});
```

**Benefits:**
- Automatic caching
- Background refetch
- Optimistic updates
- Automatic cleanup

### 5. Error Boundaries
Components gracefully handle errors:
```typescript
try {
  const { data, error } = await service.method();
  if (error) throw error;
  // Use data...
} catch (error) {
  console.error('Error:', error);
  Alert.alert('Error', error.message);
}
```

**Benefits:**
- User-friendly error messages
- App doesn't crash
- Proper error tracking

### 6. Type Safety with TypeScript
All data structures defined as interfaces:
```typescript
interface Book {
  id: string;
  title: string;
  // ...
}

async function getBook(id: string): Promise<Book> {
  // ...
}
```

**Benefits:**
- Catches errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Refactoring safety

---

## Common Development Tasks

### Adding a New Screen

1. **Create screen file:**
```typescript
// app/(tabs)/newfeature.tsx
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewFeatureScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Screen content */}
    </SafeAreaView>
  );
}
```

2. **Add to tab navigation:**
```typescript
// app/(tabs)/_layout.tsx
<Tabs.Screen
  name="newfeature"
  options={{
    title: 'New Feature',
    tabBarIcon: ({ color }) => (
      <Ionicons name="star" color={color} />
    ),
  }}
/>
```

3. **Add hook if needed:**
```typescript
// src/hooks/useNewFeature.ts
export function useNewFeature() {
  return useQuery({
    queryKey: ['newfeature'],
    queryFn: async () => {
      // Fetch data
    },
  });
}
```

### Adding a New Service

1. **Create service file:**
```typescript
// src/services/myService.ts
export const myService = {
  async fetchData() {
    const { data, error } = await supabase
      .from('table')
      .select('*');
    
    if (error) throw error;
    return data;
  },
};
```

2. **Create corresponding hook:**
```typescript
// src/hooks/useMyData.ts
export function useMyData() {
  return useQuery({
    queryKey: ['mydata'],
    queryFn: () => myService.fetchData(),
  });
}
```

3. **Use in component:**
```typescript
const { data, isLoading, error } = useMyData();
```

### Querying the Database

```typescript
// Simple fetch
const { data, error } = await supabase
  .from('books')
  .select('*')
  .eq('visibility', 'public');

// With filtering
const { data } = await supabase
  .from('books')
  .select('*')
  .ilike('title', `%${query}%`)
  .eq('category', 'Fiction')
  .order('created_at', { ascending: false })
  .limit(20);

// With relationships
const { data } = await supabase
  .from('books')
  .select('*, owner:profiles(full_name, avatar_url)')
  .eq('id', bookId);
```

### Handling Loading & Error States

```typescript
export function MyComponent() {
  const { data, isLoading, error } = useMyData();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        icon="alert-circle"
        title="Error"
        description={error.message}
        actionLabel="Try Again"
        onAction={() => refetch()}
      />
    );
  }

  return <View>{/* Render data */}</View>;
}
```

---

## Performance Optimization

### 1. Debounce Search Input
```typescript
const handleSearch = debounce((text) => {
  setSearchQuery(text);  // Only fires every 300ms
}, 300);
```

### 2. Lazy Load Images
```typescript
<Image
  source={{ uri: book.cover_path }}
  className="w-full h-48"
  resizeMode="cover"
/>
```

### 3. Memoize Expensive Computations
```typescript
const memoizedValue = useMemo(() => {
  return expensiveOperation(data);
}, [data]);
```

### 4. Pagination
```typescript
const { fetchNextPage, hasNextPage } = useBooks({
  limit: 20,  // Load 20 at a time
});

onEndReached={() => {
  if (hasNextPage) fetchNextPage();
}}
```

### 5. Query Caching
```typescript
useQuery({
  queryKey: ['books'],
  staleTime: 5 * 60 * 1000,  // Cache for 5 min
});
```

---

## Debugging

### Enable Debug Logging
```typescript
// In services, add console logs:
console.log('Fetching books...', params);
console.log('Books received:', data);

// Or use React DevTools
```

### Check Supabase Queries
1. Go to Supabase Dashboard
2. Click "Logs" to see all queries
3. Check for errors and performance issues

### Test Database RLS
```typescript
// Try fetching as different users
const user1 = await supabase.auth.getUser();
const { data: user1Books } = await supabase
  .from('books')
  .select('*');  // Should only see their books

// Switch user and test again
```

### Use Expo DevTools
```bash
npm start
# Then press 'j' to open debugger
# Use browser DevTools to inspect state/props
```

---

## Testing Strategy

### Unit Tests (Services)
```typescript
// src/services/__tests__/authService.test.ts
describe('authService', () => {
  it('should sign in with Google', async () => {
    const result = await authService.signInWithGoogle();
    expect(result.error).toBeNull();
  });
});
```

### Component Tests
```typescript
// src/components/__tests__/BookCard.test.tsx
import { render } from '@testing-library/react-native';

describe('BookCard', () => {
  it('should display book title', () => {
    const { getByText } = render(
      <BookCard book={mockBook} onPress={jest.fn()} />
    );
    expect(getByText(mockBook.title)).toBeTruthy();
  });
});
```

### Integration Tests
```typescript
// Test full flows with Supabase
describe('Upload Flow', () => {
  it('should upload and display book', async () => {
    // Upload book
    // Verify in database
    // Check library screen updates
  });
});
```

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Supabase project created & secured
- [ ] RLS policies enabled and tested
- [ ] Storage buckets created
- [ ] Google OAuth configured
- [ ] App icons/splash screen set
- [ ] Version number bumped
- [ ] All screens tested on device
- [ ] Error handling verified
- [ ] Performance tested with real data
- [ ] Accessibility checked (screen readers)
- [ ] Build succeeds without warnings
- [ ] Privacy policy created
- [ ] Terms of service drafted

---

## Future Enhancement Ideas

### Phase 2 Features
- Bookmarks & highlighting
- Reading statistics (pages/minutes)
- Social sharing
- User library backup

### Phase 3 Features
- Notes and annotations
- Book reviews & ratings
- Community features
- Recommendation algorithm

### Phase 4 Features
- OCR with ML Kit
- Audiobook integration
- Cloud sync across devices
- Offline full-library access

---

## Troubleshooting Guide

| Problem | Cause | Solution |
|---------|-------|----------|
| "Cannot find module" | Missing import | Check path and run npm install |
| Supabase connection fails | Wrong credentials | Verify .env.local has correct URL/key |
| RLS blocking queries | Policy misconfigured | Review RLS policies in Supabase |
| TTS not working | No voices installed | Check device locale settings |
| Infinite scroll freezes | Memory leak | Check for missed cleanup in useEffect |
| Dark mode broken | Tailwind not generating | Run npx tailwind... or restart |

---

This architecture is designed for scalability, maintainability, and team collaboration. All code follows React best practices and SOLID principles.
