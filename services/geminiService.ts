
import { GoogleGenAI } from "@google/genai";

export const getMatchInsights = async (matchData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Act as a professional gully cricket analyst. 
    Review this match state: ${JSON.stringify(matchData)}. 
    Provide a short, punchy, 2-sentence analysis of who has the upper hand and a tip for the bowling team. 
    Use local street cricket slang like "dhulai", "jhol", "tight bowling".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Keep your eye on the ball, focus on the yorkers!";
  }
};
