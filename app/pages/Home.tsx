'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { motion } from 'framer-motion';
import Image from 'next/image';

const NEXT_API = process.env.NEXT_API || 'http://localhost:3001';

// Helper function to get first value from possible array
const getValue = <T,>(value: T | T[]): T => {
  return Array.isArray(value) ? value[0] : value;
};

type AnalysisResult = {
  success: boolean | boolean[];
  data: {
    isRomantic: boolean | boolean[];
    score: number | number[];
    stats: {
      totalSentences: number | number[];
      positiveSentences: number | number[];
      negativeSentences: number | number[];
      neutralSentences: number | number[];
    }
  }
};

type UploadedImage = {
  preview: string;
  file: File;
};

type Message = {
  document: string;  // Format: "S-xxxxx" or "R-xxxxx"
  text: string;
};

// Stat Box Component
const StatBox = ({ label, value, color, percentage }: { 
  label: string; 
  value: number; 
  color: string;
  percentage: number;
}) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className={`${color} p-4 rounded-lg border-4 border-black text-center`}
  >
    <div className="text-2xl font-black">{value}</div>
    <div className="text-sm font-bold">{label}</div>
    <div className="text-xs">{percentage.toFixed(1)}%</div>
  </motion.div>
);

const Homepage = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [jsonData, setJsonData] = useState<Message[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const file = files[0];
    if (file.type === 'application/json') {
      // Handle JSON file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const json = JSON.parse(text);
          
          // Validate structure
          if (!Array.isArray(json)) {
            throw new Error('JSON must be an array of messages');
          }
          
          // Validate each message
          json.forEach(msg => {
            if (!msg.document || !msg.text || 
                typeof msg.document !== 'string' || 
                typeof msg.text !== 'string' ||
                !(msg.document.startsWith('S-') || msg.document.startsWith('R-'))) {
              throw new Error('Invalid message format');
            }
          });
          
          setJsonData(json);  // Store JSON data
          setImages([]);  // Clear any existing images
          setError(null);
        } catch (error) {
          console.error('Error processing JSON:', error);
          setError(error instanceof Error ? error.message : 'Invalid JSON file');
          setJsonData(null);
        }
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      // Handle image files
      const newImages = Array.from(files).slice(0, 5).map(file => ({
        preview: URL.createObjectURL(file),
        file
      }));
      setImages(prev => [...prev, ...newImages].slice(0, 5));
      setJsonData(null);  // Clear any existing JSON data
      setError(null);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };
  const onSubmit = async () => {
    if (!jsonData && images.length === 0) return;
    setIsProcessing(true);
    setError(null);
  
    try {
      if (jsonData) {
        // Debug log
        console.log('Sending JSON data:', jsonData);
        
        // Send the JSON data directly, no need to stringify again
        const response = await axios.post(`${NEXT_API}/api/upload`, {
          text: jsonData  // Send the parsed JSON directly
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          setResult(response.data);
        } else {
          setError(response.data.error || 'Analysis failed');
        }
      } else if (images.length > 0) {
        // Handle image submission
        const formData = new FormData();
        images.forEach((image, index) => {
          formData.append('files', image.file);
        });
  
        const response = await axios.post(`${NEXT_API}/api/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.data.success) {
          setResult(response.data);
        } else {
          setError(response.data.error || 'Analysis failed');
        }
      }
    } catch (error) {
      console.error('Error during submission:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze content');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderResults = () => {
    if (!result?.data) return null;
    const { data } = result;
    const { stats } = data;
    
    // Extract values safely
    const isRomantic = getValue(data.isRomantic);
    const score = getValue(data.score);
    const totalSentences = getValue(stats.totalSentences);
    const positiveSentences = getValue(stats.positiveSentences);
    const negativeSentences = getValue(stats.negativeSentences);
    const neutralSentences = getValue(stats.neutralSentences);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Verdict Banner */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`p-6 rounded-xl border-4 border-black text-center ${
            isRomantic ? 'bg-pink-200' : 'bg-blue-200'
          }`}
        >
          <h2 className="text-3xl font-black">
            {isRomantic ? "There's Romance! 💕" : "Just Friends! 🤝"}
          </h2>
          <p className="text-xl mt-2">Confidence Score: {Math.round(score)}%</p>
        </motion.div>

        {/* Stats Visualization */}
        <div className="space-y-4">
          {/* Sentiment Distribution Bar */}
          <div className="h-8 rounded-full border-4 border-black overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(positiveSentences / totalSentences) * 100}%` }}
              className="bg-green-400"
              transition={{ delay: 0.2 }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(neutralSentences / totalSentences) * 100}%` }}
              className="bg-gray-400"
              transition={{ delay: 0.4 }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(negativeSentences / totalSentences) * 100}%` }}
              className="bg-red-400"
              transition={{ delay: 0.6 }}
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <StatBox
              label="Positive"
              value={positiveSentences}
              color="bg-green-100"
              percentage={(positiveSentences / totalSentences) * 100}
            />
            <StatBox
              label="Neutral"
              value={neutralSentences}
              color="bg-gray-100"
              percentage={(neutralSentences / totalSentences) * 100}
            />
            <StatBox
              label="Negative"
              value={negativeSentences}
              color="bg-red-100"
              percentage={(negativeSentences / totalSentences) * 100}
            />
          </div>
        </div>

        {/* Reset Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setResult(null);
            setImages([]);
            setJsonData(null);
          }}
          className="w-full bg-gradient-to-r from-purple-400 to-purple-500 text-white font-black text-lg py-4 px-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
        >
          Analyze Another Conversation
        </motion.button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-pink-200 to-yellow-100"
        animate={{
          background: [
            'linear-gradient(to bottom right, #fef08a, #fbcfe8, #fef9c3)',
            'linear-gradient(to bottom right, #fbcfe8, #fef9c3, #fef08a)',
            'linear-gradient(to bottom right, #fef9c3, #fef08a, #fbcfe8)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      <div className="w-full max-w-md mx-auto relative z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 md:p-10 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black mx-4"
        >
          {result ? (
            renderResults()
          ) : (
            <>
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-black mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500"
              >
                Are you Friendzoned?
              </motion.h1>
              
              <motion.p 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl mb-10 text-center text-gray-700 font-bold"
              >
                Find out now!
              </motion.p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <input 
                      type="file"
                      accept="image/*,application/json"
                      onChange={handleFileUpload}
                      className="w-full p-4 border-4 border-black rounded-lg bg-gradient-to-r from-blue-200 to-blue-300 
                      file:mr-4 file:py-2 file:px-6 
                      file:rounded-full file:border-2 
                      file:border-black file:text-sm 
                      file:font-bold file:bg-white 
                      file:text-black hover:file:bg-gray-100 
                      cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </motion.div>

                  <div className="text-center text-sm text-gray-600">
                    Upload images of your conversation or a JSON file
                    <div className="mt-1 text-xs">
                      Supported formats: Images (.jpg, .png, etc.) or JSON file
                    </div>
                  </div>

                  {/* Example JSON format */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs bg-gray-100 p-3 rounded-lg"
                  >
                    <div className="font-bold mb-1">Example JSON format:</div>
                    <pre className="overflow-x-auto">
{`[
  {
    "document": "S-00001",
    "text": "Hey, want to grab coffee sometime?"
  },
  {
    "document": "R-00002",
    "text": "Sure, that would be fun! As friends, right? 😊"
  }
]`}
                    </pre>
                    <div className="mt-2 text-xs text-gray-600">
                      Note: Document IDs should start with "S-" for sent messages or "R-" for received messages
                    </div>
                  </motion.div>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-24 object-cover rounded-lg border-2 border-black"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 
                            opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length >= 5 && (
                  <p className="text-red-500 text-sm">Maximum 5 images allowed</p>
                )}

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!jsonData && images.length === 0 || isProcessing}
                  className={`w-full bg-gradient-to-r from-green-400 to-green-500 
                    text-black font-black text-lg py-4 px-6 rounded-lg border-4 
                    border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
                    hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                    active:shadow-none transition-all duration-150
                    ${(!jsonData && images.length === 0) || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? 'Processing...' : 'Analyze Messages'}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Homepage;