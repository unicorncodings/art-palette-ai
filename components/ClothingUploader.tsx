import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './icons';

interface ClothingUploaderProps {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
}

export const ClothingUploader: React.FC<ClothingUploaderProps> = ({ onImageUpload, imageUrl }) => {
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
        ${imageUrl ? 'p-0 border-solid border-transparent' : ''}`}
    >
      <input {...getInputProps()} />

      {imageUrl ? (
        <div className="relative group">
          <img src={imageUrl} alt="Uploaded clothing preview" className="rounded-xl w-full h-auto object-cover" />
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
            <UploadIcon className="w-8 h-8 text-white mb-2" />
            <p className="text-white text-lg font-bold">Click or drop to replace</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-gray-400 h-48">
          <UploadIcon className="w-12 h-12 mb-4" />
          <p className="font-bold text-lg text-gray-300">
            {isDragActive ? "Drop the clothing here!" : "Drag 'n' drop an image"}
          </p>
          <p className="text-sm">or</p>
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
