'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { motion } from 'framer-motion';

const NEXT_API = process.env.NEXT_API || 'http://localhost:3001';

const Homepage = () => {
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
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
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
        </motion.div>
      </div>
    </div>
  );
};

export default Homepage;