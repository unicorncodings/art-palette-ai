import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { PaletteDisplay } from './components/PaletteDisplay';
import { SuggestionsPanel } from './components/SuggestionsPanel';
import { generatePaletteFromImage, getDesignSuggestions } from './services/geminiService';
import { Palette } from './types';
import { SparklesIcon, ColorSwatchIcon, WandIcon, ShirtIcon, BrushIcon } from './components/icons';
import { fileToBase64 } from './utils';
import { FashionModelGenerator } from './components/FashionModelGenerator';
import { ColourChanger } from './components/ColourChanger';

type ActiveTab = 'palette' | 'fashion' | 'colour';

export default function App(): React.ReactNode {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [isLoadingPalette, setIsLoadingPalette] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('palette');

  const handleImageUpload = useCallback(async (file: File) => {
    // Reset state for new image
    setPalette(null);
    setSuggestions(null);
    setError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsLoadingPalette(true);
    try {
      const base64Data = await fileToBase64(file);
      const generatedPalette = await generatePaletteFromImage(base64Data);
      setPalette(generatedPalette);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred while generating the palette.';
      setError(`Palette generation failed. ${errorMessage}`);
    } finally {
      setIsLoadingPalette(false);
    }
  }, []);

  const handleGenerateSuggestions = useCallback(async (context: string) => {
    if (!palette) return;

    setIsLoadingSuggestions(true);
    setSuggestions(null);
    setError(null);

    try {
      const generatedSuggestions = await getDesignSuggestions(palette, context);
      setSuggestions(generatedSuggestions);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred while generating suggestions.';
      setError(`Suggestion generation failed. ${errorMessage}`);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [palette]);

  const resetState = () => {
    setImageFile(null);
    setImageUrl(null);
    setPalette(null);
    setSuggestions(null);
    setError(null);
    setIsLoadingPalette(false);
    setIsLoadingSuggestions(false);
  };

  const TabButton: React.FC<{ tabName: ActiveTab; children: React.ReactNode }> = ({ tabName, children }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-2 px-4 py-3 text-lg font-semibold border-b-2 transition-colors duration-300 ${
        activeTab === tabName
          ? 'border-purple-500 text-white'
          : 'border-transparent text-gray-400 hover:text-white'
      }`}
      role="tab"
      aria-selected={activeTab === tabName}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 inline-flex items-center gap-3">
            <SparklesIcon className="w-10 h-10" />
            Art Palette AI
          </h1>
          <p className="mt-2 text-lg text-gray-400">Magically extract color palettes or generate fashion models from images.</p>
        </header>

        <div className="flex justify-center border-b border-gray-700 mb-8" role="tablist">
          <TabButton tabName="palette">
            <ColorSwatchIcon className="w-6 h-6" /> Palette AI
          </TabButton>
          <TabButton tabName="fashion">
            <ShirtIcon className="w-6 h-6" /> Fashion AI
          </TabButton>
          <TabButton tabName="colour">
            <BrushIcon className="w-6 h-6" /> Colour AI
          </TabButton>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {activeTab === 'palette' && (
          <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-8">
              <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500/20 text-blue-300 p-2 rounded-lg">
                    <WandIcon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-200">1. Upload Your Inspiration</h2>
                </div>
                <ImageUploader onImageUpload={handleImageUpload} imageUrl={imageUrl} isLoading={isLoadingPalette} />
              </div>

              {palette && (
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-500/20 text-green-300 p-2 rounded-lg">
                      <ColorSwatchIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-200">2. Generated Palette</h2>
                  </div>
                  <PaletteDisplay palette={palette} />
                </div>
              )}
              {imageFile && (
                <button
                  onClick={resetState}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Start Over
                </button>
              )}
            </div>

            <div className="space-y-8">
              {palette && (
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-500/20 text-purple-300 p-2 rounded-lg">
                      <SparklesIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-200">3. Get Design Ideas</h2>
                  </div>
                  <SuggestionsPanel
                    onGenerate={handleGenerateSuggestions}
                    suggestions={suggestions}
                    isLoading={isLoadingSuggestions}
                  />
                </div>
              )}
            </div>
          </main>
        )}

        {activeTab === 'fashion' && <FashionModelGenerator />}
        {activeTab === 'colour' && <ColourChanger />}
      </div>
    </div>
  );
}