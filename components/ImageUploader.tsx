
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';
import { fileToBase64 } from '../utils/imageUtils';

interface ImageUploaderProps {
  onImageUpload: (base64Image: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (file: File | null) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        onImageUpload(base64);
        setError(null);
      } catch (err) {
        setError('Failed to read the image file.');
      }
    }
  }, [onImageUpload]);

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-dark-bg">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-dark-text mb-2">AI Voice-Powered Image Editor</h1>
        <p className="text-lg md:text-xl text-dark-text-secondary mb-8">Bring your images to life with voice commands.</p>
        <label
          onDragOver={onDragOver}
          onDrop={onDrop}
          htmlFor="image-upload"
          className="relative block w-full h-64 border-4 border-dashed border-dark-border rounded-xl hover:border-brand-purple hover:bg-dark-surface transition-all duration-300 cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <UploadIcon className="w-16 h-16 text-dark-text-secondary" />
            <p className="mt-4 text-xl text-dark-text-secondary">Drag & Drop an image or <span className="text-brand-purple font-semibold">click to browse</span></p>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
          />
        </label>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default ImageUploader;
