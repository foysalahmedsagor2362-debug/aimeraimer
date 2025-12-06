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
      systemInstruction: `You are a specialized Academic Tutor focused strictly on Science and Mathematics. 
      
      YOUR SCOPE:
      - Physics
      - Chemistry
      - Biology
      - Mathematics

      RULES:
      1. If a user asks a question related to these four subjects, answer clearly, accurately, and step-by-step. Use LaTeX for math.
      2. If a user asks about anything else (History, Literature, Coding, Politics, General Chat, etc.), politely decline. Say: "I specialize only in Physics, Chemistry, Biology, and Math. Please ask me something in those fields."
      3. Keep formatting clean and academic.`,
    },
  });
};

// --- Summary Service ---

export const generateSmartSummary = async (text: string): Promise<SummaryResult> => {
  const prompt = `Analyze the following study material and provide a structured summary. 
  Ensure the summary is strictly academic and related to Physics, Chemistry, Biology, or Math context if possible.
  
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
              required: ["term", "definition"],
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