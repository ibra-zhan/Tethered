# 🎓 Tethered: Complete Project Blueprint
## Full Specification for Rebuilding the Entire Application

**Document Version**: 2.0
**Last Updated**: November 2025
**Purpose**: Complete guide to rebuild Tethered from scratch with Claude Code
**Target**: College Student + Parent Connection App

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Architecture](#database-architecture)
5. [Backend Services](#backend-services)
6. [Type System](#type-system)
7. [Mobile App (React Native + Expo)](#mobile-app)
8. [Web App (React + Vite)](#web-app)
9. [Shared Package](#shared-package)
10. [Features Implementation](#features-implementation)
11. [UI/UX Design System](#uiux-design-system)
12. [User Flows](#user-flows)
13. [Development Roadmap](#development-roadmap)
14. [Deployment](#deployment)

---

## Product Overview

### What is Tethered?

**Tethered** is a mobile-first application that bridges the emotional gap between college students (19-23) and their parents (45-60) during the transition to independence.

### Core Value Propositions

1. **For Students**: Stay connected to family without pressure of long phone calls
2. **For Parents**: Peace of mind through daily micro-updates and guided check-ins
3. **For Both**: Structured prompts make difficult conversations easier
4. **Unique Angle**: Celebrates "adulting milestones" together

### Key Differentiators

- **NO location tracking** (unlike Life360)
- **Structured communication** through guided prompts
- **Milestone tracking** for college achievements
- **Streak gamification** for mutual engagement
- **Parent-student specific** features and flows

### Target Users

**Primary User: College Student (19-23)**
- Feels guilty about not calling home enough
- Wants independence but still needs advice
- Uncomfortable initiating "serious" conversations
- Busy schedule makes long phone calls difficult

**Secondary User: Parent (45-60)**
- Worries about student's wellbeing
- Wants to stay connected without being "clingy"
- Misses daily interactions from high school years
- Wants to share wisdom without lecturing

---

## Tech Stack

### Core Technologies

```yaml
Frontend (Mobile):
  - React Native: 0.81.5
  - Expo: ~54.0.23
  - TypeScript: ~5.9.2
  - React Navigation: ^6.1.18
  - React Query: ^5.90.7

Frontend (Web):
  - React: 18.3.1
  - Vite: ^6.0.5
  - TypeScript: ~5.9.3
  - React Query: ^5.90.7

Backend:
  - Supabase (PostgreSQL + Auth + Storage + Realtime)
  - Row Level Security (RLS) policies

Shared Logic:
  - Monorepo with npm workspaces
  - Shared services, hooks, and types

Development:
  - ESLint: ^9.36.0
  - TypeScript strict mode
  - Hot module replacement
```

### Key Libraries

```json
{
  "authentication": "@supabase/supabase-js",
  "state-management": "@tanstack/react-query",
  "navigation-mobile": "@react-navigation/native",
  "navigation-web": "react-router-dom (optional)",
  "image-handling": "expo-image-picker",
  "file-system": "expo-file-system",
  "gestures": "react-native-gesture-handler",
  "animations": "react-native-reanimated"
}
```

---

## Project Structure

### Monorepo Architecture

```
Relationships/
├── package.json                 # Root package (workspaces config)
├── tsconfig.json               # Root TypeScript config
├── .env                        # Root environment variables
├── COMPLETE_PROJECT_BLUEPRINT.md  # This file
├── COLLEGE_STUDENT_PARENT_PRODUCT_SPEC.md
├── PROGRESS_REPORT.md
├── SETUP_GUIDE.md
├── mvp_schema.sql             # Database schema
│
├── packages/
│   ├── mobile/                # React Native + Expo app
│   │   ├── package.json
│   │   ├── app.json          # Expo configuration
│   │   ├── tsconfig.json
│   │   ├── index.js          # Entry point
│   │   ├── App.tsx           # Root component
│   │   ├── .env              # Mobile env variables
│   │   ├── assets/           # Images, fonts, icons
│   │   │   ├── icon.png
│   │   │   ├── splash.png
│   │   │   └── adaptive-icon.png
│   │   └── src/
│   │       ├── components/    # Reusable components
│   │       │   ├── Avatar.tsx
│   │       │   ├── Button.tsx
│   │       │   ├── Card.tsx
│   │       │   ├── Input.tsx
│   │       │   ├── Loader.tsx
│   │       │   ├── BottomSheet.tsx
│   │       │   └── ScreenContainer.tsx
│   │       ├── screens/       # Screen components
│   │       │   ├── OnboardingScreen.tsx
│   │       │   ├── LoginScreen.tsx
│   │       │   ├── SignupScreen.tsx
│   │       │   ├── ProfileSetupScreen.tsx
│   │       │   ├── HomeScreen.tsx
│   │       │   ├── DiscoverScreen.tsx
│   │       │   ├── InboxScreen.tsx
│   │       │   ├── ProfileScreen.tsx
│   │       │   ├── TimelineScreen.tsx
│   │       │   ├── AddPersonScreen.tsx
│   │       │   ├── EditPersonScreen.tsx
│   │       │   ├── ConnectionOptionsScreen.tsx
│   │       │   ├── SendMessageScreen.tsx
│   │       │   ├── SendQuestionScreen.tsx
│   │       │   ├── PhotoPickerScreen.tsx
│   │       │   └── VoiceRecorderScreen.tsx
│   │       ├── navigation/    # Navigation setup
│   │       │   ├── RootNavigator.tsx
│   │       │   ├── AuthStack.tsx
│   │       │   └── MainTabs.tsx
│   │       ├── theme/         # Design system
│   │       │   ├── index.ts
│   │       │   ├── colors.ts
│   │       │   ├── spacing.ts
│   │       │   ├── typography.ts
│   │       │   └── borderRadius.ts
│   │       └── types/         # Mobile-specific types
│   │           └── navigation.ts
│   │
│   ├── web/                  # React + Vite web app
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   ├── .env.example
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── components/
│   │       ├── context/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── lib/
│   │       └── types/
│   │
│   └── shared/              # Shared business logic
│       ├── package.json
│       ├── tsconfig.json
│       ├── babel.config.js  # For transpiling
│       └── src/
│           ├── index.ts      # Main export file
│           ├── types/        # Shared types
│           │   ├── user.ts
│           │   ├── message.ts
│           │   ├── person.ts
│           │   ├── connection.ts
│           │   └── state.ts
│           ├── context/      # React contexts
│           │   └── AuthContext.tsx
│           ├── hooks/        # React Query hooks
│           │   ├── useFamily.ts
│           │   ├── useMessages.ts
│           │   ├── usePeople.ts
│           │   └── useConnections.ts
│           ├── services/     # API services
│           │   ├── userProfileService.ts
│           │   ├── familyConnectionService.ts
│           │   ├── messageService.ts
│           │   ├── photoService.ts
│           │   ├── streakService.ts
│           │   ├── promptService.ts
│           │   ├── peopleService.ts
│           │   └── connectionsService.ts
│           └── lib/          # Utility functions
│               ├── supabase.ts
│               └── queryClient.ts
```

---

## Database Architecture

### Schema Overview

The database uses **PostgreSQL** via Supabase with the following tables:

1. **user_profiles** - Extended user data beyond Supabase Auth
2. **family_connections** - 1:1 pairing between students and parents
3. **messages** - All communications (check-ins, prompts, replies)
4. **streaks** - Gamification tracking
5. **prompt_turns** - Turn-based prompt system

### Complete Database Schema

```sql
-- ============================================
-- Core Tables
-- ============================================

-- User Profiles (extends Supabase Auth)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'parent')),

  -- Student-specific
  college_name TEXT,
  family_code TEXT UNIQUE,  -- 6-digit code for parent pairing

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Connections (1:1 parent-student)
CREATE TABLE family_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, parent_id)
);

-- Messages (check-ins, prompt responses, replies)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_connection_id UUID NOT NULL REFERENCES family_connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('checkin', 'prompt_response', 'reply')),
  prompt_id INTEGER CHECK (prompt_id BETWEEN 1 AND 10 OR prompt_id IS NULL),
  emoji TEXT,
  message_text TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Streaks (engagement gamification)
CREATE TABLE streaks (
  family_connection_id UUID PRIMARY KEY REFERENCES family_connections(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_interaction_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt Turns (rotation system)
CREATE TABLE prompt_turns (
  family_connection_id UUID PRIMARY KEY REFERENCES family_connections(id) ON DELETE CASCADE,
  next_responder_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  current_prompt_id INTEGER NOT NULL DEFAULT 1 CHECK (current_prompt_id BETWEEN 1 AND 10),
  prompt_shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_turns ENABLE ROW LEVEL SECURITY;

-- User Profiles: View own + family member
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view family member profile"
  ON user_profiles FOR SELECT
  USING (
    id IN (
      SELECT student_id FROM family_connections WHERE parent_id = auth.uid()
      UNION
      SELECT parent_id FROM family_connections WHERE student_id = auth.uid()
    )
  );

-- Family Connections: View own connections
CREATE POLICY "Users can view their connections"
  ON family_connections FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = parent_id);

-- Messages: View family messages only
CREATE POLICY "Users can view family messages"
  ON messages FOR SELECT
  USING (
    family_connection_id IN (
      SELECT id FROM family_connections
      WHERE student_id = auth.uid() OR parent_id = auth.uid()
    )
  );

-- Streaks: View own family streak
CREATE POLICY "Users can view their streaks"
  ON streaks FOR SELECT
  USING (
    family_connection_id IN (
      SELECT id FROM family_connections
      WHERE student_id = auth.uid() OR parent_id = auth.uid()
    )
  );
```

### Storage Setup

**Bucket**: `checkin-photos`
- **Public**: Yes
- **File Size Limit**: 2MB
- **MIME Types**: image/jpeg, image/png, image/jpg

```sql
-- Storage Policies
CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'checkin-photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'checkin-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'checkin-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Backend Services

### Service Layer Architecture

All business logic lives in the `packages/shared/src/services/` directory. Each service handles a specific domain.

### 1. userProfileService.ts

**Purpose**: User profile management

```typescript
export const userProfileService = {
  // Get user profile
  async getProfile(userId: string): Promise<UserProfile>

  // Create new profile (auto-generates family code for students)
  async createProfile(userId: string, data: CreateProfileData): Promise<UserProfile>

  // Update profile
  async updateProfile(userId: string, updates: UpdateProfileData): Promise<UserProfile>

  // Check if profile exists
  async hasProfile(userId: string): Promise<boolean>

  // Generate unique 6-char family code
  async generateFamilyCode(): Promise<string>

  // Find student by family code (for parent pairing)
  async findStudentByFamilyCode(code: string): Promise<UserProfile | null>

  // Get user type
  async getUserType(userId: string): Promise<UserType>
}
```

### 2. familyConnectionService.ts

**Purpose**: Family pairing and connection management

```typescript
export const familyConnectionService = {
  // Create connection between student and parent
  async createConnection(studentId: string, parentId: string): Promise<FamilyConnection>

  // Get family connection for a user
  async getConnection(userId: string): Promise<FamilyConnection | null>

  // Get the other person in the connection
  async getConnectionPartner(userId: string): Promise<UserProfile | null>

  // Check if user has a connection
  async hasConnection(userId: string): Promise<boolean>

  // Delete connection
  async deleteConnection(userId: string): Promise<void>

  // Helper: Get connection ID
  async getConnectionId(userId: string): Promise<string | null>
}
```

### 3. messageService.ts

**Purpose**: All messaging functionality

```typescript
export const messageService = {
  // Send daily check-in
  async sendCheckIn(data: CreateCheckInData): Promise<Message>

  // Send prompt response
  async sendPromptResponse(data: CreatePromptResponseData): Promise<Message>

  // Reply to a message
  async sendReply(data: CreateReplyData): Promise<Message>

  // Get all messages for a family
  async getMessages(familyConnectionId: string): Promise<Message[]>

  // Paginated messages (infinite scroll)
  async getMessagesPaginated(id: string, limit: number, offset: number): Promise<Message[]>

  // Get latest message
  async getLatestMessage(id: string): Promise<Message | null>

  // Get messages by type
  async getMessagesByType(id: string, type: MessageType): Promise<Message[]>

  // Delete own message
  async deleteMessage(messageId: string, userId: string): Promise<void>

  // Real-time subscription
  subscribeToMessages(id: string, callback: (message: Message) => void): RealtimeChannel
}
```

### 4. photoService.ts

**Purpose**: Photo upload and management

```typescript
export const photoService = {
  // Upload photo to Supabase Storage
  async uploadPhoto(userId: string, connectionId: string, photoUri: string): Promise<string>

  // Delete photo
  async deletePhoto(photoUrl: string): Promise<void>

  // List all photos for a user
  async listPhotos(userId: string, connectionId: string): Promise<string[]>

  // Get storage usage
  async getStorageUsage(userId: string): Promise<number>

  // Validate photo URL
  isValidPhotoUrl(url: string): boolean
}
```

### 5. streakService.ts

**Purpose**: Streak tracking and gamification

```typescript
export const streakService = {
  // Get current streak
  async getStreak(familyConnectionId: string): Promise<Streak>

  // Update streak after interaction
  async updateStreak(familyConnectionId: string): Promise<Streak>

  // Check if streak is at risk
  async checkStreakStatus(id: string): Promise<'safe' | 'at_risk' | 'broken'>

  // Helper: Days between dates
  daysBetween(date1: Date, date2: Date): number

  // Get achieved milestones
  getStreakMilestones(streakCount: number): number[]

  // Get next milestone
  getNextMilestone(streakCount: number): number
}
```

### 6. promptService.ts

**Purpose**: Guided prompt system

```typescript
export const promptService = {
  // Get current active prompt
  async getCurrentPrompt(id: string, userId: string): Promise<Prompt | null>

  // Advance to next prompt
  async advancePrompt(id: string): Promise<void>

  // Get specific prompt by ID
  getPromptById(id: number): Prompt

  // Get all prompts
  getAllPrompts(): Prompt[]

  // Check if 48 hours passed (can show new prompt)
  async shouldShowPrompt(id: string): Promise<boolean>

  // Get hours until next prompt
  async getHoursUntilNextPrompt(id: string): Promise<number>

  // Check if user answered current prompt
  async hasAnsweredCurrentPrompt(id: string, userId: string): Promise<boolean>
}
```

### 10 Built-in Prompts

```typescript
const PROMPTS: Prompt[] = [
  {
    id: 1,
    category: 'adulting',
    question_text: "What's one thing you wish you knew about managing money before college?",
    target_audience: 'either'
  },
  {
    id: 2,
    category: 'mental_health',
    question_text: "On a scale of 1-10, how are you managing stress this week?",
    target_audience: 'student'
  },
  {
    id: 3,
    category: 'life_advice',
    question_text: "If you could go back to college, what would you do differently?",
    target_audience: 'parent'
  },
  {
    id: 4,
    category: 'nostalgia',
    question_text: "Share a favorite memory from when I was younger and tell me the story behind it.",
    target_audience: 'parent'
  },
  {
    id: 5,
    category: 'personal_growth',
    question_text: "What's something new you tried recently? How did it go?",
    target_audience: 'student'
  },
  {
    id: 6,
    category: 'financial',
    question_text: "What purchase are you most proud of this month?",
    target_audience: 'student'
  },
  {
    id: 7,
    category: 'adulting',
    question_text: "How did you handle homesickness during your first year of college?",
    target_audience: 'parent'
  },
  {
    id: 8,
    category: 'mental_health',
    question_text: "What's one thing bringing you joy right now?",
    target_audience: 'either'
  },
  {
    id: 9,
    category: 'life_advice',
    question_text: "What's the best career advice you ever received?",
    target_audience: 'parent'
  },
  {
    id: 10,
    category: 'personal_growth',
    question_text: "What's a decision you're facing that you'd like input on?",
    target_audience: 'student'
  }
];
```

---

## Type System

### Complete TypeScript Types

All types are defined in `packages/shared/src/types/`

#### user.ts

```typescript
export type UserType = 'student' | 'parent';

export interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
  user_type: UserType;
  college_name?: string;  // Students only
  family_code?: string;   // Students only
  created_at: string;
  updated_at: string;
}

export interface FamilyConnection {
  id: string;
  student_id: string;
  parent_id: string;
  connected_at: string;
}

export interface Streak {
  family_connection_id: string;
  current_streak: number;
  longest_streak: number;
  last_interaction_date: string;
  updated_at: string;
}

export interface PromptTurn {
  family_connection_id: string;
  next_responder_id: string;
  current_prompt_id: number;
  prompt_shown_at: string;
}

export interface CreateProfileData {
  name: string;
  avatar_url?: string;
  user_type: UserType;
  college_name?: string;
}

export interface UpdateProfileData {
  name?: string;
  avatar_url?: string;
  college_name?: string;
}
```

#### message.ts

```typescript
export type MessageType = 'checkin' | 'prompt_response' | 'reply';

export interface Message {
  id: string;
  family_connection_id: string;
  sender_id: string;
  message_type: MessageType;
  prompt_id?: number;
  emoji?: string;
  message_text: string;
  photo_url?: string;
  created_at: string;
}

export interface CreateCheckInData {
  family_connection_id: string;
  sender_id: string;
  emoji?: string;
  message_text: string;
  photo_url?: string;
}

export interface CreatePromptResponseData {
  family_connection_id: string;
  sender_id: string;
  prompt_id: number;
  message_text: string;
  photo_url?: string;
}

export interface CreateReplyData {
  family_connection_id: string;
  sender_id: string;
  emoji?: string;
  message_text: string;
}

export interface Prompt {
  id: number;
  category: 'adulting' | 'mental_health' | 'financial' | 'life_advice' | 'nostalgia' | 'personal_growth';
  question_text: string;
  target_audience: 'student' | 'parent' | 'either';
}
```

---

## Mobile App

### Navigation Structure

```
Root Navigator (Stack)
├── Auth (Stack Navigator)
│   ├── Onboarding
│   ├── Login
│   └── Signup
│
├── ProfileSetup (Modal)
│
└── Main (Tab Navigator)
    ├── Home Tab
    ├── Discover Tab
    ├── Inbox Tab
    └── Profile Tab

Modal Screens (Stack Group)
├── Timeline
├── SendMessage
├── SendQuestion
├── PhotoPicker
├── VoiceRecorder
├── DrawingCanvas
├── EditPerson
├── AddPerson
└── ConnectionOptions
```

### Key Mobile Screens

#### 1. OnboardingScreen.tsx

**Purpose**: Welcome screen with user type selection

```typescript
// Components:
- Welcome message
- "I'm a Student" button
- "I'm a Parent" button
- Terms & Privacy links

// Navigation:
- Student → SignupScreen (with type='student')
- Parent → SignupScreen (with type='parent')
```

#### 2. SignupScreen.tsx

**Purpose**: Create account

```typescript
// Props:
- route.params.userType: 'student' | 'parent'

// Form Fields:
- Email
- Password
- Confirm Password

// Actions:
- Sign up with Supabase Auth
- Navigate to ProfileSetupScreen
```

#### 3. ProfileSetupScreen.tsx

**Purpose**: Complete profile after signup

```typescript
// For Students:
- Name
- College Name
- Upload Photo
- Auto-generate family code
- Display family code: "Share this with your parent: ABC123"

// For Parents:
- Name
- Upload Photo
- Input field: "Enter your student's family code"
- Verify code → Create connection

// Actions:
- createProfile()
- For parents: findStudentByFamilyCode() → createConnection()
```

#### 4. HomeScreen.tsx

**Purpose**: Main dashboard (different for student vs parent)

**Student View:**
```typescript
- Greeting: "Good morning, Sarah!"
- Streak display: 🔥 7-day streak with Mom
- Today's Prompt card (if available)
- Quick Check-In button
- Log Milestone button
- Recent Conversations list
```

**Parent View:**
```typescript
- Greeting: "Hi Mom!"
- Streak display: 🔥 7-day streak with Sarah
- Student's Last Update card (check-in)
- Send Encouragement quick templates
- Recent Conversations list
```

#### 5. DiscoverScreen.tsx

**Purpose**: Browse people (swipeable cards)

```typescript
// Current Implementation:
- Horizontal swipe through people
- Person cards with photo, name, relationship
- Action buttons: Message, Question, Photo, Voice, Timeline
- Add Person button

// Future: Will be simplified for parent-student only
```

#### 6. InboxScreen.tsx

**Purpose**: Message timeline/feed

```typescript
// Components:
- Chronological list of all messages
- Filter tabs: All, Check-ins, Prompts, Photos
- Message cards with:
  - Sender avatar + name
  - Message type indicator
  - Text content
  - Photo (if attached)
  - Timestamp
  - Reply button

// Actions:
- Pull to refresh
- Infinite scroll
- Reply to messages
```

#### 7. ProfileScreen.tsx

**Purpose**: User profile and settings

```typescript
// Sections:
- Profile Info (photo, name, college)
- Family Connection status
- Streak stats (current, longest)
- Settings
  - Account Settings
  - Notifications
  - Privacy & Security
  - About
- Sign Out button
```

#### 8. SendMessageScreen.tsx (Modal)

**Purpose**: Send check-in

```typescript
// Form:
- Emoji picker
- Text input (1-2 sentences)
- Photo attachment button
- Preview photo
- Send button

// Actions:
- useSendCheckIn()
- Update streak
- Close modal
```

#### 9. SendQuestionScreen.tsx (Modal)

**Purpose**: Answer guided prompt

```typescript
// Display:
- Current prompt question
- "Your turn to answer!" or "Waiting for [name]"
- Text input (multi-line)
- Photo attachment button

// Actions:
- useSendPromptResponse()
- Advance prompt turn
- Update streak
```

### Theme System (Mobile)

#### colors.ts

```typescript
export const colors = {
  // Dark theme
  background: '#0F0F0F',
  backgroundSecondary: '#1a1a1a',
  backgroundTertiary: '#2a2a2a',

  // Text
  text: '#FFFFFF',
  textSecondary: '#999999',
  textTertiary: '#666666',

  // Primary (Purple)
  primary: '#A855F7',
  primaryDark: '#9333EA',
  primaryLight: '#C084FC',

  // Status
  success: '#4ade80',
  warning: '#fbbf24',
  danger: '#ef4444',
  info: '#06B6D4',

  // Functional
  border: 'rgba(255, 255, 255, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Gradients
  gradientPurple: ['#A855F7', '#EC4899'],
  gradientDark: ['#1a1a1a', '#0F0F0F']
};
```

#### spacing.ts

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64
};
```

#### typography.ts

```typescript
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
};
```

#### borderRadius.ts

```typescript
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999
};
```

### Reusable Components

#### Avatar.tsx

```typescript
interface AvatarProps {
  uri?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Displays user avatar or initials fallback
```

#### Button.tsx

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

// Styled button with variants
```

#### Card.tsx

```typescript
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

// Container with consistent styling
```

#### Input.tsx

```typescript
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  containerStyle?: ViewStyle;
}

// Text input with label, error states, password toggle
```

#### Loader.tsx

```typescript
interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

// Loading indicator with optional text
```

#### BottomSheet.tsx

```typescript
interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | string;
}

// Modal sheet from bottom
```

---

## Web App

### Web Structure (React + Vite)

```
packages/web/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component
│   ├── components/           # React components
│   │   ├── AuthRouter.tsx    # Auth flow routing
│   │   ├── OnboardingFlow.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── InboxScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── ...
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   ├── hooks/
│   │   ├── usePeople.ts
│   │   └── useConnections.ts
│   ├── services/
│   │   └── [mirrors shared services]
│   └── lib/
│       ├── supabase.ts
│       └── queryClient.ts
```

### Key Differences from Mobile

- Uses React Router for navigation (optional)
- Responsive design for desktop/tablet
- Can share most UI logic with mobile
- Different component library (no React Native)

---

## Shared Package

### Purpose

Contains all business logic that's shared between mobile and web:

1. **Types** - TypeScript interfaces and types
2. **Services** - API calls to Supabase
3. **Hooks** - React Query hooks
4. **Context** - Auth context provider
5. **Utilities** - Helper functions

### Export Structure

```typescript
// packages/shared/src/index.ts

// Types
export * from './types/user';
export * from './types/message';
export * from './types/person';
export * from './types/connection';

// Services
export * from './services/userProfileService';
export * from './services/familyConnectionService';
export * from './services/messageService';
export * from './services/photoService';
export * from './services/streakService';
export * from './services/promptService';

// Context
export * from './context/AuthContext';

// Lib
export * from './lib/supabase';
export * from './lib/queryClient';

// Hooks
export * from './hooks/useFamily';
export * from './hooks/useMessages';
export * from './hooks/usePeople';
export * from './hooks/useConnections';
```

### Build Process

```json
// packages/shared/package.json
{
  "scripts": {
    "build": "babel src --out-dir dist --extensions '.ts,.tsx' --copy-files"
  }
}
```

---

## Features Implementation

### Feature 1: User Authentication

**Flow:**
1. User opens app → OnboardingScreen
2. Select "I'm a Student" or "I'm a Parent"
3. SignupScreen → Email + Password
4. Supabase Auth creates account
5. ProfileSetupScreen → Complete profile
6. Navigate to HomeScreen

**Services Used:**
- Supabase Auth (built-in)
- `userProfileService.createProfile()`

### Feature 2: Family Pairing

**Flow (Student):**
1. ProfileSetupScreen generates family code: "ABC123"
2. Display code prominently
3. Wait for parent to join
4. Receive notification when parent connects

**Flow (Parent):**
1. ProfileSetupScreen shows code input
2. Enter student's code: "ABC123"
3. `findStudentByFamilyCode('ABC123')`
4. Confirm: "Connect with Sarah at UC Berkeley?"
5. `createConnection(studentId, parentId)`
6. Both users see "Connected!" message

**Services Used:**
- `userProfileService.generateFamilyCode()`
- `userProfileService.findStudentByFamilyCode()`
- `familyConnectionService.createConnection()`

### Feature 3: Daily Check-Ins

**Flow:**
1. Student taps "Send Quick Check-In" on HomeScreen
2. SendMessageScreen modal opens
3. Select mood emoji: 😊
4. Type message: "Aced my bio exam!"
5. Optionally attach photo
6. Tap "Send"
7. `sendCheckIn()` → Creates message
8. `updateStreak()` → Increments streak
9. Parent receives push notification
10. Parent replies with encouragement

**Services Used:**
- `messageService.sendCheckIn()`
- `streakService.updateStreak()`
- `photoService.uploadPhoto()` (if photo attached)

### Feature 4: Guided Prompts

**Flow:**
1. System shows daily prompt: "What's bringing you joy?"
2. Student's turn to answer first
3. Student taps "Answer Prompt"
4. SendQuestionScreen opens with prompt
5. Type response: "My roommate's dog visited!"
6. Tap "Submit"
7. `sendPromptResponse()` → Creates message
8. `advancePrompt()` → Now parent's turn
9. Parent sees notification: "Sarah answered today's prompt"
10. Parent opens app → Reads response → Answers prompt

**Services Used:**
- `promptService.getCurrentPrompt()`
- `messageService.sendPromptResponse()`
- `promptService.advancePrompt()`

### Feature 5: Streak Tracking

**Logic:**
- Streak increments when **both users** interact within 24 hours
- Last interaction date is tracked
- If > 24 hours pass, streak resets to 0
- Longest streak is always preserved

**Visual:**
- 🔥 [number] on HomeScreen
- Milestones: 7, 14, 30, 50, 100, 365 days
- Badges/celebrations at milestones

**Services Used:**
- `streakService.getStreak()`
- `streakService.updateStreak()`
- `streakService.checkStreakStatus()`

### Feature 6: Timeline/Inbox

**Display:**
- All messages in chronological order
- Mixed types: check-ins, prompts, replies
- Each card shows:
  - Sender avatar + name
  - Message type badge
  - Text content
  - Photo (if attached)
  - Timestamp (relative: "2 hours ago")
  - Reply button

**Filters:**
- All
- Check-ins only
- Prompts only
- Photos only

**Services Used:**
- `messageService.getMessages()`
- `messageService.getMessagesPaginated()` (infinite scroll)
- `messageService.subscribeToMessages()` (realtime)

### Feature 7: Photo Attachments

**Flow:**
1. User taps photo icon in message composer
2. `expo-image-picker` opens
3. User selects photo
4. Photo is compressed/resized
5. `photoService.uploadPhoto()` uploads to Supabase Storage
6. Returns public URL
7. URL is attached to message
8. Recipient sees photo in message card

**Services Used:**
- `photoService.uploadPhoto()`
- `photoService.deletePhoto()`
- Supabase Storage bucket: `checkin-photos`

---

## UI/UX Design System

### Design Principles

1. **Dark Theme First** - Comfortable for late-night usage
2. **Large Touch Targets** - Accessible for parents
3. **Emoji-Rich** - Emotional expression without words
4. **Minimal Text Input** - Quick interactions
5. **Clear Hierarchy** - Important info stands out
6. **Warm Colors** - Purple primary, soft gradients

### Color Palette

**Primary**: Purple (#A855F7) - Warmth, connection
**Backgrounds**: Dark grays (#0F0F0F → #2a2a2a)
**Accents**: Pink (#EC4899), Cyan (#06B6D4)
**Status**: Green (success), Yellow (warning), Red (danger)

### Typography Scale

- **Headings**: 24-36px, Bold
- **Body**: 16px, Regular
- **Labels**: 14px, Semibold
- **Captions**: 12px, Regular

### Component Patterns

**Cards**: Rounded (12px), subtle shadow, dark background
**Buttons**: Full width or auto, rounded (12px), primary color
**Inputs**: Dark background, subtle border, focus state
**Avatars**: Circular, initials fallback, size variants
**Badges**: Pill shape, color-coded by type

---

## User Flows

### Complete User Journey Map

#### Journey 1: Student Onboarding

```
1. Download app
2. OnboardingScreen → "I'm a Student"
3. SignupScreen → Email + Password
4. ProfileSetupScreen:
   - Enter name
   - Select college
   - Upload photo (optional)
   - System generates code: "ABC123"
   - "Share this code with your parent"
5. HomeScreen (waiting state):
   - "Waiting for parent to connect..."
   - Can still explore app
6. Parent connects → Notification
7. Approve connection
8. HomeScreen (connected state):
   - Streak appears
   - Prompts available
   - Can send check-ins
```

#### Journey 2: Parent Onboarding

```
1. Download app
2. OnboardingScreen → "I'm a Parent"
3. SignupScreen → Email + Password
4. ProfileSetupScreen:
   - Enter name
   - Upload photo (optional)
   - "Enter your student's family code"
   - Input: "ABC123"
   - System finds student: "Connect with Sarah?"
5. Confirm → Connection created
6. HomeScreen (connected state):
   - See student's profile
   - Awaiting first check-in
```

#### Journey 3: Daily Check-In (Happy Path)

```
Student:
1. Opens app → HomeScreen
2. Taps "Send Quick Check-In"
3. Modal opens
4. Selects emoji: 😊
5. Types: "Great day at the library!"
6. Taps photo icon → Selects selfie
7. Preview looks good
8. Taps "Send"
9. Success animation
10. Modal closes
11. Streak updates: 🔥 8 days

Parent:
1. Receives push notification: "Sarah sent a check-in"
2. Opens app → HomeScreen
3. Sees check-in card with photo
4. Taps "Reply"
5. Types: "Love seeing you happy! 💜"
6. Sends
7. Streak updates: 🔥 8 days
```

#### Journey 4: Guided Prompt (Turn-Based)

```
Day 1 - Student's Turn:
1. Notification: "New prompt: What's bringing you joy?"
2. Opens app → HomeScreen
3. Sees prompt card: "Your turn to answer!"
4. Taps "Answer"
5. Types response
6. Submits
7. System: "Waiting for Mom to answer..."

Day 3 - Parent's Turn (48 hours later):
1. Notification: "Your turn to answer!"
2. Opens app → Reads student's response
3. Types own answer
4. Submits
5. System advances to next prompt
6. Now Student's turn for Prompt #2
```

---

## Development Roadmap

### Phase 1: Foundation (Week 1)

**Backend:**
- [ ] Apply database schema to Supabase
- [ ] Set up storage bucket + policies
- [ ] Test Supabase connection

**Shared Package:**
- [ ] Set up types (user.ts, message.ts)
- [ ] Implement userProfileService
- [ ] Implement familyConnectionService
- [ ] Implement messageService
- [ ] Build React Query hooks (useFamily, useMessages)
- [ ] Set up AuthContext

**Mobile:**
- [ ] Initialize Expo project
- [ ] Set up navigation structure
- [ ] Build theme system (colors, spacing, typography)
- [ ] Create reusable components (Button, Input, Card, Avatar)

### Phase 2: Authentication & Pairing (Week 2)

**Mobile Screens:**
- [ ] OnboardingScreen (user type selection)
- [ ] SignupScreen (with user type)
- [ ] LoginScreen
- [ ] ProfileSetupScreen (student vs parent flows)
- [ ] Family code generation UI
- [ ] Family code entry UI

**Features:**
- [ ] Email/password auth with Supabase
- [ ] Profile creation
- [ ] Family code pairing
- [ ] Connection confirmation

### Phase 3: Core Messaging (Week 3)

**Mobile Screens:**
- [ ] HomeScreen (student variant)
- [ ] HomeScreen (parent variant)
- [ ] SendMessageScreen (check-in modal)
- [ ] InboxScreen (timeline)
- [ ] Message cards (various types)

**Features:**
- [ ] Send daily check-in
- [ ] Photo attachment
- [ ] Reply to messages
- [ ] Real-time message updates
- [ ] Streak initialization

### Phase 4: Prompts & Streaks (Week 4)

**Mobile Screens:**
- [ ] SendQuestionScreen (prompt modal)
- [ ] Prompt card on HomeScreen
- [ ] Streak display component

**Features:**
- [ ] Guided prompt system (10 prompts)
- [ ] Turn-based rotation
- [ ] 48-hour cooldown
- [ ] Streak tracking logic
- [ ] Streak milestones

**Services:**
- [ ] promptService implementation
- [ ] streakService implementation

### Phase 5: Polish & Testing (Week 5)

**UX Improvements:**
- [ ] Animations (confetti, transitions)
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Pull-to-refresh
- [ ] Infinite scroll

**Testing:**
- [ ] Test all user flows
- [ ] Test with real parent-student pair
- [ ] Fix bugs
- [ ] Optimize performance
- [ ] Test on iOS and Android

### Phase 6: Launch Prep (Week 6)

**Deployment:**
- [ ] Set up CI/CD
- [ ] Configure app store metadata
- [ ] Create app icons
- [ ] Create splash screens
- [ ] Submit to Apple App Store (TestFlight)
- [ ] Submit to Google Play (Beta)

**Documentation:**
- [ ] User guide
- [ ] FAQ
- [ ] Privacy policy
- [ ] Terms of service

---

## Deployment

### Supabase Production Setup

1. **Create Production Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down URL and anon key

2. **Apply Schema**
   - Run `mvp_schema.sql` in SQL Editor
   - Create storage bucket `checkin-photos`
   - Apply storage policies

3. **Enable Auth Providers**
   - Configure email auth
   - Optional: Google OAuth
   - Set up email templates

4. **Configure Storage**
   - Set file size limits
   - Configure MIME types
   - Set up CDN (if needed)

### Mobile App Deployment

#### iOS (Apple App Store)

1. **Requirements**
   - Apple Developer Account ($99/year)
   - Mac with Xcode
   - Valid provisioning profiles

2. **Build Process**
   ```bash
   cd packages/mobile
   npx expo prebuild
   eas build --platform ios
   ```

3. **TestFlight**
   - Upload build to App Store Connect
   - Add beta testers
   - Get feedback

4. **App Store**
   - Fill out metadata
   - Upload screenshots
   - Submit for review

#### Android (Google Play)

1. **Requirements**
   - Google Play Developer Account ($25 one-time)
   - Keystore file for signing

2. **Build Process**
   ```bash
   cd packages/mobile
   npx expo prebuild
   eas build --platform android
   ```

3. **Internal Testing**
   - Upload AAB to Play Console
   - Create internal testing track
   - Share with testers

4. **Production**
   - Fill out store listing
   - Upload screenshots
   - Submit for review

### Web App Deployment

#### Vercel (Recommended)

1. **Connect Repository**
   - Link GitHub repo
   - Configure build settings:
     - Framework: Vite
     - Root Directory: packages/web
     - Build Command: `npm run build`
     - Output Directory: `dist`

2. **Environment Variables**
   - Add Supabase URL
   - Add Supabase Anon Key

3. **Deploy**
   - Push to main branch
   - Auto-deploys on every commit

#### Netlify (Alternative)

Similar process to Vercel with build settings adjusted.

### Monitoring & Analytics

**Recommended Tools:**
- **Error Tracking**: Sentry
- **Analytics**: PostHog (open-source)
- **Performance**: Supabase built-in analytics
- **User Feedback**: In-app feedback form

---

## Environment Variables

### Required Variables

```bash
# packages/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# packages/web/.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Security Notes

- **Never commit** `.env` files to Git
- Use `.env.example` as template
- Rotate keys if exposed
- Use different keys for dev/prod

---

## Testing Strategy

### Unit Tests

```typescript
// Example: streakService.test.ts
import { daysBetween, getStreakMilestones } from './streakService';

describe('streakService', () => {
  test('daysBetween calculates correctly', () => {
    const date1 = new Date('2025-01-01');
    const date2 = new Date('2025-01-08');
    expect(daysBetween(date1, date2)).toBe(7);
  });

  test('getStreakMilestones returns correct milestones', () => {
    expect(getStreakMilestones(15)).toEqual([7, 14]);
    expect(getStreakMilestones(100)).toEqual([7, 14, 30, 50, 100]);
  });
});
```

### Integration Tests

Test complete user flows:
- Signup → Profile Setup → Connection
- Send Check-In → Receive Notification → Reply
- Answer Prompt → Partner Answers → Next Prompt

### E2E Tests (Detox for React Native)

```typescript
// Example: onboarding.e2e.ts
describe('Onboarding Flow', () => {
  it('should complete student signup', async () => {
    await element(by.id('student-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('signup-button')).tap();
    await expect(element(by.id('profile-setup-screen'))).toBeVisible();
  });
});
```

---

## Performance Optimization

### Mobile Performance

1. **Image Optimization**
   - Compress photos before upload
   - Use `expo-image` for efficient rendering
   - Lazy load images in timeline

2. **List Optimization**
   - Use `FlatList` with `getItemLayout`
   - Implement `windowSize` for better memory
   - Add `removeClippedSubviews`

3. **Bundle Size**
   - Enable Hermes engine
   - Code splitting where possible
   - Remove unused dependencies

4. **Network**
   - Implement retry logic
   - Cache responses with React Query
   - Use optimistic updates

### Database Performance

1. **Indexes**
   - Already indexed: `family_connection_id`, `sender_id`, `created_at`
   - Monitor slow queries

2. **RLS Optimization**
   - Policies use indexes
   - Avoid complex subqueries in policies

3. **Caching**
   - React Query caches for 5-10 minutes
   - Implement background refetch

---

## Security Considerations

### Authentication

- **Password Requirements**: Min 8 characters
- **Email Verification**: Enabled in Supabase
- **Session Management**: Automatic with Supabase Auth
- **Token Refresh**: Handled by `@supabase/supabase-js`

### Data Access

- **RLS Policies**: All tables protected
- **API Keys**: Anon key is safe for client use
- **Private Data**: Only service role key accesses bypass RLS
- **Family Isolation**: Users only see own family data

### Photo Storage

- **Public Bucket**: URLs are publicly accessible
- **Upload Auth**: Must be authenticated
- **File Size**: Limited to 2MB
- **MIME Types**: Only images allowed
- **Deletion**: Users can only delete own photos

### Client-Side

- **Input Validation**: Validate on client AND server
- **XSS Prevention**: React escapes by default
- **Sensitive Data**: No tokens in localStorage (use Supabase client)

---

## Troubleshooting Guide

### Common Issues

#### Issue: "Cannot find module 'metro-runtime'"

**Solution:**
```bash
npm install metro-runtime --legacy-peer-deps
```

#### Issue: TypeScript errors for navigation

**Solution:**
Use `CompositeScreenProps` for tab screens:
```typescript
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;
```

#### Issue: Images not loading from Supabase Storage

**Solution:**
1. Check bucket is public
2. Verify storage policies are applied
3. Confirm URL format: `https://[project].supabase.co/storage/v1/object/public/checkin-photos/...`

#### Issue: Streak not updating

**Solution:**
1. Check `last_interaction_date` is being set
2. Verify both users interacted within 24 hours
3. Check `updateStreak()` is called after message send

---

## Future Features (Post-MVP)

### Premium Features

1. **Care Package Tracker**
   - Parent logs sent packages
   - Tracking integration
   - Student unboxing photos

2. **Weekly Insights Report**
   - Summary of week's interactions
   - Sentiment analysis
   - Engagement trends

3. **Custom Prompts**
   - Parents create own questions
   - Scheduled prompts
   - Recurring prompts

4. **Milestone Celebrations**
   - Student logs achievements
   - Academic, career, independence
   - Parent sends congratulations + optional gift

5. **Voice Notes**
   - Record voice messages
   - Play inline
   - Transcript generation

6. **Multi-Parent Support**
   - Both mom and dad connect
   - Group message thread
   - Individual threads still available

### Technical Enhancements

1. **Push Notifications**
   - Firebase Cloud Messaging
   - Notification preferences
   - Rich notifications with images

2. **Offline Support**
   - Cache messages locally
   - Queue outgoing messages
   - Sync when online

3. **Search**
   - Full-text search in messages
   - Filter by date range
   - Save favorite messages

4. **Analytics Dashboard**
   - Admin view
   - User engagement metrics
   - Retention cohorts

---

## Success Metrics

### Key Performance Indicators (KPIs)

**Engagement:**
- Daily Active Users (DAU): Target 40%
- Messages per week: Target 5-7
- Streak retention: Target 60% at 7+ days

**Retention:**
- 7-day retention: Target 70%
- 30-day retention: Target 55%
- 4-month retention: Target 40%

**Monetization:**
- Premium conversion: Target 30%
- Average LTV: Target $60/year
- Churn rate: Target <10%/month

**Quality:**
- Crash-free rate: Target >99.5%
- Average session duration: Target 3-5 minutes
- Time to first check-in: Target <24 hours

---

## Support & Maintenance

### User Support

**Channels:**
- In-app feedback form
- Email: support@tetheredapp.com
- FAQ/Help Center
- Twitter/X: @TetheredApp

**Response Times:**
- Critical bugs: < 4 hours
- General inquiries: < 24 hours
- Feature requests: Logged for review

### Regular Maintenance

**Weekly:**
- Monitor error logs (Sentry)
- Review user feedback
- Check performance metrics

**Monthly:**
- Database optimization
- Dependency updates
- Security patches

**Quarterly:**
- Feature releases
- Marketing campaigns
- User surveys

---

## Changelog

### Version 1.0.0 (MVP Launch)

**Features:**
- User authentication (email/password)
- Student/parent role selection
- Family code pairing system
- Daily check-ins with photos
- Guided prompts (10 questions)
- Turn-based prompt rotation
- Streak tracking
- Message timeline
- Real-time updates
- Profile management

**Platforms:**
- iOS (TestFlight)
- Android (Beta)
- Web (Progressive Web App)

---

## Resources & References

### Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Expo Docs**: https://docs.expo.dev
- **React Navigation**: https://reactnavigation.org
- **React Query**: https://tanstack.com/query

### Design Resources

- **Figma Design System**: [Link to Figma]
- **Icon Library**: @expo/vector-icons
- **Font**: Inter (system font)

### Community

- **Discord**: [Link to Discord]
- **GitHub**: [Link to repo]
- **Twitter**: @TetheredApp

---

## License

**Proprietary** - All rights reserved

---

## Contact

**Developer**: Ibrahim
**Email**: dev@tetheredapp.com
**Project**: Tethered - College Student + Parent Connection App

---

**End of Blueprint** 🎓

This document contains everything needed to rebuild the Tethered application from scratch. Follow the roadmap, implement features systematically, and refer to the detailed specifications for each component.
