# Tethered App - Supabase Backend Setup

This directory contains all the database migrations, Edge Functions, and configuration needed to set up the Tethered app backend with Supabase.

## Directory Structure

```
supabase/
├── migrations/
│   ├── 20250120_initial_schema.sql      # Database tables and RLS policies
│   ├── 20250120_storage_policies.sql    # Storage bucket policies
│   └── 20250120_streak_functions.sql    # Streak management functions
├── functions/
│   ├── generate-daily-prompt/           # Edge Function for daily prompts
│   ├── check-broken-streaks/            # Edge Function for streak checking
│   └── send-notifications/              # Edge Function for push notifications (TODO)
└── README.md                            # This file
```

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install the Supabase CLI
   ```bash
   npm install -g supabase
   ```
3. **Gemini API Key**: Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Setup Instructions

### Step 1: Initialize Supabase Project

1. Create a new project in the Supabase dashboard
2. Note your project URL and anon key

### Step 2: Link to Local Project

```bash
cd /Users/ibravibes/Documents/Tethered_official
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 3: Run Database Migrations

Apply all migrations in order:

```bash
# Apply initial schema
supabase db push

# Or manually run each migration in the SQL Editor:
# 1. migrations/20250120_initial_schema.sql
# 2. migrations/20250120_storage_policies.sql
# 3. migrations/20250120_streak_functions.sql
```

### Step 4: Create Storage Buckets

In the Supabase Dashboard, go to Storage and create two buckets:

1. **avatars**
   - Public: No
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

2. **posts**
   - Public: No
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

Then apply the storage policies from `migrations/20250120_storage_policies.sql`

### Step 5: Deploy Edge Functions

```bash
# Deploy generate-daily-prompt function
supabase functions deploy generate-daily-prompt

# Deploy check-broken-streaks function
supabase functions deploy check-broken-streaks
```

### Step 6: Set Environment Variables

Set the following secrets for your Edge Functions:

```bash
# Gemini API Key (for prompt generation)
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here

# Cron secret (for securing cron endpoints)
supabase secrets set CRON_SECRET=your_random_secret_here

# Expo push notification token (for sending notifications)
supabase secrets set EXPO_ACCESS_TOKEN=your_expo_token_here
```

### Step 7: Set Up Cron Jobs

In the Supabase Dashboard, go to Database > Cron Jobs and create:

1. **Daily Prompt Generation** (runs at 12:00 AM UTC daily)
   ```sql
   SELECT cron.schedule(
     'generate-daily-prompt',
     '0 0 * * *',
     $$
     SELECT net.http_post(
       url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-daily-prompt',
       headers := jsonb_build_object(
         'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
         'Content-Type', 'application/json'
       )
     )
     $$
   );
   ```

2. **Check Broken Streaks** (runs every hour)
   ```sql
   SELECT cron.schedule(
     'check-broken-streaks',
     '0 * * * *',
     $$
     SELECT net.http_post(
       url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-broken-streaks',
       headers := jsonb_build_object(
         'X-Cron-Secret', current_setting('app.settings.cron_secret'),
         'Content-Type', 'application/json'
       )
     )
     $$
   );
   ```

## Database Schema Overview

### Tables

1. **user_profiles** - User account information
2. **family_connections** - Links between students and parents
3. **posts** - User check-ins (photos, text, mood)
4. **daily_prompts** - AI-generated daily prompts
5. **user_streaks** - Streak tracking and levels
6. **notification_queue** - Push notifications to be sent
7. **push_tokens** - Device tokens for push notifications

### Key Functions

- `calculate_streak_level(streak_days)` - Determines flame level
- `update_streak_after_checkin(user_id)` - Updates streak after check-in
- `check_and_reset_broken_streaks()` - Resets expired streaks
- `get_user_streak_stats(user_id)` - Returns comprehensive streak info

## Edge Functions

### generate-daily-prompt

Generates a new daily prompt using Gemini AI and stores it in the database.

**Endpoint**: `POST /functions/v1/generate-daily-prompt`

**Authentication**: Requires `Authorization: Bearer {token}` header

**Response**:
```json
{
  "prompt": {
    "id": "uuid",
    "text": "What's one small thing that made you smile today?",
    "date": "2025-01-20",
    "generated_by": "gemini"
  },
  "message": "New prompt generated successfully"
}
```

### check-broken-streaks

Checks for users with broken streaks (48+ hours) and resets them.

**Endpoint**: `POST /functions/v1/check-broken-streaks`

**Authentication**: Requires `X-Cron-Secret` header

**Response**:
```json
{
  "success": true,
  "stats": {
    "streaks_reset": 5,
    "reminders_sent": 12,
    "timestamp": "2025-01-20T10:00:00Z"
  }
}
```

## Testing

### Test Database Functions

```sql
-- Test streak calculation
SELECT calculate_streak_level(5);  -- Should return 1
SELECT calculate_streak_level(15); -- Should return 2
SELECT calculate_streak_level(50); -- Should return 3
SELECT calculate_streak_level(120); -- Should return 4

-- Test streak update (replace with actual user_id)
SELECT * FROM update_streak_after_checkin('your-user-id');

-- Test getting streak stats
SELECT * FROM get_user_streak_stats('your-user-id');
```

### Test Edge Functions Locally

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Test in another terminal
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-daily-prompt' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

## Mobile App Integration

Update your `.env` file in `packages/mobile`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Security Considerations

1. **Row Level Security (RLS)** is enabled on all tables
2. **Storage policies** ensure users can only access their own and family members' files
3. **Service role key** should never be exposed to the client
4. **Cron secret** protects cron endpoints from unauthorized access

## Next Steps

After completing the backend setup:

1. ✅ Replace mock data in `AppContext` with real Supabase calls
2. ✅ Implement authentication flow (signup/login)
3. ✅ Add image upload functionality
4. ✅ Integrate real-time subscriptions for timeline
5. ✅ Set up push notifications

See `DEPLOYMENT_PLAN.md` in the root directory for the full roadmap.

## Troubleshooting

### Common Issues

1. **Migration fails**: Make sure you're running migrations in order and your Supabase project is properly linked

2. **Edge Function deploy fails**: Ensure you have the latest Supabase CLI version and are logged in

3. **RLS policies blocking queries**: Check that your user is authenticated and has the correct relationships in `family_connections`

4. **Storage upload fails**: Verify bucket exists and policies are applied correctly

### Getting Help

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create an issue in the project repo

## License

Private - Tethered App
