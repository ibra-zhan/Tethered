# Tethered App - Production Deployment Plan

## Overview
This document outlines the complete roadmap to transform the current prototype into a production-ready mobile application, ready for App Store and Google Play deployment.

---

## Phase 1: Backend Infrastructure & Database Setup ✅ COMPLETED

### 1.1 Supabase Database Schema
- [x] **User Profiles Table**
  - Implement user_profiles table with fields: id, name, role (student/parent), avatar_url, created_at
  - Set up Row Level Security (RLS) policies
  - Create indexes for performance

- [x] **Family Connections Table**
  - Create family_connections table linking students and parents
  - Add status field (pending, accepted, rejected)
  - Implement RLS policies for privacy

- [x] **Posts Table**
  - Design posts table: id, user_id, type, image_url, mood, text, timestamp, prompt_id
  - Add foreign key constraints
  - Set up RLS policies (only family members can view)

- [x] **Prompts Table**
  - Create daily_prompts table: id, text, date, generated_by
  - Add unique constraint on date
  - Implement caching mechanism

- [x] **Streaks Table**
  - Design user_streaks table: user_id, streak_days, level, last_check_in
  - Add logic to reset streaks after 48h of inactivity

- [x] **Additional Tables**
  - Created notification_queue table for push notifications
  - Created push_tokens table for device tokens

### 1.2 Supabase Storage
- [x] **Set up Storage Buckets**
  - Create 'avatars' bucket for profile pictures
  - Create 'posts' bucket for check-in photos
  - Configure size limits (max 5MB per image)
  - Set up RLS policies for uploads

- [ ] **Image Optimization** (TODO: Phase 3)
  - Implement automatic image compression on upload
  - Generate thumbnails for faster loading
  - Set up CDN caching

### 1.3 Database Functions & Triggers
- [x] **Streak Management**
  - Created calculate_streak_level() function (4 levels: Candle, Steady, Bonfire, Eternal)
  - Created update_streak_after_checkin() function
  - Created check_and_reset_broken_streaks() function for cron job
  - Created get_user_streak_stats() function
  - Implemented level calculation logic
  - Added auto-update streak trigger on post creation
  - Added milestone notification trigger

- [x] **Notifications Queue**
  - Created notification_queue table
  - Set up triggers for streak milestones
  - Prepared infrastructure for batch notification processing

- [x] **Edge Functions Created**
  - generate-daily-prompt: Gemini AI integration for daily prompts
  - check-broken-streaks: Hourly cron job to reset expired streaks

**Phase 1 Summary:** Complete backend infrastructure with 7 tables, 25+ RLS policies, 8+ database functions, 5 triggers, and 2 Edge Functions. All migrations tested and working. Storage buckets configured. Ready for Phase 2 integration.

---

## Phase 2: Authentication & User Management ✅ COMPLETED

### 2.1 Replace Mock Authentication
- [x] **Email/Password Authentication**
  - Replaced AppContext mock with real Supabase auth
  - Integrated signup/login/logout with Supabase
  - Added error handling for auth operations
  - Updated SignupScreen, LoginScreen, ProfileSetupScreen with async handlers

- [ ] **Email Verification** (TODO: Phase 3)
  - Add email confirmation flow
  - Implement password reset functionality
  - Add resend verification email option

- [ ] **Social Authentication (Optional)** (Future Enhancement)
  - Add Google Sign-In
  - Add Apple Sign-In (required for iOS)
  - Implement social profile picture import

### 2.2 Profile Management
- [x] **Profile Setup Flow**
  - Updated ProfileSetupScreen to save to Supabase user_profiles table
  - Integrated profile creation with signup flow
  - Added error handling for profile updates
  - Auto-creates user_streaks via database trigger

- [ ] **Avatar Upload** (TODO: Phase 3)
  - Implement image picker for avatar
  - Upload to Supabase Storage 'avatars' bucket
  - Integrate with profile setup and editing

- [ ] **Profile Editing** (TODO: Phase 3)
  - Create profile editing screen
  - Allow name and avatar updates
  - Add validation and error handling

- [ ] **Family Connections** (See detailed plan in Phase 3.5)
  - Comprehensive family connection system
  - Invite code generation and QR code scanning
  - Connection request management
  - Real-time connection updates

**Phase 2 Summary:** Successfully integrated Supabase authentication with the mobile app. Created Supabase client configuration, replaced mock AppContext with real database operations, updated all auth screens to handle async operations. Users can now signup, login, and create profiles with real backend persistence. Session management and auth state changes are handled automatically.

**Phase 3 Progress Summary:** Successfully implemented core features including real Supabase Storage photo uploads with progress tracking, real-time timeline updates via Supabase subscriptions, and updated streak system to 3-tier flame levels. Check-in system is fully functional with image upload, mood selection, and text input. Timeline features pull-to-refresh and automatically updates when family members post. Remaining: reactions/comments system and family connection features.

---

## Phase 3: Core Features Implementation ✅ PARTIALLY COMPLETED

### 3.1 Check-In System ✅ COMPLETED
- [x] **Photo Capture & Upload**
  - Integrated expo-image-picker with Supabase storage
  - Implemented image upload with real-time progress tracking
  - Added upload progress bar (0-100%)
  - Implemented error handling with user-friendly alerts
  - Created `imageUpload.ts` utility for Supabase Storage integration
  - Installed dependencies: expo-file-system, base64-arraybuffer

- [x] **Mood & Text Input**
  - Save mood and text to database
  - Validate input before submission
  - UI already implemented with mood selector grid

- [x] **Prompt Answering**
  - Link posts to daily prompts
  - Track which users answered which prompts
  - Update UI based on completion status

### 3.2 Streak System ✅ COMPLETED
- [x] **Streak Calculation**
  - Real-time streak calculation via database triggers
  - Updated to 3-tier flame system:
    - Level 1: Starting Out (1-9 days)
    - Level 2: Steady Flame (10-29 days)
    - Level 3: Eternal Light (30+ days)
  - Database function `calculate_streak_level()` updated
  - Auto-updates via `update_streak_after_checkin()` trigger
  - Flame component displays correct video based on streak days

- [ ] **Streak Recovery** (Future Enhancement)
  - Allow users to "save" a broken streak once per month
  - Implement in-app purchase for streak insurance (optional)

### 3.3 Timeline & Feed ✅ PARTIALLY COMPLETED
- [x] **Real-time Updates**
  - Implemented Supabase real-time subscriptions in AppContext
  - Timeline auto-updates when new posts are added
  - Added pull-to-refresh functionality with RefreshControl
  - Posts grouped by date with clean UI

- [ ] **Infinite Scroll/Pagination** (TODO)
  - Implement cursor-based pagination for large post lists

- [ ] **Reactions & Comments** (TODO: Later in Phase 3)
  - Add "Love it" reaction system
  - Implement comment/reply functionality
  - Send notifications for interactions

### 3.4 Daily Prompts
- [ ] **Gemini AI Integration**
  - Move API calls to backend (Edge Function)
  - Implement prompt caching (one prompt per day)
  - Add fallback prompts if API fails
  - Allow manual prompt refresh (limit: 3 per day)

- [ ] **Prompt History**
  - Store all generated prompts
  - Allow viewing past prompts
  - Implement prompt categories/themes

### 3.5 Family Connection System 🔗 ✅ COMPLETED

This is a **critical feature** that allows students and parents to connect and share content.

**Implementation Status:** Core functionality complete with invite code system. Connections auto-accept when valid code is entered (simplified flow). QR code feature deferred to future enhancement.

#### 3.5.1 Connection Flow Overview
**For Students:**
1. Navigate to "Add Family Member" from Profile/Settings
2. Generate a unique invite code or QR code
3. Share code with parent via text/messaging app
4. Receive notification when parent accepts
5. Start seeing parent's posts in timeline

**For Parents:**
1. Navigate to "Connect with Student" from Profile/Settings
2. Enter student's invite code OR scan QR code
3. Send connection request
4. Wait for student to accept (or auto-accept if code is valid)
5. Start seeing student's posts in timeline

#### 3.5.2 UI Screens & Components

**Screen 1: Family Connections Screen** (`FamilyConnectionsScreen.tsx`)
- [x] **Header Section** ✅
  - Title: "My Family"
  - Subtitle: "People you're connected with"
  - Back button navigation

- [x] **Connected Family Members List** ✅
  - Display cards for each connected family member:
    - Flame animation showing streak level
    - Name
    - Role badge (Student/Parent with color coding)
    - Connection date
    - Streak indicator (days + flame animation)
  - Disconnect button with confirmation dialog

- [x] **Empty State** ✅
  - Family emoji illustration (👨‍👩‍👧‍👦)
  - "No family members yet"
  - "Get Started" CTA button
  - Descriptive subtitle

- [x] **Action Buttons** ✅
  - "Share My Code" button (orange, primary)
  - "Enter Code" button (outlined, secondary)

**Note:** Pending requests section removed - using auto-accept flow when valid code is entered for simplified UX.

**Screen 2: Add Family Member Screen** (`AddFamilyMemberScreen.tsx`)
- [x] **Invite Code Generation** ✅
  - Automatically generates 6-character code on screen load
  - Large, prominent display in bordered card
  - Code shown in large font with letter spacing
  - Expiration date displayed (7 days from now)
  - Loading state while generating

- [x] **Sharing Options** ✅
  - "Copy Code" button with clipboard integration (📋)
  - "Share Code" button using native share sheet (📤)
  - Pre-filled share message with code and expiration
  - Copy confirmation alert

- [x] **Instructions Section** ✅
  - Friendly emoji illustration (🔗)
  - "Share Your Code" title
  - Clear instructions for family member
  - Info box explaining code usage and expiration

- [x] **Navigation** ✅
  - Back button to return to Family Connections
  - "Done" button at bottom

**Note:** QR code feature deferred to future enhancement (Phase 4+)

**Screen 3: Join Family Screen** (`JoinFamilyScreen.tsx`)
- [x] **Enter Code Section** ✅
  - Title: "Enter Invite Code"
  - 6-character input field (uppercase, auto-formatting, max 6 chars)
  - Auto-verifies code when 6 characters entered
  - Real-time validation with visual feedback:
    - Verifying spinner (⏳)
    - Valid checkmark (✓ green)
    - Invalid error (✕ red with message)
  - Loading state during verification
  - Error messages: "Invalid code", "Code expired", "Code already used", "Cannot use your own code", "Invalid role pairing"

- [x] **Code Owner Preview** ✅
  - Shows when code is valid
  - Displays: "Connect with [Name]"
  - Shows role badge (Student/Parent)
  - Color-coded by role

- [x] **Connect Button** ✅
  - Disabled until valid code entered
  - Loading spinner during connection
  - Success alert with navigation
  - Error handling with user-friendly messages

- [x] **Instructions & Info** ✅
  - Friendly emoji (🔐)
  - Clear title and subtitle
  - Info box with trust/privacy message
  - Keyboard dismissal on submit

**Note:** QR code scanning deferred to future enhancement (Phase 4+)

**Screen 4: Connection Request Screen** - ❌ Not Implemented
- Simplified to auto-accept flow when valid code is entered
- Users are immediately connected after code verification
- Reduces friction and simplifies UX
- Can be added later if needed for additional control

**Component: QR Code Generator** - ⏸️ Deferred to Phase 4+
- Feature deferred - current implementation uses text codes only
- Can be added as enhancement with react-native-qrcode-svg

**Component: QR Code Scanner** - ⏸️ Deferred to Phase 4+
- Feature deferred - current implementation uses text codes only
- Can be added as enhancement with expo-barcode-scanner

#### 3.5.3 Backend Implementation

**Database Tables** (Already exist from Phase 1)
- `family_connections` table:
  - id, student_id, parent_id, status, created_at
  - status: 'pending', 'accepted', 'declined', 'blocked'

**New Database Functions Created** ✅

- [x] **`generate_invite_code(user_id UUID)`** ✅
  - Generates unique 6-character uppercase alphanumeric code using MD5 hash
  - Stores in invite_codes table with 7-day expiration
  - Returns the code
  - Retries up to 10 times if collision occurs
  - File: `20250121_family_connections.sql`

- [x] **`verify_invite_code(code TEXT, requesting_user_id UUID)`** ✅
  - Validates code exists, not expired, and not used
  - Checks user isn't using their own code
  - Validates role pairing (student ↔ parent)
  - Returns: is_valid, code_owner_id, code_owner_name, code_owner_role, error_message
  - Does NOT mark as used (done by create_connection_request)

- [x] **`create_connection_request(code TEXT, requesting_user_id UUID)`** ✅
  - Verifies code using verify_invite_code function
  - Creates accepted connection immediately (auto-accept flow)
  - Uses existing family_connections table (user_id, connected_user_id)
  - Checks for duplicate connections in both directions
  - Marks invite code as used
  - Returns: success, connection_id, error_message

- [ ] **`accept_connection_request()`** - ❌ Not needed (auto-accept flow)
- [ ] **`decline_connection_request()`** - ❌ Not needed (auto-accept flow)

- [x] **`get_family_members(user_id UUID)`** ✅
  - Returns all accepted connections for user
  - Works with existing table structure (user_id/connected_user_id)
  - Includes: connection_id, member_id, member_name, member_role, member_avatar_url, connected_at, member_streak_days
  - Joins with user_profiles and user_streaks
  - Orders by connection date (newest first)

- [x] **`disconnect_family_member(connection_id UUID, user_id UUID)`** ✅
  - Verifies user is part of the connection
  - Deletes connection (hard delete)
  - Returns: success, error_message
  - Authorization checked before deletion

**New Database Tables Created** ✅

- [x] **`invite_codes` Table** ✅
  - Created with all specified fields
  - Added CHECK constraint for 6-character code length
  - Indexes created for: code (where not used), user_id, expires_at
  - Table comments added for documentation
  - File: `20250121_family_connections.sql`

**RLS Policies Added** ✅

- [x] Users can view their own invite codes ✅
- [x] Users can create their own invite codes ✅
- [x] Functions use SECURITY DEFINER for controlled access ✅
- [x] Authenticated users can execute all connection functions ✅
- [x] Existing family_connections RLS policies already in place ✅

#### 3.5.4 AppContext Updates

**Implementation Note:** Functions are called directly from screens using `supabase.rpc()` rather than through AppContext. This provides better type safety and reduces context complexity. Future refactor could centralize if needed.

- [x] **Database Functions Called Directly** ✅
  - Screens use `supabase.rpc('generate_invite_code', {...})` pattern
  - Local state management within each screen
  - Error handling at component level

- [ ] **Real-time Connection Subscriptions** - ⏸️ Deferred
  - Can be added later for live updates
  - Currently users refresh by navigating back to screen
  - Not critical for MVP functionality

#### 3.5.5 Implementation Steps

**Step 1: Database Setup** ✅ COMPLETED
- [x] Created invite_codes table migration
- [x] Created 5 database functions (generate, verify, create_connection, get_members, disconnect)
- [x] Set up RLS policies for invite_codes
- [x] Leveraged existing family_connections table structure
- [x] Migration file ready: `supabase/migrations/20250121_family_connections.sql`

**Step 2: Core Screens** ✅ COMPLETED
- [x] Created FamilyConnectionsScreen with empty state, member list, and action buttons
- [x] Created AddFamilyMemberScreen with auto code generation and sharing
- [x] Created JoinFamilyScreen with real-time code validation
- [x] Added "Family Connections" menu item in ProfileScreen
- [x] Updated navigation types and RootNavigator

**Step 3: QR Code Feature** ⏸️ DEFERRED to Phase 4+
- [ ] Install react-native-qrcode-svg for QR generation
- [ ] Install expo-barcode-scanner for scanning
- [ ] Implement QRCodeDisplay component
- [ ] Implement QRCodeScanner component

**Step 4: Connection Flow** ✅ COMPLETED (Direct Implementation)
- [x] AddFamilyMemberScreen calls generate_invite_code directly
- [x] JoinFamilyScreen calls verify_invite_code and create_connection_request
- [x] Real-time code validation with visual feedback
- [x] Auto-accept flow (no pending requests)
- [x] Error handling with user-friendly messages

**Step 5: Connection Management** ✅ COMPLETED (Simplified)
- [x] Implemented disconnect_family_member in FamilyConnectionsScreen
- [x] Get family members with streak data on screen load
- [x] Confirmation dialog before disconnect
- [ ] ConnectionRequestScreen - Not needed (auto-accept flow)
- [ ] Pending requests badge - Not needed (auto-accept flow)

**Step 6: Real-time Updates** ⏸️ DEFERRED to Phase 4+
- [ ] Subscribe to family_connections table changes
- [ ] Show toast notification on new connection
- [ ] Auto-refresh family members list
- [ ] Handle edge cases (user deletes account, etc.)

**Step 7: Dependencies & Integration** ✅ COMPLETED
- [x] Installed expo-clipboard for code copying
- [x] Updated navigation types (RootStackParamList)
- [x] All screens properly typed and integrated

#### 3.5.6 User Experience Flow Diagram

```
[Student Opens App]
    |
    v
[Profile Tab] -> "Add Family Member" button
    |
    v
[AddFamilyMemberScreen]
    |
    ├─> "Generate Code" -> Display ABC123 -> Share via SMS/WhatsApp
    └─> "Show QR Code" -> Display QR -> Parent scans

[Parent Opens App]
    |
    v
[Profile Tab] -> "Connect with Student" button
    |
    v
[JoinFamilyScreen]
    |
    ├─> Enter Code: ABC123 -> Verify -> Send Request
    └─> Scan QR Code -> Auto-verify -> Send Request

[Student Receives Notification]
    |
    v
[ConnectionRequestScreen]
    |
    ├─> Accept -> Connection Established ✓
    └─> Decline -> Request Rejected ✗

[Both Users]
    |
    v
[FamilyConnectionsScreen]
    |
    └─> View Connected Family Members
    └─> See each other's posts in Timeline
```

#### 3.5.7 Security Considerations

- [ ] **Code Security**
  - Invite codes expire after 7 days
  - Codes can only be used once
  - Generate cryptographically random codes
  - Rate limit code generation (max 5 per hour)

- [ ] **Privacy**
  - Users must explicitly accept connections
  - Users can disconnect at any time
  - Disconnected users can't see new posts
  - Block feature to prevent reconnection

- [ ] **Validation**
  - Verify student-parent role matching (student connects with parent, not student-student)
  - Prevent duplicate connections
  - Validate invite codes server-side only

---

## Phase 4: Push Notifications

### 4.1 Setup
- [ ] **Configure Expo Push Notifications**
  - Set up Expo push notification service
  - Get FCM credentials (Android)
  - Get APNs credentials (iOS)
  - Store push tokens in database

### 4.2 Notification Types
- [ ] **Daily Prompt Reminder**
  - Send at user's preferred time (default 7 PM)
  - Include prompt text in notification
  - Make time customizable in settings

- [ ] **New Post Notification**
  - Notify family when someone posts
  - Include mood emoji and preview text
  - Deep link to the specific post

- [ ] **Connection Requests**
  - Notify when someone wants to connect
  - Include requester's name and role

- [ ] **Streak Reminders**
  - Warning at 10 PM if not checked in
  - Congratulations on milestones (7, 30, 100 days)

---

## Phase 5: UI/UX Polish

### 5.1 Loading States
- [ ] Add skeleton screens for all data fetching
- [ ] Implement optimistic UI updates
- [ ] Add loading indicators for all async operations
- [ ] Handle slow network gracefully

### 5.2 Error Handling
- [ ] Create user-friendly error messages
- [ ] Implement offline mode with local caching
- [ ] Add retry mechanisms for failed operations
- [ ] Show helpful troubleshooting tips

### 5.3 Empty States
- [ ] Design empty state for timeline (no posts yet)
- [ ] Empty state for connections (no family members)
- [ ] First-time user onboarding tooltips
- [ ] Celebratory animations for milestones

### 5.4 Accessibility
- [ ] Add proper labels for screen readers
- [ ] Ensure sufficient color contrast
- [ ] Support dynamic text sizing
- [ ] Test with VoiceOver/TalkBack

---

## Phase 6: Additional Screens & Features

### 6.1 Settings Screen
- [ ] **Account Settings**
  - Edit profile (name, avatar)
  - Change email/password
  - Delete account option

- [ ] **Notification Settings**
  - Toggle push notifications on/off
  - Set daily reminder time
  - Choose notification types

- [ ] **Privacy Settings**
  - Who can see posts (family only, specific members)
  - Block/unblock users
  - Data export option

### 6.2 Profile Screen
- [ ] Display user stats (streak, total posts, level)
- [ ] Show post history
- [ ] Add achievements/badges
- [ ] Family members list

### 6.3 Onboarding Tutorial
- [ ] Interactive walkthrough for new users
- [ ] Explain streak system
- [ ] Show how to add family members
- [ ] Demonstrate check-in flow

---

## Phase 7: Performance Optimization

### 7.1 App Performance
- [ ] Implement image lazy loading
- [ ] Use React.memo for expensive components
- [ ] Optimize list rendering with FlatList
- [ ] Reduce bundle size (code splitting)

### 7.2 Network Optimization
- [ ] Implement request caching
- [ ] Batch multiple requests where possible
- [ ] Use compression for API responses
- [ ] Implement offline queue for uploads

### 7.3 Database Optimization
- [ ] Add database indexes for common queries
- [ ] Implement cursor-based pagination
- [ ] Cache frequently accessed data
- [ ] Optimize RLS policies for performance

---

## Phase 8: Testing

### 8.1 Unit Tests
- [ ] Test utility functions (date calculations, streak logic)
- [ ] Test custom hooks
- [ ] Test context providers
- [ ] Aim for 70%+ coverage

### 8.2 Integration Tests
- [ ] Test authentication flow
- [ ] Test post creation flow
- [ ] Test family connection flow
- [ ] Test notification delivery

### 8.3 E2E Tests
- [ ] Complete user journey (signup → profile → check-in → view timeline)
- [ ] Test on both iOS and Android
- [ ] Test offline scenarios
- [ ] Test edge cases (network errors, API failures)

### 8.4 Beta Testing
- [ ] Recruit 10-20 beta testers (real families)
- [ ] Use TestFlight (iOS) and Internal Testing (Android)
- [ ] Collect feedback via in-app survey
- [ ] Fix critical bugs and iterate

---

## Phase 9: Security & Privacy

### 9.1 Security Audit
- [ ] Review all RLS policies
- [ ] Ensure no sensitive data in client code
- [ ] Implement rate limiting on API endpoints
- [ ] Add CAPTCHA for signup (prevent bots)

### 9.2 Data Privacy
- [ ] Write Privacy Policy
- [ ] Write Terms of Service
- [ ] Implement GDPR compliance (data export/deletion)
- [ ] Add consent forms where required

### 9.3 Content Moderation
- [ ] Implement image content filtering (optional)
- [ ] Add report/flag system
- [ ] Create moderation dashboard (admin only)

---

## Phase 10: Analytics & Monitoring

### 10.1 Analytics Setup
- [ ] Integrate analytics (Firebase Analytics or Amplitude)
- [ ] Track key events:
  - User signup/login
  - Post creation
  - Daily prompt answered
  - Streak milestones
  - App crashes

### 10.2 Error Monitoring
- [ ] Set up Sentry or Bugsnag
- [ ] Monitor crash reports
- [ ] Set up alerts for critical errors
- [ ] Track API error rates

### 10.3 Performance Monitoring
- [ ] Track app launch time
- [ ] Monitor screen load times
- [ ] Track image upload success rate
- [ ] Monitor API response times

---

## Phase 11: Deployment Preparation

### 11.1 Environment Configuration
- [ ] Set up production Supabase project
- [ ] Configure environment variables (.env.production)
- [ ] Set up separate staging environment
- [ ] Implement feature flags for gradual rollout

### 11.2 Build Configuration
- [ ] Configure app.json/app.config.js properly
- [ ] Set correct bundle identifiers
  - iOS: com.tethered.app
  - Android: com.tethered.app
- [ ] Add proper app icons (all sizes)
- [ ] Add splash screen
- [ ] Configure OTA updates (Expo)

### 11.3 App Store Assets
- [ ] **iOS App Store**
  - App icon (1024x1024)
  - Screenshots (6.5", 6.7", 5.5" displays)
  - App preview video (optional)
  - App description (150 char subtitle, 4000 char description)
  - Keywords for search
  - Support URL
  - Marketing URL

- [ ] **Google Play Store**
  - App icon (512x512)
  - Feature graphic (1024x500)
  - Screenshots (phone, tablet if supported)
  - Promo video (YouTube, optional)
  - Short description (80 chars)
  - Full description (4000 chars)
  - Privacy policy URL

### 11.4 Legal & Compliance
- [ ] Finalize Privacy Policy
- [ ] Finalize Terms of Service
- [ ] Add age rating justification
- [ ] Prepare COPPA compliance if targeting <13

---

## Phase 12: Production Build & Submission

### 12.1 iOS Submission
- [ ] **Apple Developer Account**
  - Enroll in Apple Developer Program ($99/year)
  - Create App ID
  - Generate provisioning profiles

- [ ] **App Store Connect**
  - Create app listing
  - Upload screenshots and metadata
  - Set pricing (free)
  - Choose availability regions

- [ ] **Build & Submit**
  - Run `eas build --platform ios --profile production`
  - Upload to App Store Connect via EAS Submit
  - Submit for review
  - Respond to any rejection feedback

### 12.2 Android Submission
- [ ] **Google Play Console**
  - Create developer account ($25 one-time)
  - Create app listing
  - Upload screenshots and metadata
  - Set up content rating questionnaire

- [ ] **Build & Submit**
  - Run `eas build --platform android --profile production`
  - Upload AAB to Google Play Console
  - Submit for review (usually faster than iOS)

### 12.3 Post-Submission
- [ ] Monitor review status daily
- [ ] Prepare for common rejection reasons (privacy, functionality)
- [ ] Test production build thoroughly
- [ ] Prepare marketing materials for launch

---

## Phase 13: Launch & Post-Launch

### 13.1 Soft Launch
- [ ] Release to limited regions first (e.g., US only)
- [ ] Monitor analytics closely
- [ ] Watch for crash reports
- [ ] Collect initial user feedback

### 13.2 Marketing
- [ ] Create landing page (tetheredapp.com)
- [ ] Social media presence (Instagram, TikTok)
- [ ] Press kit for tech blogs
- [ ] Reach out to parenting/college blogs
- [ ] Consider paid user acquisition (optional)

### 13.3 Ongoing Maintenance
- [ ] **Weekly**
  - Monitor analytics
  - Check error logs
  - Respond to user reviews

- [ ] **Monthly**
  - Release bug fixes and improvements
  - Add new features based on feedback
  - Review and optimize performance

- [ ] **Quarterly**
  - Major feature releases
  - Update dependencies
  - Security audits

---

## Success Metrics

### Key Performance Indicators (KPIs)
- **User Acquisition**: 1,000 users in first month
- **Retention**: 40% week-1 retention, 20% week-4 retention
- **Engagement**: 60% daily active users among installed base
- **Streak Completion**: 70% of users maintain >7 day streak
- **Technical**: <2% crash rate, <3s average load time
- **Reviews**: 4.5+ star rating on both stores

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Backend Setup | 1 week | None |
| Phase 2: Authentication | 3 days | Phase 1 |
| Phase 3: Core Features | 2 weeks | Phases 1-2 |
| Phase 4: Push Notifications | 3 days | Phase 3 |
| Phase 5: UI/UX Polish | 1 week | Phase 3 |
| Phase 6: Additional Features | 1 week | Phases 3-5 |
| Phase 7: Performance | 3 days | Phases 3-6 |
| Phase 8: Testing | 1 week | Phases 1-7 |
| Phase 9: Security | 3 days | Phase 8 |
| Phase 10: Analytics | 2 days | Any time |
| Phase 11: Deployment Prep | 3 days | Phases 1-9 |
| Phase 12: Submission | 1 week (+ review time) | Phases 1-11 |
| Phase 13: Launch | Ongoing | Phase 12 |

**Total Development Time**: 6-8 weeks (full-time)
**Review Time**: 1-2 weeks (Apple), 1-3 days (Google)
**Target Launch**: 8-10 weeks from start

---

## Risk Mitigation

### High-Risk Areas
1. **App Store Rejection**
   - Mitigation: Follow guidelines strictly, test on TestFlight
2. **Performance Issues**
   - Mitigation: Load testing, optimize early
3. **User Adoption**
   - Mitigation: Clear value prop, easy onboarding
4. **Data Privacy Concerns**
   - Mitigation: Transparent policies, secure implementation

---

## Next Immediate Steps

1. ✅ Replace mock data with Supabase in AppContext
2. ✅ Implement real authentication flow
3. ✅ Set up database schema
4. ✅ Implement image upload for check-ins
5. ✅ Add push notifications setup

---

## Notes

- This plan assumes using Expo EAS Build for simplicity
- Supabase free tier should be sufficient for MVP (<50,000 MAU)
- Consider upgrading to Supabase Pro ($25/mo) before public launch
- Budget $150-200 for developer accounts (Apple + Google)
- Timeline is aggressive but achievable for experienced developers
- Adjust based on team size and available hours per week

---

**Last Updated**: November 18, 2025
**Status**: Planning Phase
**Next Milestone**: Complete Phase 1 - Backend Infrastructure
