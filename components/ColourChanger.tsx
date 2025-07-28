import React, { useState, useCallback } from 'react';
import { changeClothingColour } from '../services/geminiService';
import { ShirtIcon, SparklesIcon, SpinnerIcon, BrushIcon } from './icons';
import { fileToBase64 } from '../utils';
import { ClothingUploader } from './ClothingUploader';

const isValidHex = (color: string) => /^#[0-9A-F]{6}$/i.test(color);

export const ColourChanger: React.FC = () => {
  const [clothingFile, setClothingFile] = useState<File | null>(null);
  const [clothingImageUrl, setClothingImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [hexColor, setHexColor] = useState<string>('#8A2BE2'); // Start with a nice purple
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    setClothingFile(file);
    setGeneratedImageUrl(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setClothingImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerateClick = async () => {
    if (!clothingFile || !isValidHex(hexColor)) {
      if (!isValidHex(hexColor)) {
        setError('Please enter a valid hex color code (e.g., #RRGGBB).');
      }
      return;
    };

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const base64Data = await fileToBase64(clothingFile);
      const generatedImageBase64 = await changeClothingColour(base64Data, hexColor);
      setGeneratedImageUrl(`data:image/jpeg;base64,${generatedImageBase64}`);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Recoloring failed. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith('#')) {
      setHexColor(value.toUpperCase());
    } else {
      setHexColor(`#${value.toUpperCase()}`);
    }
  };

  return (
    <main className="animate-fade-in">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* --- Left Column: Controls --- */}
        <div className="space-y-6">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/20 text-blue-300 p-2 rounded-lg">
                <ShirtIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-200">1. Upload Clothing</h2>
            </div>
            <ClothingUploader
              onImageUpload={handleImageUpload}
              imageUrl={clothingImageUrl}
            />
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-500/20 text-green-300 p-2 rounded-lg">
                      <BrushIcon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-200">2. Pick New Colour</h2>
              </div>
              <div className="flex items-center gap-4">
                  <div className="relative">
                      <input
                          type="color"
                          value={hexColor}
                          onChange={(e) => setHexColor(e.target.value)}
                          className="w-16 h-10 p-0 border-none cursor-pointer appearance-none bg-transparent"
                          aria-label="Color picker"
                      />
                      <div className="absolute inset-0 w-12 h-10 rounded-lg pointer-events-none border-2 border-gray-600" style={{ backgroundColor: hexColor }} />
                  </div>
                  <input
                      type="text"
                      value={hexColor}
                      onChange={handleHexInputChange}
                      className="flex-grow bg-gray-700 border-gray-600 text-white rounded-lg p-2 font-mono text-lg focus:ring-purple-500 focus:border-purple-500"
                      placeholder="#RRGGBB"
                  />
              </div>
          </div>

          {clothingFile && (
            <button
              onClick={handleGenerateClick}
              disabled={isLoading || !isValidHex(hexColor)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="w-5 h-5" />
                  Changing Colour...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Change Colour
                </>
              )}
            </button>
          )}
        </div>

        {/* --- Right Column: Result --- */}
        <div className="space-y-8">
          {(isLoading || generatedImageUrl) && (
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg min-h-[400px] flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-500/20 text-purple-300 p-2 rounded-lg">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-200">3. Your Recoloured Item</h2>
              </div>
              <div className="flex-grow flex items-center justify-center">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center text-gray-400 text-center">
                      <SpinnerIcon className="w-12 h-12 mb-4" />
                      <p className="text-lg font-semibold">AI is working its magic...</p>
                      <p>This can take a moment.</p>
                    </div>
                )}
                {generatedImageUrl && !isLoading && (
                    <img src={generatedImageUrl} alt="Recoloured clothing" className="rounded-xl w-full h-auto object-cover animate-fade-in" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
