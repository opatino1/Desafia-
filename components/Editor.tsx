
import React, { useState, useEffect, useCallback } from 'react';
import type { EditHistoryItem } from '../types';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { refinePrompt, editImage } from '../services/geminiService';
import { parseDataUrl } from '../utils/imageUtils';
import { MicrophoneIcon, WandIcon, SpinnerIcon } from './icons';

interface EditorProps {
  initialImage: string;
}

const Editor: React.FC<EditorProps> = ({ initialImage }) => {
  const [history, setHistory] = useState<EditHistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleVoiceResult = useCallback((transcript: string) => {
    setPrompt(transcript);
  }, []);
  
  const { isListening, startListening, isSupported } = useVoiceRecognition(handleVoiceResult);
  
  useEffect(() => {
    if (initialImage) {
      const initialItem: EditHistoryItem = {
        id: crypto.randomUUID(),
        prompt: 'Original',
        imageUrl: initialImage,
      };
      setHistory([initialItem]);
      setCurrentIndex(0);
    }
  }, [initialImage]);

  const handleGenerate = async () => {
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    const currentImage = history[currentIndex];

    try {
      const refined = await refinePrompt(prompt);
      const { data: base64Data, mimeType } = parseDataUrl(currentImage.imageUrl);
      const newImageBase64 = await editImage(base64Data, mimeType, refined);
      
      const newItem: EditHistoryItem = {
        id: crypto.randomUUID(),
        prompt: prompt, // Store original prompt for clarity
        imageUrl: `data:image/png;base64,${newImageBase64}`,
      };

      const newHistory = [...history.slice(0, currentIndex + 1), newItem];
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
      setPrompt('');

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentImage = history[currentIndex];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-dark-bg text-dark-text overflow-hidden">
      {/* History Panel */}
      <aside className="w-full md:w-64 bg-dark-surface p-4 overflow-y-auto shrink-0 border-b md:border-b-0 md:border-r border-dark-border">
        <h2 className="text-xl font-bold mb-4">History</h2>
        <div className="flex md:flex-col gap-4">
          {history.map((item, index) => (
            <div key={item.id} onClick={() => setCurrentIndex(index)} className={`cursor-pointer rounded-lg p-2 transition-all ${currentIndex === index ? 'bg-brand-purple' : 'hover:bg-dark-border'}`}>
              <img src={item.imageUrl} alt={item.prompt} className="w-24 h-24 md:w-full md:h-auto object-cover rounded-md aspect-square" />
              <p className="text-xs mt-2 truncate text-dark-text-secondary" title={item.prompt}>{item.prompt}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden">
        <div className="flex-1 flex items-center justify-center min-h-0">
          {currentImage && (
            <div className="relative">
              <img src={currentImage.imageUrl} alt={currentImage.prompt} className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-2xl" />
              {isLoading && (
                 <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg">
                    <SpinnerIcon className="w-16 h-16 text-brand-purple" />
                 </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Interaction Panel */}
      <aside className="w-full md:w-80 bg-dark-surface p-6 shrink-0 border-t md:border-t-0 md:border-l border-dark-border flex flex-col gap-4 justify-center">
        <h2 className="text-xl font-bold">Edit Image</h2>
        <p className="text-sm text-dark-text-secondary">Use your voice or type an instruction to modify the image.</p>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Eliminar el fondo' or 'Make it a watercolor painting'"
            className="w-full h-28 p-3 bg-dark-bg border-2 border-dark-border rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition resize-none"
            rows={4}
          />
          {isSupported && (
            <button
              onClick={isListening ? () => {} : startListening}
              className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-brand-purple hover:bg-purple-700'}`}
              title="Record instruction"
            >
              <MicrophoneIcon className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        {error && <div className="text-red-400 text-sm bg-red-900/50 p-3 rounded-lg">{error}</div>}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt}
          className="w-full flex items-center justify-center gap-2 bg-brand-purple text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-all disabled:bg-dark-border disabled:cursor-not-allowed"
        >
          {isLoading ? <SpinnerIcon className="w-6 h-6"/> : <WandIcon className="w-6 h-6" />}
          <span>{isLoading ? 'Generating...' : 'Generate'}</span>
        </button>
        {!isSupported && <p className="text-xs text-yellow-400 text-center">Voice recognition is not supported in your browser.</p>}
      </aside>
    </div>
  );
};

export default Editor;
