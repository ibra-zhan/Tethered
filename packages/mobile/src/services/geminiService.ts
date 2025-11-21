import { GoogleGenAI, Type } from '@google/genai';

// Note: In a real app, this would be behind a backend proxy.
// For now, we'll use an environment variable for the API key
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateDailyPrompt = async (): Promise<string> => {
  if (!ai || !apiKey) {
    console.warn('No Gemini API Key found, returning fallback prompt.');
    return 'What is something small that made you smile today?';
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents:
        'Generate a short, engaging, low-pressure conversation prompt for a college student to share a photo with their parents. It should be fun, specific, or reflective. Examples: "Show us your messy desk", "What did you eat today?", "Proof you went outside". Max 10 words.',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING },
          },
        },
      },
    });

    const json = JSON.parse(response.text || '{}');
    return json.prompt || 'Share a highlight from your day!';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Share a photo of something that caught your eye today.';
  }
};
