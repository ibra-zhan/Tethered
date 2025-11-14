# Tethered MVP - Setup Guide

## Prerequisites

Before you begin, ensure you have:

- ✅ Node.js >= 18.0.0 installed
- ✅ npm >= 9.0.0 installed
- ✅ Expo Go app installed on your phone (iOS or Android)
- ✅ A Supabase account with a project created

## Step 1: Configure Supabase

### 1.1 Get Your Supabase Credentials

1. Go to https://supabase.com and sign in
2. Select your project (or create a new one)
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** (e.g., https://xxxxx.supabase.co)
   - **anon public** key

### 1.2 Set Up Database

1. In your Supabase project, go to the **SQL Editor**
2. Create a new query
3. Copy and paste the entire contents of `mvp_schema.sql`
4. Click **Run** to execute the schema

### 1.3 Set Up Storage

#### Create the Storage Bucket

1. In your Supabase dashboard, click **Storage** in the left sidebar
2. Click **New Bucket** button
3. Enter bucket name: `checkin-photos`
4. Toggle **Public bucket** to ON (this makes photos viewable by URL)
5. Click **Create bucket**

#### Add Storage Policies

Now you need to add three policies. Follow these steps **for each policy**:

**Policy 1: Anyone can view photos**

1. Click on your `checkin-photos` bucket
2. Click the **Policies** tab at the top
3. Click **New Policy** button
4. Click **For full customization** at the bottom
5. Fill in the form:
   - **Policy name**: `Anyone can view photos`
   - **Allowed operation**: Check only **SELECT**
   - **Target roles**: Leave as default (public)
   - **Policy definition**: Paste this:
     ```sql
     bucket_id = 'checkin-photos'
     ```
6. Click **Review** then **Save policy**

**Policy 2: Authenticated users can upload photos**

1. Click **New Policy** again
2. Click **For full customization**
3. Fill in the form:
   - **Policy name**: `Authenticated users can upload photos`
   - **Allowed operation**: Check only **INSERT**
   - **Target roles**: Select **authenticated** (NOT public)
   - **WITH CHECK expression**: Paste this:
     ```sql
     bucket_id = 'checkin-photos'
     ```
4. Click **Review** then **Save policy**

**Policy 3: Users can delete own photos**

1. Click **New Policy** again
2. Click **For full customization**
3. Fill in the form:
   - **Policy name**: `Users can delete own photos`
   - **Allowed operation**: Check only **DELETE**
   - **Target roles**: Select **authenticated**
   - **USING expression**: Paste this:
     ```sql
     bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]
     ```
4. Click **Review** then **Save policy**

#### Verify Storage Setup

After adding all three policies, you should see them listed in the Policies tab:
- ✅ Anyone can view photos (SELECT)
- ✅ Authenticated users can upload photos (INSERT)
- ✅ Users can delete own photos (DELETE)

**Note**: If you prefer to add policies via SQL, you can run these in the SQL Editor instead (but use the UI method above for easier setup):

```sql
-- Run these ONE AT A TIME in SQL Editor
CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'checkin-photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'checkin-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 2: Configure Environment Variables

1. Copy the example env files:
   ```bash
   cp .env.example .env
   cp packages/mobile/.env.example packages/mobile/.env
   ```

2. Edit `.env` in the root directory:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Edit `packages/mobile/.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

**Important:** Replace the placeholder values with your actual Supabase credentials from Step 1.1.

## Step 3: Install Dependencies

In the root directory, run:

```bash
npm install
```

This will install dependencies for all packages in the monorepo.

## Step 4: Build Shared Package

Build the shared package so it can be used by the mobile app:

```bash
npm run shared:build
```

## Step 5: Start the Mobile App

Navigate to the mobile package and start Expo:

```bash
cd packages/mobile
npm start
```

Or from the root directory:

```bash
npm run mobile
```

## Step 6: Run on Your Device

### Option A: Using Expo Go (Easiest)

1. Open the Expo Go app on your phone
2. Scan the QR code shown in the terminal
3. The app will load on your device

### Option B: iOS Simulator (Mac only)

1. Press `i` in the terminal where Expo is running
2. iOS Simulator will open with the app

### Option C: Android Emulator

1. Start Android Studio Emulator
2. Press `a` in the terminal where Expo is running

## Testing the App

### Test Flow 1: Student Signup

1. Open the app
2. Tap "I'm a Student"
3. Create an account with email/password
4. Complete profile:
   - Enter your name
   - Enter college name
   - A 6-character family code will be generated (e.g., "ABC123")
5. Share this code with your "parent" test account

### Test Flow 2: Parent Signup

1. Open the app (or use a different device/account)
2. Tap "I'm a Parent"
3. Create an account with a different email
4. Complete profile:
   - Enter your name
   - Enter the student's family code from Test Flow 1
5. Connection will be established!

### Test Flow 3: Send Messages

1. Log in as student
2. Navigate to Home tab
3. Tap "Send Check-In"
4. Enter a message
5. Submit

6. Log in as parent (different device or log out first)
7. Go to Inbox tab
8. See the student's check-in message!

## Troubleshooting

### "Missing Supabase credentials"

- Make sure you created the `.env` files in both root and `packages/mobile/`
- Verify the credentials are correct
- Restart the Expo server after changing .env files

### "Cannot find module '@tethered/shared'"

- Run `npm run shared:build` from the root directory
- Make sure `packages/shared/dist` folder exists

### TypeScript errors

- Run `npm run type-check` to see all type errors
- Make sure you've run `npm install` in the root directory

### Metro bundler errors

- Clear the cache: `expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### RLS Policy errors / "Permission denied"

- Double-check that all RLS policies were created correctly in Supabase
- Verify you're logged in as an authenticated user
- Check the Supabase logs for detailed error messages

## Next Steps

Once you have the basic flows working:

1. ✅ Test student and parent signup
2. ✅ Test family pairing with codes
3. ✅ Test sending check-ins
4. ✅ Test viewing messages in inbox
5. ⚠️ Add photo uploads (future feature)
6. ⚠️ Add prompt system (future feature)
7. ⚠️ Add streak tracking UI (future feature)

## Need Help?

- Check the Supabase documentation: https://supabase.com/docs
- Check Expo documentation: https://docs.expo.dev
- Review the `COMPLETE_PROJECT_BLUEPRINT.md` for full specifications

Enjoy building Tethered! 🎓👪
