import { GoogleGenAI, Type, Chat } from "@google/genai";
import { SummaryResult } from "../types";

// Initialize the Gemini API client
// Note: API Key must be provided in the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-2.5-flash';

// --- Chat Service ---

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: `You are an expert AI Tutor. Your goal is to help students learn effectively.
      - Explain concepts clearly and step-by-step.
      - Use formatting (bold, lists, markdown) to make answers readable.
      - If math is involved, use LaTeX formatting.
      - Be encouraging and concise.
      - When asked, provide examples.`,
    },
  });
};

// --- Summary Service ---

export const generateSmartSummary = async (text: string): Promise<SummaryResult> => {
  const prompt = `Analyze the following study material and provide a structured summary.
  Material:
  """
  ${text.substring(0, 30000)} 
  """
  `;

  // Define the schema for the structured output
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A concise summary of the content (approx 100-150 words).",
          },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "5-7 key bullet points extracting the most important information.",
          },
          terms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING },
              },
            },
            description: "Important terms and their brief definitions found in the text.",
          },
          practiceQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-5 practice questions based on the material to test understanding.",
          },
        },
        required: ["summary", "keyPoints", "terms", "practiceQuestions"],
      },
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as SummaryResult;
  }
  
  throw new Error("Failed to generate summary structure.");
};
