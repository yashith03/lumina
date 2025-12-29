-- Lumina - Supabase Database Setup
-- Copy and paste this entire file into Supabase SQL Editor
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste this → Run

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Profiles table (references auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Fiction',
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  file_path TEXT NOT NULL,
  cover_path TEXT,
  language TEXT DEFAULT 'en-US',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT book_title_length CHECK (length(title) > 0),
  CONSTRAINT book_author_length CHECK (length(author) > 0)
);

-- Reading progress table
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  position JSONB DEFAULT '{"chapterIndex": 0, "paragraphIndex": 0, "charOffset": 0}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_book UNIQUE(user_id, book_id)
);

-- Extracted text cache table (optional, for performance)
CREATE TABLE IF NOT EXISTS extracted_text_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  text_version INT DEFAULT 1,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_book_version UNIQUE(book_id, text_version)
);

-- ============================================
-- 2. CREATE INDEXES for better query performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_books_owner_id ON books(owner_id);
CREATE INDEX IF NOT EXISTS idx_books_visibility ON books(visibility);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON reading_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_updated_at ON reading_progress(updated_at DESC);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_text_cache ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- --------- PROFILES TABLE ---------

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow inserts for new users (via trigger)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- --------- BOOKS TABLE ---------

-- Anyone can view public books
CREATE POLICY "Anyone can view public books" ON books
  FOR SELECT
  USING (visibility = 'public');

-- Users can view their own private books
CREATE POLICY "Users can view own private books" ON books
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Users can insert books
CREATE POLICY "Users can insert books" ON books
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own books
CREATE POLICY "Users can update own books" ON books
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Users can delete their own books
CREATE POLICY "Users can delete own books" ON books
  FOR DELETE
  USING (auth.uid() = owner_id);

-- --------- READING_PROGRESS TABLE ---------

-- Users can view their own progress
CREATE POLICY "Users can view own reading progress" ON reading_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert reading progress" ON reading_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own reading progress" ON reading_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete own reading progress" ON reading_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- --------- EXTRACTED_TEXT_CACHE TABLE ---------

-- Anyone can view cache for public books
CREATE POLICY "Anyone can view cache for public books" ON extracted_text_cache
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = extracted_text_cache.book_id
      AND (books.visibility = 'public' OR auth.uid() = books.owner_id)
    )
  );

-- Only book owners can insert/update cache
CREATE POLICY "Book owners can manage cache" ON extracted_text_cache
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = extracted_text_cache.book_id
      AND auth.uid() = books.owner_id
    )
  );

CREATE POLICY "Book owners can update cache" ON extracted_text_cache
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = extracted_text_cache.book_id
      AND auth.uid() = books.owner_id
    )
  );

-- ============================================
-- 5. CREATE FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp on books
CREATE OR REPLACE FUNCTION public.update_books_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = CURRENT_TIMESTAMP;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_books_updated ON books;
CREATE TRIGGER on_books_updated
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION public.update_books_updated_at();

-- Update updated_at timestamp on profiles
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = CURRENT_TIMESTAMP;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();

-- ============================================
-- 6. STORAGE BUCKETS (Create manually in Supabase UI)
-- ============================================
-- Go to Storage in Supabase Dashboard and create:
--
-- 1. Bucket: "ebooks"
--    - Private (unchecked "Make it public")
--    - For: PDF/EPUB files
--
-- 2. Bucket: "covers"
--    - Public (checked "Make it public")
--    - For: Cover images
--
-- ============================================

-- ============================================
-- 7. STORAGE RLS POLICIES
-- ============================================

-- For 'ebooks' bucket - private files
-- Users can upload to their own directory
INSERT INTO storage.objects (bucket_id, name, owner, metadata, path_tokens, version)
SELECT 'ebooks'::uuid, '', auth.uid(), '{}', array[]::text[], 0
WHERE NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'ebooks'::uuid);

-- For 'covers' bucket - public files
INSERT INTO storage.objects (bucket_id, name, owner, metadata, path_tokens, version)
SELECT 'covers'::uuid, '', auth.uid(), '{}', array[]::text[], 0
WHERE NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'covers'::uuid);

-- ============================================
-- 8. TEST DATA (Optional - for development)
-- ============================================

-- Delete existing test data first (if any)
DELETE FROM reading_progress;
DELETE FROM books;
DELETE FROM profiles;

-- Insert test books (requires at least one user in auth.users)
-- Uncomment and modify if needed, or create manually via app

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Create OAuth provider (Google) in Supabase Auth
-- 2. Create storage buckets (ebooks, covers)
-- 3. Update .env.local with your credentials
-- 4. Run: npm install
-- 5. Run: npm start
