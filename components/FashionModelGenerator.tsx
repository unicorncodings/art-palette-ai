import React, { useState, useCallback } from 'react';
import { generateFashionModel } from '../services/geminiService';
import { ShirtIcon, SparklesIcon, SpinnerIcon, SlidersIcon, LayersIcon } from './icons';
import { fileToBase64 } from '../utils';
import { ClothingUploader } from './ClothingUploader';

const GENDERS = ['Unspecified', 'Female', 'Male', 'Non-binary'];
const ETHNICITIES = ['Unspecified', 'Asian', 'Black', 'Caucasian', 'Hispanic', 'Middle Eastern', 'South Asian'];

export const FashionModelGenerator: React.FC = () => {
  const [clothingFile, setClothingFile] = useState<File | null>(null);
  const [clothingImageUrl, setClothingImageUrl] = useState<string | null>(null);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // New state for model customization
  const [gender, setGender] = useState<string>(GENDERS[0]);
  const [ethnicity, setEthnicity] = useState<string>(ETHNICITIES[0]);
  const [country, setCountry] = useState<string>('');
  const [additionalClothing, setAdditionalClothing] = useState<string>('');


  const handleImageUpload = useCallback((file: File) => {
    setClothingFile(file);
    setGeneratedModelUrl(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setClothingImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerateClick = async () => {
    if (!clothingFile) return;

    setIsLoading(true);
    setError(null);
    setGeneratedModelUrl(null);

    try {
      setLoadingStep('Step 1/2: Analyzing clothing...');
      const base64Data = await fileToBase64(clothingFile);

      setLoadingStep('Step 2/2: Generating realistic model...');
      const generatedImageBase64 = await generateFashionModel(base64Data, gender, ethnicity, country, additionalClothing);

      setGeneratedModelUrl(`data:image/jpeg;base64,${generatedImageBase64}`);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Model generation failed. ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
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
        {/* --- Left Column: Uploader & Button --- */}
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
                      <SlidersIcon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-200">2. Customize Model</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="gender-select" className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
                      <select
                        id="gender-select"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                  </div>
                  <div>
                      <label htmlFor="ethnicity-select" className="block text-sm font-medium text-gray-400 mb-1">Ethnicity</label>
                      <select
                        id="ethnicity-select"
                        value={ethnicity}
                        onChange={(e) => setEthnicity(e.target.value)}
                        className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                  </div>
                  <div className="md:col-span-2">
                      <label htmlFor="country-input" className="block text-sm font-medium text-gray-400 mb-1">Country (Optional)</label>
                      <input
                        id="country-input"
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g., Japan, Nigeria, Brazil"
                        className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500"
                      />
                  </div>
              </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500/20 text-purple-300 p-2 rounded-lg">
                      <LayersIcon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-200">3. Style Outfit</h2>
              </div>
              <div>
                  <label htmlFor="additional-clothing-input" className="block text-sm font-medium text-gray-400 mb-1">Add other clothing items to complete the look:</label>
                  <textarea
                    id="additional-clothing-input"
                    rows={3}
                    value={additionalClothing}
                    onChange={(e) => setAdditionalClothing(e.target.value)}
                    placeholder="e.g., black skinny jeans, white sneakers, leather belt"
                    className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500"
                  />
              </div>
          </div>

          {clothingFile && (
            <button
              onClick={handleGenerateClick}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="w-5 h-5" />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Generate Model
                </>
              )}
            </button>
          )}
        </div>

        {/* --- Right Column: Result --- */}
        <div className="space-y-8">
          {(isLoading || generatedModelUrl) && (
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg min-h-[400px] flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-500/20 text-purple-300 p-2 rounded-lg">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-200">4. Generated Model</h2>
              </div>
              <div className="flex-grow flex items-center justify-center">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center text-gray-400 text-center">
                      <SpinnerIcon className="w-12 h-12 mb-4" />
                      <p className="text-lg font-semibold">{loadingStep}</p>
                      <p>This may take a moment...</p>
                    </div>
                )}
                {generatedModelUrl && !isLoading && (
                    <img src={generatedModelUrl} alt="Generated model" className="rounded-xl w-full h-auto object-cover animate-fade-in" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};