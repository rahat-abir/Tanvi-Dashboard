
import { GoogleGenAI } from "@google/genai";
import { EmailStats } from "../types";

export const getAIInsights = async (stats: EmailStats): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const prompt = `
      As an expert email marketing analyst, provide a concise summary (max 3 sentences) of the following email campaign performance data:
      - Total Emails: ${stats.total}
      - Completed: ${stats.completed} (${((stats.completed / stats.total) * 100).toFixed(1)}%)
      - Replied: ${stats.replied} (${((stats.replied / stats.total) * 100).toFixed(1)}%)
      - Cold: ${stats.cold} (${((stats.cold / stats.total) * 100).toFixed(1)}%)
      - Bounced: ${stats.bounced} (${((stats.bounced / stats.total) * 100).toFixed(1)}%)
      
      Focus on the reply rate and bounce rate specifically.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The AI analyst is currently unavailable. Please check your connection or API key.";
  }
};
