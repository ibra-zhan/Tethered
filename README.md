# Tethered

A mobile-first application connecting college students with their parents through daily check-ins, guided prompts, and meaningful conversations.

## Project Structure

```
Tethered_official/
├── packages/
│   ├── mobile/          # React Native + Expo app
│   ├── shared/          # Shared business logic
│   └── web/             # React + Vite web app (future)
├── COMPLETE_PROJECT_BLUEPRINT.md
└── package.json
```

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Supabase project

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Set up database:**
   - Go to your Supabase project SQL Editor
   - Run the schema from `mvp_schema.sql`
   - Create storage bucket: `checkin-photos`

4. **Start mobile app:**
   ```bash
   npm run mobile
   ```

5. **Run on device:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## Development

### Available Scripts

- `npm run mobile` - Start mobile app
- `npm run shared:build` - Build shared package
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Tech Stack

- **Mobile:** React Native 0.81.5, Expo ~54.0.23, TypeScript
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management:** React Query (TanStack Query)
- **Navigation:** React Navigation 6

## Features (MVP)

- ✅ User authentication (student/parent roles)
- ✅ Family pairing via 6-digit code
- ✅ Daily check-ins with emoji + text + photo
- ✅ Message timeline/inbox
- ✅ Streak tracking
- ✅ Guided prompts (simplified)

## License

Proprietary - All rights reserved
