// Tethered App - Generate Daily Prompt Edge Function
// This function generates a daily prompt using Google's Gemini AI
// and stores it in the database

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

serve(async (req) => {
  try {
    // Check authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Check if prompt already exists for today
    const { data: existingPrompt, error: checkError } = await supabase
      .from('daily_prompts')
      .select('*')
      .eq('date', today)
      .single();

    if (existingPrompt) {
      return new Response(
        JSON.stringify({
          prompt: existingPrompt,
          message: 'Prompt already exists for today'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate new prompt using Gemini AI
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a thoughtful, engaging daily prompt for a family connection app called Tethered.

The prompt should:
1. Encourage authentic self-expression and connection between students and parents
2. Be suitable for both college students and their parents
3. Be open-ended but not too broad
4. Promote meaningful reflection or sharing
5. Be 1-2 sentences maximum
6. Not require extensive writing (should be answerable with a photo, short text, or both)

Examples of good prompts:
- "What's one small thing that made you smile today?"
- "Share a moment from your day that felt like 'you'."
- "What's a challenge you're facing and how are you handling it?"
- "What are you grateful for right now?"

Generate ONE prompt only, no explanation or extra text. Just the prompt itself.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error('Failed to generate prompt from Gemini');
    }

    const geminiData: GeminiResponse = await geminiResponse.json();
    const promptText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!promptText) {
      throw new Error('No prompt generated');
    }

    // Insert prompt into database
    const { data: newPrompt, error: insertError } = await supabase
      .from('daily_prompts')
      .insert({
        text: promptText,
        date: today,
        generated_by: 'gemini',
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        prompt: newPrompt,
        message: 'New prompt generated successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating daily prompt:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
