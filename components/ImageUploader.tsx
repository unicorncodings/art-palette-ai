
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon, PhotoIcon, SpinnerIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imageUrl, isLoading }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageUpload(acceptedFiles[0]);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300
        ${isDragActive ? 'border-purple-500 bg-gray-700/50' : 'border-gray-600 hover:border-purple-400'}
        ${imageUrl ? 'p-0 border-solid' : ''}`}
    >
      <input {...getInputProps()} />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <SpinnerIcon className="w-12 h-12 mb-4" />
          <p className="text-lg font-semibold">Analyzing your image...</p>
          <p>Please wait, magic is in progress.</p>
        </div>
      ) : imageUrl ? (
        <div className="relative">
          <img src={imageUrl} alt="Uploaded preview" className="rounded-xl w-full h-auto object-cover" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl">
            <p className="text-white text-lg font-bold">Click or drop to replace</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-gray-400">
          <UploadIcon className="w-12 h-12 mb-4" />
          <p className="font-bold text-lg text-gray-300">
            {isDragActive ? "Drop the image here!" : "Drag 'n' drop an image here"}
          </p>
          <p>or</p>
          <button
            type="button"
            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Browse Files
          </button>
        </div>
      )}
    </div>
  );
};
