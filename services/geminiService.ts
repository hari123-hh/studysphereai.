import { GoogleGenAI } from "@google/genai";
import type { ImageFile } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Function to convert data URL to the format required by the Gemini API
const dataURLToGeminiPart = (dataurl: string, filename: string): {mimeType: string, data: string} => {
    const arr = dataurl.split(',');
    if (arr.length < 2) {
        throw new Error("Invalid data URL");
    }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
         throw new Error("Could not parse MIME type from data URL");
    }
    const mime = mimeMatch[1];
    const data = arr[1];

    return { mimeType: mime, data: data };
}

export const generateResponse = async (
  prompt: string,
  imageFiles: ImageFile[] | null
): Promise<string> => {

  const systemInstruction = "You are an expert AI tutor. Provide detailed, step-by-step, and easy-to-understand answers suitable for a student. Use Markdown for formatting, including headings, lists, and bold text to structure your explanations clearly. Explain concepts thoroughly.";
  
  try {
    let contents: any;

    if (imageFiles && imageFiles.length > 0) {
      const imageParts = imageFiles.map(file => {
        const { mimeType, data } = dataURLToGeminiPart(file.base64, file.name);
        return {
          inlineData: { mimeType, data }
        };
      });

      const textPart = { text: prompt };
      contents = { parts: [...imageParts, textPart] };

    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
    });

    return response.text;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        return `Failed to get response from AI. Details: ${error.message}`;
    }
    return "Failed to get response from AI due to an unknown error.";
  }
};