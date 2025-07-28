
import { GoogleGenAI, Type } from "@google/genai";
import { Palette } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

const paletteSchema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "A creative and descriptive name for the color palette, like 'Ocean Sunset' or 'Forest Whisper'."
    },
    description: {
      type: Type.STRING,
      description: "A brief, one-sentence description of the feeling or mood the palette evokes."
    },
    hexCodes: {
      type: Type.ARRAY,
      description: "An array of 5 to 6 hex color codes that represent the dominant and accent colors from the image.",
      items: {
        type: Type.STRING,
        description: "A hex color code string, e.g., '#RRGGBB'."
      }
    }
  },
  required: ["name", "description", "hexCodes"]
};

export const generatePaletteFromImage = async (base64ImageData: string): Promise<Palette> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64ImageData,
    },
  };

  const textPart = {
    text: "You are a world-class color theorist and design expert. Analyze this image and extract a harmonious and visually appealing color palette. Provide a creative name and a brief description for the palette. The palette should consist of 5 or 6 colors, including primary, secondary, and accent colors.",
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: paletteSchema,
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    // Validate the result
    if (!result.name || !result.description || !Array.isArray(result.hexCodes) || result.hexCodes.length === 0) {
      throw new Error("AI response is missing required palette fields.");
    }

    return result as Palette;

  } catch (error) {
    console.error("Error generating palette from Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred during palette generation.");
  }
};

export const getDesignSuggestions = async (palette: Palette, context: string): Promise<string> => {
  const prompt = `
    You are a helpful design assistant. Based on the following color palette, provide practical design suggestions for a "${context}".

    Palette Name: "${palette.name}"
    Palette Description: "${palette.description}"
    Colors (Hex Codes): ${palette.hexCodes.join(', ')}

    Provide actionable advice. For example, if the context is 'Website Landing Page', suggest which colors to use for backgrounds, text, buttons, and accents. Be concise and format your response using markdown for readability (e.g., use headings, bullet points).
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating suggestions from Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred during suggestion generation.");
  }
};
