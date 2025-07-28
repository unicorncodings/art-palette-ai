
import React, { useState } from 'react';
import { SpinnerIcon } from './icons';

interface SuggestionsPanelProps {
  onGenerate: (context: string) => void;
  suggestions: string | null;
  isLoading: boolean;
}

const suggestionContexts = [
  "Website Landing Page",
  "Mobile App UI",
  "Brand Logo",
  "Living Room Decor",
  "Fashion Collection"
];

const parseMarkdown = (text: string) => {
  const lines = text.split('\n');
  const elements = lines.map((line, index) => {
    if (line.startsWith('### ')) {
      return <h3 key={index} className="text-lg font-semibold mt-4 mb-1 text-pink-400">{line.substring(4)}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-xl font-bold mt-5 mb-2 text-purple-400">{line.substring(3)}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-2xl font-bold mt-6 mb-3">{line.substring(2)}</h1>;
    }
    if (line.startsWith('* ') || line.startsWith('- ')) {
      return <li key={index} className="ml-5 list-disc text-gray-300">{line.substring(2)}</li>;
    }
    if (line.trim() === '') {
        return <br key={index} />;
    }
    return <p key={index} className="text-gray-300">{line}</p>;
  });

  return <div className="prose prose-invert">{elements}</div>
};

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ onGenerate, suggestions, isLoading }) => {
  const [selectedContext, setSelectedContext] = useState(suggestionContexts[0]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="context-select" className="block text-sm font-medium text-gray-400 mb-1">Select a context:</label>
        <select
          id="context-select"
          value={selectedContext}
          onChange={(e) => setSelectedContext(e.target.value)}
          className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500"
        >
          {suggestionContexts.map(context => (
            <option key={context} value={context}>{context}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => onGenerate(selectedContext)}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <SpinnerIcon className="w-5 h-5" />
            Generating Ideas...
          </>
        ) : (
          "Generate Ideas"
        )}
      </button>

      {suggestions && (
        <div className="mt-6 p-4 bg-black/20 rounded-lg border border-gray-700 animate-fade-in">
          <h4 className="text-lg font-bold mb-2 text-gray-100">Design Suggestions for "{selectedContext}"</h4>
          <div className="text-gray-300 space-y-2 prose-sm">
            {parseMarkdown(suggestions)}
          </div>
        </div>
      )}
    </div>
  );
};
