
import React from 'react';

interface ApiKeySelectorProps {
  onSelectKey: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onSelectKey }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">API Key Required</h2>
        <p className="text-gray-400 mb-6">
          To generate videos with Veo, you need to select your own API key. This helps us manage usage and ensures you have access to the latest models.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Please note that charges may apply. For more information, please visit the{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            billing documentation
          </a>.
        </p>
        <button
          onClick={onSelectKey}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
        >
          Select API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeySelector;
