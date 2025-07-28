import { GoogleGenAI, Type } from "@google/genai";
import { Palette } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = "gemini-2.5-flash";
const imageGenModel = "imagen-3.0-generate-002";


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
      model: textModel,
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
      model: textModel,
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

export const generateFashionModel = async (
  base64ImageData: string,
  gender: string,
  ethnicity: string,
  country: string,
  additionalClothing: string
): Promise<string> => {
  // Step 1: Describe the clothing item
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64ImageData,
    },
  };

  const textPart = {
    text: "You are a fashion expert. Describe the piece of clothing in this image for an AI image generator. Be specific about the type of clothing (e.g., 't-shirt', 'dress'), color, pattern, style (e.g., 'vintage', 'modern'), and fabric texture if discernible. Focus only on the clothing item itself.",
  };

  let clothingDescription = '';
  try {
    const descriptionResponse = await ai.models.generateContent({
      model: textModel,
      contents: { parts: [textPart, imagePart] },
    });
    clothingDescription = descriptionResponse.text;
  } catch (error) {
    console.error("Error generating clothing description:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API Error (Description): ${error.message}`);
    }
    throw new Error("An unknown error occurred during clothing analysis.");
  }

  // Step 2: Generate an image of a model wearing the described clothing
  const modelDetails = [
    gender !== 'Unspecified' ? gender : '',
    ethnicity !== 'Unspecified' ? ethnicity : '',
    country ? `from ${country}` : ''
  ].filter(Boolean).join(', ');

  const wearingClause = `wearing this item: "${clothingDescription}"`;
  const additionalClause = additionalClothing ? ` and is also styled with the following: "${additionalClothing}"` : '';

  const generationPrompt = `
    Photorealistic, full-body shot of a fashion model${modelDetails ? ` (${modelDetails})` : ''} ${wearingClause}${additionalClause}.
    The model should be standing in a well-lit, minimalist studio with a neutral background.
    The focus is on the complete outfit, showing how the items work together. The model should have a natural pose.
  `;

  try {
    const imageResponse = await ai.models.generateImages({
      model: imageGenModel,
      prompt: generationPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '3:4', // Portrait aspect ratio for models
      },
    });

    if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
      throw new Error("The AI did not return any images.");
    }

    return imageResponse.generatedImages[0].image.imageBytes;

  } catch (error) {
    console.error("Error generating model image:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API Error (Image Gen): ${error.message}`);
    }
    throw new Error("An unknown error occurred during model image generation.");
  }
};

export const changeClothingColour = async (
  base64ImageData: string,
  hexColor: string
): Promise<string> => {
  // Step 1: Describe the image in detail
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64ImageData,
    },
  };
  
  const textPart = {
    text: "You are a visual analyst. Describe the piece of clothing in this image in extreme detail for an AI image generator. Focus on its shape, silhouette, texture, material, folds, wrinkles, seams, and any patterns or graphics. Also, describe the background and lighting conditions precisely. Be literal and exhaustive.",
  };

  let imageDescription = '';
  try {
    const descriptionResponse = await ai.models.generateContent({
      model: textModel,
      contents: { parts: [textPart, imagePart] },
    });
    imageDescription = descriptionResponse.text;
  } catch (error) {
    console.error("Error generating image description:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API Error (Description): ${error.message}`);
    }
    throw new Error("An unknown error occurred during image analysis.");
  }

  // Step 2: Generate a new image with the new color
  const generationPrompt = `
    Task: Recreate the following image with a single color modification.
    Description of original image: "${imageDescription}"
    Modification: Change the color of the main clothing item to the hex code "${hexColor}".
    Instructions:
    - The new image must be a photorealistic replica of the original.
    - The shape, texture, material, folds, and shadows of the clothing must be perfectly preserved.
    - The background, lighting, and any other elements must remain identical to the original.
    - Only the color of the clothing item described should be altered.
  `;

  try {
    const imageResponse = await ai.models.generateImages({
      model: imageGenModel,
      prompt: generationPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
      throw new Error("The AI did not return any images.");
    }

    return imageResponse.generatedImages[0].image.imageBytes;

  } catch (error) {
    console.error("Error generating recolored image:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API Error (Image Gen): ${error.message}`);
    }
    throw new Error("An unknown error occurred during image recoloring.");
  }
};