# Lumina - React Native E-Book Reader

## Environment Setup

### 1. Create `.env.local` file in project root

Copy and fill in your Supabase credentials:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Get Supabase Credentials

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy:
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`
   - Anon Key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Google OAuth (Authentication)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
6. Copy Client ID and Secret
7. In Supabase:
   - Go to Authentication → Providers
   - Enable Google
   - Add Client ID and Secret

### 4. Install Dependencies

```bash
npm install
# or
yarn install
```

### 5. Create Supabase Tables

Run the SQL migrations (see SUPABASE_SETUP.sql) in your Supabase SQL editor:
- Go to Supabase Dashboard
- Click "SQL Editor"
- Create new query
- Copy and paste SQL from SUPABASE_SETUP.sql
- Run all migrations

### 6. Configure Storage Buckets

In Supabase Dashboard:

1. **Create 'ebooks' bucket:**
   - Storage → Buckets → New Bucket
   - Name: `ebooks`
   - Make public: No (for private books)
   - Click Create

2. **Create 'covers' bucket:**
   - Name: `covers`
   - Make public: Yes (for public cover images)
   - Click Create

### 7. Set Up RLS Policies

Run the RLS policy SQL in the SQL Editor (see SUPABASE_SETUP.sql for RLS policies)

### 8. Run Development Server

```bash
npm start
# Choose your platform:
# - Press 'i' for iOS
# - Press 'a' for Android
# - Press 'w' for web
```

## Project Structure

```
app/
  ├── (auth)/              # Authentication flow
  │   ├── _layout.tsx
  │   ├── welcome.tsx      # Onboarding screen
  │   └── callback.tsx     # OAuth callback
  ├── (tabs)/              # Main app tabs
  │   ├── _layout.tsx
  │   ├── home.tsx         # Recent & recommended books
  │   ├── library.tsx      # Search & browse
  │   ├── upload.tsx       # Upload new books
  │   └── settings.tsx     # User settings
  ├── reading/
  │   └── [bookId].tsx     # Reading screen with TTS
  └── _layout.tsx

src/
  ├── components/          # UI Components
  ├── services/            # Business logic
  ├── hooks/               # Custom React hooks
  ├── types/               # TypeScript types
  └── utils/               # Utilities & helpers
```

## Key Features

- **Authentication:** Google OAuth via Supabase
- **Text-to-Speech:** expo-speech with voice selection
- **Book Management:** Upload, search, organize books
- **Reading Progress:** Auto-save position
- **Offline Support:** Local caching with MMKV/SQLite
- **Modern UI:** NativeWind (Tailwind for React Native)
- **Type Safe:** Full TypeScript coverage

## API Documentation

### Authentication Service
- `signInWithGoogle()` - Google OAuth login
- `signOut()` - Logout
- `getSession()` - Get current session
- `onAuthStateChange()` - Listen to auth changes

### Books Service
- `getBooks()` - Fetch books with filters
- `getBookById()` - Get single book
- `getRecentBooks()` - User's recent books
- `getRecommendedBooks()` - Public books
- `getCategories()` - Available categories
- `deleteBook()` - Delete user's book

### TTS Service
- `getAvailableVoices()` - List voices
- `getVoicesForLanguage()` - Filter by language
- `speak()` - Play text with settings
- `stop()` - Stop playback
- `pause()` - Pause playback
- `resume()` - Resume playback

### Text Extraction Service
- `extractText()` - Extract from PDF/EPUB
- `getCachedText()` - Get from local cache
- `detectOCRNeed()` - Check if OCR needed

### Progress Service
- `saveProgress()` - Save reading position
- `getProgress()` - Get reading position
- `deleteProgress()` - Delete progress

### Upload Service
- `uploadBook()` - Upload book file
- `uploadCover()` - Upload cover image

## Troubleshooting

### OAuth not working
- Check Supabase Google provider is enabled
- Verify callback URI matches Supabase settings
- Clear browser cache and cookies

### Text extraction fails
- PDF might be image-based (scanned document)
- Only PDFs with text layers are supported
- OCR support planned for future

### TTS not playing
- Check device has available voices
- Verify language matches selected voice
- Grant app audio permissions

### Books not loading
- Check Supabase URL and key are correct
- Verify RLS policies are enabled
- Check database has books table

## Support & Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native](https://reactnative.dev)
- [Supabase](https://supabase.com/docs)
- [NativeWind](https://www.nativewind.dev)
- [TanStack Query](https://tanstack.com/query)
