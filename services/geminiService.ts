import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const LOADING_MESSAGES = [
    "Warming up the video engine...",
    "Contacting creative AI director...",
    "Storyboarding your prompt...",
    "Setting up the virtual cameras...",
    "Rendering initial frames (this can take a few minutes)...",
    "Applying cinematic lighting and effects...",
    "Your vision is materializing, please wait...",
    "Enhancing color and texture...",
    "Adding the final touches to your masterpiece...",
    "Almost there, compiling the final video file...",
];

export const generateVideo = async (
  prompt: string,
  imageFile: File,
  aspectRatio: AspectRatio,
  onProgress: (message: string) => void
): Promise<string> => {
  // Create a new instance right before the call to use the latest key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imageBase64 = await fileToBase64(imageFile);

  onProgress(LOADING_MESSAGES[0]);

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: imageBase64,
      mimeType: imageFile.type,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  let pollCount = 1;
  while (!operation.done) {
    onProgress(LOADING_MESSAGES[pollCount % LOADING_MESSAGES.length]);
    pollCount++;
    await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
    const getOpAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    operation = await getOpAi.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
    throw new Error("Video generation completed, but no download link was found.");
  }

  onProgress("Downloading your generated video...");

  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.statusText}`);
  }

  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};
