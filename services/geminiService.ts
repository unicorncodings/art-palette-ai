
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

export const getDesignSuggestions = async (palette: Palette, context: string, base64ImageData?: string, mimeType?: string): Promise<string> => {
  try {
    if (context === "Instagram Clothing Sale Post" && base64ImageData && mimeType) {
      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64ImageData,
        },
      };

      const textPart = {
        text: `You are an expert Instagram marketing strategist and a savvy graphic designer, specializing in fashion e-commerce.

You have been given an image and an accompanying color palette extracted from it. Your task is to generate creative and effective Instagram post ideas for a clothing sale based on this image and palette.

**Image Analysis:**
Analyze the provided image's content (e.g., is it a model wearing the clothes, a flat lay of a garment, or just the clothing item?). Adapt your suggestions based on this analysis.

**Color Palette Information:**
- Palette Name: "${palette.name}"
- Palette Description: "${palette.description}"
- Colors (Hex Codes): ${palette.hexCodes.join(', ')}

**Your Task - Generate Post Ideas:**

Based on the image and the color palette, provide a comprehensive set of ideas for an Instagram clothing sale post. Structure your response in markdown and include the following sections for **at least two distinct concepts**:

## Concept 1: [Creative Title for the Concept]
*   **Visual Design:** Describe how to create the post visually. Suggest how to use the provided color palette for background, text overlays, and graphic elements like price tags or 'SALE' banners. Mention specific design styles (e.g., minimalist, bold, retro). If the original image is good, suggest how to enhance it. If it's lacking, suggest adding a background, props, or a specific theme.
*   **Catchy Caption:** Write a compelling and catchy caption. It should grab attention, describe the clothing, announce the sale, and have a clear call-to-action (e.g., "Shop the link in bio!"). Incorporate the mood of the color palette.
*   **Hashtags:** Provide a list of 5-10 relevant and effective hashtags to maximize reach. Include a mix of popular, niche, and branded hashtags.

## Concept 2: [Another Creative Title]
*   **Visual Design:** (As above)
*   **Catchy Caption:** (As above)
*   **Hashtags:** (As above)
`
      };

      const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [textPart, imagePart] },
      });

      return response.text;

    } else if (context === "Visual Prompt for AI" && base64ImageData && mimeType) {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64ImageData,
            },
        };

        const textPart = {
            text: `You are an expert visual prompt generator. Your task is to describe the provided image in exact detail, creating a prompt that can be used in text-to-image AI tools like Midjourney, DALL·E, or Leonardo AI to regenerate an identical image.

**Instructions:**
- **Do not add extra elements or make assumptions** about anything not visible in the image.
- **Focus on the following details**: clothing (style, fabric, color), pose (body language, position), body type, lighting (e.g., soft studio light, golden hour, cinematic), color palette (dominant and accent colors), background details (or lack thereof), and overall mood (e.g., serene, powerful, candid).
- **Maintain the exact style and composition** of the original image (e.g., full-body shot, portrait, close-up).
- **Your output must be a single, detailed paragraph of descriptive text.** Do not use markdown, headings, or lists. The goal is a concise but comprehensive prompt string.`,
        };

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [textPart, imagePart] },
        });

        return response.text;

    } else {
      const prompt = `
    You are a helpful design assistant. Based on the following color palette, provide practical design suggestions for a "${context}".

    Palette Name: "${palette.name}"
    Palette Description: "${palette.description}"
    Colors (Hex Codes): ${palette.hexCodes.join(', ')}

    Provide actionable advice. For example, if the context is 'Website Landing Page', suggest which colors to use for backgrounds, text, buttons, and accents. Be concise and format your response using markdown for readability (e.g., use headings, bullet points).
  `;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      return response.text;
    }
  } catch (error) {
    console.error("Error generating suggestions from Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred during suggestion generation.");
  }
};
