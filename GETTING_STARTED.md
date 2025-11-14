# Getting Started with Tethered MVP

## What You Have Now

Congratulations! Your **Tethered MVP** is now set up. This is a minimal working demo with the core features:

✅ **Monorepo Structure** - Organized codebase with shared logic
✅ **Authentication System** - Email/password signup and login
✅ **User Profiles** - Student/parent role selection
✅ **Family Pairing** - 6-character code system to connect families
✅ **Message System** - Send check-ins and view inbox
✅ **Database Schema** - Complete PostgreSQL schema with RLS
✅ **Mobile App** - React Native + Expo app ready to run

## Next Steps

### 1. Configure Your Supabase Credentials

**You need to add your Supabase credentials before the app will work!**

1. Open `.env` in the root directory
2. Replace the placeholder values:
   ```
   SUPABASE_URL=https://your-actual-project.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key
   ```

3. Open `packages/mobile/.env`
4. Replace the placeholder values:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

**Where to find these values:**
- Go to your Supabase project dashboard
- Click **Settings** → **API**
- Copy the **Project URL** and **anon public** key

### 2. Apply the Database Schema

1. Open your Supabase project dashboard
2. Go to the **SQL Editor**
3. Create a new query
4. Copy the entire contents of `mvp_schema.sql`
5. Paste and click **Run**

This will create:
- `user_profiles` table
- `family_connections` table
- `messages` table
- `streaks` table
- All necessary indexes and RLS policies

### 3. Create the Storage Bucket

1. In Supabase, go to **Storage**
2. Click **New Bucket**
3. Name: `checkin-photos`
4. Make it **Public**
5. Follow the instructions in `SETUP_GUIDE.md` to add storage policies

### 4. Start the App

From the root directory:

```bash
npm run mobile
```

This will start the Expo development server.

### 5. Run on Your Device

**Option A: Expo Go (Easiest)**
1. Install Expo Go app on your phone
2. Scan the QR code from your terminal
3. App loads instantly!

**Option B: iOS Simulator (Mac only)**
```bash
Press 'i' in the terminal
```

**Option C: Android Emulator**
```bash
Press 'a' in the terminal
```

## Testing the App

### Create a Student Account

1. Launch the app
2. Tap "I'm a Student"
3. Sign up with:
   - Email: `student@test.com`
   - Password: `password123`
4. Complete profile:
   - Name: "Sarah"
   - College: "UC Berkeley"
5. You'll see a family code like: **ABC123**
6. **Save this code!**

### Create a Parent Account

1. Use a different device OR log out
2. Tap "I'm a Parent"
3. Sign up with:
   - Email: `parent@test.com`
   - Password: `password123`
4. Complete profile:
   - Name: "Mom"
5. Enter the student's code: **ABC123**
6. Connection established!

### Send a Check-In

1. Log in as student
2. Go to **Home** tab
3. Tap "Send Check-In"
4. Enter a message: "Just finished my exam!"
5. Send

### View Messages

1. Log in as parent (or switch accounts)
2. Go to **Inbox** tab
3. See the student's check-in!
4. Reply if you want

## Project Structure

```
Tethered_official/
├── packages/
│   ├── mobile/          # React Native app
│   │   ├── src/
│   │   │   ├── components/    # UI components
│   │   │   ├── screens/       # App screens
│   │   │   ├── navigation/    # Navigation setup
│   │   │   └── theme/         # Design system
│   │   └── App.tsx
│   │
│   └── shared/          # Shared business logic
│       ├── src/
│       │   ├── types/         # TypeScript types
│       │   ├── services/      # API services
│       │   ├── context/       # React contexts
│       │   └── lib/           # Supabase client
│       └── dist/              # Built output
│
├── mvp_schema.sql       # Database schema
├── SETUP_GUIDE.md       # Detailed setup instructions
└── COMPLETE_PROJECT_BLUEPRINT.md  # Full project specs
```

## Available Features (MVP)

### ✅ Implemented
- User authentication (signup/login)
- Student and parent roles
- Profile setup
- Family code pairing
- Basic HomeScreen
- Message inbox
- Check-in functionality (UI ready)

### ⚠️ To Be Implemented
These features are planned but not yet built:
- Photo uploads
- Guided prompts
- Streak display and tracking
- Real-time message notifications
- Profile editing
- Password reset

## Troubleshooting

### "Missing Supabase credentials"
- Check that you've updated both `.env` files with real credentials
- Restart the Expo server: `npm run mobile`

### "Table does not exist"
- Run the SQL schema in Supabase SQL Editor
- Make sure all tables were created successfully

### TypeScript errors
- Run `npm run type-check` from root to see all errors
- Make sure `packages/shared/dist` exists

### App won't load
- Clear Metro cache: `expo start -c` (from packages/mobile)
- Delete and reinstall: `rm -rf node_modules && npm install`

## What's Next?

Check out `COMPLETE_PROJECT_BLUEPRINT.md` for the full vision of Tethered, including:
- Photo attachments
- 10 guided prompts with turn-based system
- Streak gamification
- Premium features
- And much more!

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Expo Docs**: https://docs.expo.dev
- **React Navigation**: https://reactnavigation.org
- **Review**: `SETUP_GUIDE.md` for detailed instructions

---

**Built with ❤️ for college students and their families**

Happy building! 🎓👪
