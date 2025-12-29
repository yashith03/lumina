# ✅ Post-Fix Checklist

## Immediate Actions Required

### 1. Verify Supabase Storage Buckets
- [ ] Log into Supabase Dashboard
- [ ] Navigate to Storage
- [ ] Verify `ebooks` bucket exists
- [ ] Verify `covers` bucket exists
- [ ] Set both buckets to **Public** (or configure RLS)

### 2. Set Up RLS Policies (if not done)
```sql
-- Run in Supabase SQL Editor

-- Policy 1: Allow authenticated users to upload their own books
create policy "Users can upload their own books"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'ebooks' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow authenticated users to upload their own covers
create policy "Users can upload their own covers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'covers' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow public read for ebooks
create policy "Public can read ebooks"
on storage.objects
for select
to public
using (bucket_id = 'ebooks');

-- Policy 4: Allow public read for covers
create policy "Public can read covers"
on storage.objects
for select
to public
using (bucket_id = 'covers');
```

### 3. Test the App
```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### 4. Test These Features
- [ ] Google OAuth sign-in
- [ ] Upload a PDF book
- [ ] Upload an EPUB book
- [ ] Verify book covers display correctly
- [ ] Verify fallback gradient shows for books without covers
- [ ] Test search functionality
- [ ] Test TTS reading

---

## Optional: Configure Google OAuth (if not done)

### Supabase Dashboard
1. Go to Authentication → Providers
2. Enable Google
3. Add your OAuth credentials:
   - Client ID: `[Your Google Client ID]`
   - Client Secret: `[Your Google Client Secret]`
4. Add authorized redirect URI:
   ```
   https://wvbkrlgouemotdkghgmf.supabase.co/auth/v1/callback
   ```

### Google Cloud Console
1. Go to APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (if not exists)
3. Add authorized redirect URIs:
   ```
   https://wvbkrlgouemotdkghgmf.supabase.co/auth/v1/callback
   lumina://auth/callback
   ```

---

## Known Issues (Safe to Ignore)

### TypeScript Lint Warning in useAuth.ts
**File:** `src/hooks/useAuth.ts` line 99  
**Warning:** "Expression expected"  
**Status:** False positive - will resolve on next TS server restart  
**Action:** None required

---

## Build for Production

### EAS Build (Recommended)
```bash
# Install EAS CLI (if not installed)
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios --profile preview
```

### Local Build
```bash
# Android
npx expo run:android --variant release

# iOS
npx expo run:ios --configuration Release
```

---

## Environment Variables

Make sure you have a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

**Note:** The credentials are also in `app.json` for EAS builds, so local `.env` is optional.

---

## Next Steps After Testing

1. **If everything works:**
   - ✅ Commit all changes
   - ✅ Push to GitHub
   - ✅ Create EAS build
   - ✅ Test on real devices

2. **If you encounter issues:**
   - Check Supabase logs
   - Check React Native logs: `npx react-native log-android` or `npx react-native log-ios`
   - Verify RLS policies are correct
   - Verify OAuth redirect URIs match

---

## Support

If you need help with:
- OCR implementation
- Streaming uploads for large files
- Advanced search query optimization
- Push notifications
- Realtime features

Just ask! 🚀
