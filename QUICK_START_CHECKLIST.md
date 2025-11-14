# Tethered MVP - Quick Start Checklist

## Before You Run the App

### ☐ Step 1: Supabase Setup
- [ ] Go to https://supabase.com and sign in
- [ ] Create a new project (or use existing)
- [ ] Copy your Project URL
- [ ] Copy your anon public key

### ☐ Step 2: Update Environment Variables
- [ ] Edit `.env` in root directory with your Supabase credentials
- [ ] Edit `packages/mobile/.env` with your Supabase credentials

### ☐ Step 3: Apply Database Schema
- [ ] Open Supabase SQL Editor
- [ ] Copy contents of `mvp_schema.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify all tables were created (user_profiles, family_connections, messages, streaks)

### ☐ Step 4: Create Storage Bucket
- [ ] Go to Supabase Storage
- [ ] Create new bucket named `checkin-photos`
- [ ] Make it Public
- [ ] Add storage policies (see SETUP_GUIDE.md)

## Running the App

### ☐ Step 5: Start Development Server
```bash
npm run mobile
```

### ☐ Step 6: Open on Device
Choose one:
- [ ] Scan QR code with Expo Go app
- [ ] Press 'i' for iOS Simulator
- [ ] Press 'a' for Android Emulator

## Testing the App

### ☐ Test 1: Student Flow
- [ ] Tap "I'm a Student"
- [ ] Sign up with test email
- [ ] Complete profile with name and college
- [ ] Note the generated family code
- [ ] Verify you see the HomeScreen

### ☐ Test 2: Parent Flow
- [ ] Use different device/account
- [ ] Tap "I'm a Parent"
- [ ] Sign up with different email
- [ ] Complete profile with name
- [ ] Enter student's family code
- [ ] Verify connection success
- [ ] Verify you see the HomeScreen with student info

### ☐ Test 3: Messaging
- [ ] As student, navigate to Home
- [ ] Tap "Send Check-In"
- [ ] Enter a message
- [ ] Submit
- [ ] As parent, check Inbox
- [ ] Verify message appears

## Troubleshooting

If something doesn't work:
- [ ] Check both .env files have correct credentials
- [ ] Verify database schema was applied
- [ ] Clear Metro cache: `expo start -c`
- [ ] Check Supabase logs for errors
- [ ] Review `SETUP_GUIDE.md` for detailed instructions

## You're Ready! 🎉

Once all checkboxes are complete, you have a working Tethered MVP!

Next steps:
- Implement additional features from the blueprint
- Test with real users
- Add photo upload functionality
- Implement guided prompts
- Add streak tracking

---

**Need help?** See `GETTING_STARTED.md` and `SETUP_GUIDE.md`
