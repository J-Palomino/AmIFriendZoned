'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { motion } from 'framer-motion';

const NEXT_API = process.env.NEXT_API || 'http://localhost:3001';

type AnalysisResult = {
  success: boolean;
  data: {
    isRomantic: boolean;
    score: number;
    stats: {
      negativeSentences: number;
      neutralSentences: number;
      positiveSentences: number;
      totalSentences: number;
    }
  }
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
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append('file', data.file[0]);

    try {
      const response = await axios.post(`${NEXT_API}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const renderResults = () => {
    if (!result) return null;
    const { data } = result;
    const { stats } = data;
    
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
            data.isRomantic ? 'bg-pink-200' : 'bg-blue-200'
          }`}
        >
          <h2 className="text-3xl font-black">
            {data.isRomantic ? "There's Romance! 💕" : "Just Friends! 🤝"}
          </h2>
          <p className="text-xl mt-2">Confidence Score: {data.score}%</p>
        </motion.div>

        {/* Stats Visualization */}
        <div className="space-y-4">
          {/* Sentiment Distribution Bar */}
          <div className="h-8 rounded-full border-4 border-black overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.positiveSentences / stats.totalSentences) * 100}%` }}
              className="bg-green-400"
              transition={{ delay: 0.2 }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.neutralSentences / stats.totalSentences) * 100}%` }}
              className="bg-gray-400"
              transition={{ delay: 0.4 }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.negativeSentences / stats.totalSentences) * 100}%` }}
              className="bg-red-400"
              transition={{ delay: 0.6 }}
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <StatBox
              label="Positive"
              value={stats.positiveSentences}
              color="bg-green-100"
              percentage={(stats.positiveSentences / stats.totalSentences) * 100}
            />
            <StatBox
              label="Neutral"
              value={stats.neutralSentences}
              color="bg-gray-100"
              percentage={(stats.neutralSentences / stats.totalSentences) * 100}
            />
            <StatBox
              label="Negative"
              value={stats.negativeSentences}
              color="bg-red-100"
              percentage={(stats.negativeSentences / stats.totalSentences) * 100}
            />
          </div>
        </div>

        {/* Reset Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setResult(null)}
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
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <input 
                    type="file" 
                    {...register('file')} 
                    className="w-full p-4 border-4 border-black rounded-lg bg-gradient-to-r from-blue-200 to-blue-300 
                    file:mr-4 file:py-2 file:px-6 
                    file:rounded-full file:border-2 
                    file:border-black file:text-sm 
                    file:font-bold file:bg-white 
                    file:text-black hover:file:bg-gray-100 
                    cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-400 to-green-500 text-black font-black text-lg py-4 px-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all duration-150"
                >
                  Analyze Messages
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