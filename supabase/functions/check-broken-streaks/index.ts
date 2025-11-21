// Tethered App - Check Broken Streaks Edge Function
// This function checks for broken streaks (48+ hours since last check-in)
// and resets them. Should be called via cron job (hourly)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CRON_SECRET = Deno.env.get('CRON_SECRET'); // Secret to authorize cron calls

serve(async (req) => {
  try {
    // Verify cron secret for security
    const cronSecret = req.headers.get('X-Cron-Secret');
    if (CRON_SECRET && cronSecret !== CRON_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Call the database function to check and reset broken streaks
    const { data, error } = await supabase.rpc('check_and_reset_broken_streaks');

    if (error) {
      throw error;
    }

    // Create streak reminder notifications for users at risk (36-48 hours)
    const { data: atRiskUsers, error: riskError } = await supabase
      .from('user_streaks')
      .select('user_id, streak_days, last_check_in')
      .gt('streak_days', 0)
      .not('last_check_in', 'is', null);

    if (!riskError && atRiskUsers) {
      const now = new Date();
      const reminderPromises = atRiskUsers
        .filter((user) => {
          const lastCheckIn = new Date(user.last_check_in);
          const hoursSince = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
          return hoursSince >= 36 && hoursSince < 48;
        })
        .map((user) =>
          supabase.from('notification_queue').insert({
            user_id: user.user_id,
            type: 'streak_reminder',
            title: 'Don\'t break your streak!',
            body: `You have ${user.streak_days} days! Check in soon to keep it alive. 🔥`,
            data: { streak_days: user.streak_days },
          })
        );

      await Promise.all(reminderPromises);
    }

    const resetCount = data?.length || 0;
    const remindersCount = atRiskUsers?.length || 0;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Checked broken streaks successfully`,
        stats: {
          streaks_reset: resetCount,
          reminders_sent: remindersCount,
          timestamp: new Date().toISOString(),
        },
        reset_users: data,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking broken streaks:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
