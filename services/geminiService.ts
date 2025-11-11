
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Refines a user's natural language instruction into a clear, concise prompt
 * for an image editing model.
 * @param instruction - The raw instruction from the user (voice or text).
 * @returns A refined prompt string.
 */
export const refinePrompt = async (instruction: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
          parts: [{
              text: `A user wants to edit an image. Their instruction is: "${instruction}". 
              Convert this into a clear, concise, and direct instruction for an AI image editing model. 
              The instruction should be in English. For example, if the user says "quita el fondo", the output should be "remove the background".
              If the instruction is already clear, just return it. Only return the final instruction.`
          }]
      },
       config: {
        systemInstruction: "You are an expert at translating and refining user requests into precise AI image editing prompts.",
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error refining prompt:", error);
    // Fallback to the original instruction if refinement fails
    return instruction;
  }
};

/**
 * Edits an image based on a text prompt using the Gemini 2.5 Flash Image model.
 * @param base64Image - The base64 encoded image string (without data URL prefix).
 * @param mimeType - The MIME type of the image (e.g., 'image/jpeg').
 * @param prompt - The editing instruction.
 * @returns The base64 encoded string of the edited image.
 */
export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const firstPart = response.candidates?.[0]?.content?.parts?.[0];
  if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
    return firstPart.inlineData.data;
  }
  
  throw new Error("No image was generated. The prompt may be too complex or unsafe.");
};
