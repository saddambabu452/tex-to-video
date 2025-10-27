
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AspectRatio } from './types';
import { generateVideo } from './services/geminiService';
import ApiKeySelector from './components/ApiKeySelector';

const Header: React.FC = () => (
  <header className="text-center p-4 md:p-6">
    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
      Veo Video Weaver
    </h1>
    <p className="text-gray-400 mt-2">Bring your photos to life with AI-powered video generation.</p>
  </header>
);

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, previewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div 
      className="w-full aspect-video bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400 cursor-pointer hover:border-blue-500 hover:bg-gray-700 transition-all duration-300 relative overflow-hidden"
      onClick={handleUploadClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      {previewUrl ? (
        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
      ) : (
        <div className="text-center">
          <svg className="mx-auto h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <p className="mt-2 font-semibold">Click to upload an image</p>
          <p className="text-xs">PNG, JPG, or WEBP</p>
        </div>
      )}
    </div>
  );
};


interface LoadingIndicatorProps {
    message: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => (
    <div className="w-full aspect-video bg-gray-800 rounded-lg flex flex-col items-center justify-center text-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mb-4"></div>
        <p className="text-lg font-semibold text-white">Generating Your Video</p>
        <p className="text-gray-400 mt-2">{message}</p>
    </div>
);


const App: React.FC = () => {
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkApiKey = useCallback(async () => {
    try {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setApiKeySelected(true);
      } else {
        setApiKeySelected(false);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setApiKeySelected(false);
    }
  }, []);
  
  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectApiKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Optimistically assume selection was successful. The next API call will confirm.
      setApiKeySelected(true);
    } catch (e) {
      console.error("Error opening API key selection:", e);
      setError("Failed to open the API key selection dialog.");
    }
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleGenerateVideo = async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }
    if (!apiKeySelected) {
      setError('Please select an API key before generating a video.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      const videoUrl = await generateVideo(prompt, imageFile, aspectRatio, setLoadingMessage);
      setGeneratedVideoUrl(videoUrl);
    } catch (e: any) {
      console.error(e);
      let errorMessage = e.message || 'An unknown error occurred.';
      if (typeof errorMessage === 'string' && errorMessage.includes('Requested entity was not found')) {
        errorMessage = 'Your API key is invalid or has been revoked. Please select a new key.';
        setApiKeySelected(false); // Reset key state to re-trigger the selection prompt
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col p-4">
      {!apiKeySelected && <ApiKeySelector onSelectKey={handleSelectApiKey} />}
      
      <Header />

      <main className="flex-grow container mx-auto max-w-4xl w-full flex flex-col items-center justify-center">
        <div className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          
          {generatedVideoUrl ? (
            <div className="w-full aspect-video">
                <video src={generatedVideoUrl} controls autoPlay className="w-full h-full rounded-lg bg-black" />
            </div>
          ) : isLoading ? (
            <LoadingIndicator message={loadingMessage} />
          ) : (
            <ImageUpload onImageSelect={handleImageSelect} previewUrl={previewUrl} />
          )}

          {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">{error}</div>}

          <div className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Prompt (optional)</label>
              <textarea
                id="prompt"
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A cinematic shot of a car driving on a rainy night"
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
              <div className="flex space-x-2">
                {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 py-3 px-4 text-sm font-semibold rounded-md transition-colors duration-200 ${
                      aspectRatio === ratio
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    {ratio} ({ratio === '16:9' ? 'Landscape' : 'Portrait'})
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            {generatedVideoUrl ? (
                 <button
                    onClick={() => {
                        setGeneratedVideoUrl(null);
                        setImageFile(null);
                        setPreviewUrl(null);
                        setPrompt('');
                        setError(null);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform duration-200"
                >
                    Create Another Video
                </button>
            ) : (
                 <button
                    onClick={handleGenerateVideo}
                    disabled={isLoading || !imageFile || !apiKeySelected}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-300 transform active:scale-95"
                >
                    {isLoading ? 'Weaving Magic...' : 'Generate Video'}
                </button>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center p-4 text-gray-500 text-sm">
        Powered by Google Gemini.
      </footer>
    </div>
  );
};

export default App;
