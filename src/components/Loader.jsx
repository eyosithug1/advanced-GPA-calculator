import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = () => {
  const [loadingStage, setLoadingStage] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Simulate loading stages
    const stage1 = setTimeout(() => setLoadingStage(1), 300);
    const stage2 = setTimeout(() => setLoadingStage(2), 800);
    const stage3 = setTimeout(() => setLoadingStage(3), 1400);
    const stage4 = setTimeout(() => setLoadingStage(4), 2000);

    return () => {
      clearTimeout(stage1);
      clearTimeout(stage2);
      clearTimeout(stage3);
      clearTimeout(stage4);
    };
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
        className="fixed inset-0 z-50 overflow-hidden"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="absolute inset-0 bg-white/30"></div>
          
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{
                y: [Math.random() * window.innerHeight, -100],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Main loader container */}
        <div className="relative h-screen flex items-center justify-center">
          <div className="text-center">
            {/* Logo animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: [0, 1.2, 1], 
                rotate: [ -180, 0, 10, 0]
              }}
              transition={{ 
                duration: 1.5, 
                ease: "easeInOut",
                times: [0, 0.6, 1]
              }}
              className="mb-8"
            >
              <div className="relative">
                {/* Outer glow ring */}
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="w-24 h-24 mx-auto relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-xl opacity-60"></div>
                  <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-purple-700 rounded-full blur-lg opacity-80"></div>
                </motion.div>
                
                {/* Logo icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      rotate: -360
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="w-16 h-16 bg-gradient-to-br from-white to-blue-100 rounded-xl flex items-center justify-center shadow-2xl"
                  >
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Loading text with typewriter effect */}
            <div className="mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-4xl font-bold text-gradient mb-2"
              >
                GPA Calculator Pro
              </motion.h1>
              
              {/* Dynamic loading messages */}
              <motion.div
                key={loadingStage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-gray-600 text-lg"
              >
                {loadingStage === 0 && "Initializing..."}
                {loadingStage === 1 && "Loading components..."}
                {loadingStage === 2 && "Calculating algorithms..."}
                {loadingStage === 3 && "Optimizing experience..."}
                {loadingStage === 4 && "Ready to launch!"}
              </motion.div>
            </div>

            {/* Progress bar with gradient */}
            <div className="w-64 mx-auto mb-8">
              <div className="h-2 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full relative"
                >
                  <motion.div
                    animate={{
                      x: [0, 100],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
            </div>

            {/* Loading dots animation */}
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                />
              ))}
            </div>

            {/* Additional visual elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: 1
              }}
              className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: 1.5
              }}
              className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Loader;
