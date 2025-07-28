
import React, { useState } from 'react';
import { Palette } from '../types';
import { CheckIcon, ClipboardIcon } from './icons';

interface PaletteDisplayProps {
  palette: Palette;
}

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ palette }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };
  
  const getTextColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 128 ? 'text-white' : 'text-black';
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{palette.name}</h3>
        <p className="text-gray-400">{palette.description}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {palette.hexCodes.map((hex) => (
          <div key={hex} className="group relative">
            <div
              className="h-24 rounded-lg w-full transition-transform duration-200 ease-in-out group-hover:scale-105 shadow-md"
              style={{ backgroundColor: hex }}
            />
            <button
              onClick={() => copyToClipboard(hex)}
              className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-auto px-3 py-1 rounded-md text-xs font-mono backdrop-blur-sm bg-black/30 transition-opacity opacity-0 group-hover:opacity-100 flex items-center gap-1.5 ${getTextColor(hex)}`}
            >
              {hex}
              {copiedColor === hex ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
