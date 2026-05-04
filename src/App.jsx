import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGPAStore from './hooks/useGPAStore';
import GPACalculator from './components/GPACalculator';
import CumulativeGPACalculator from './components/CumulativeGPACalculator';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Navigation from './components/Navigation';
import Loader from './components/Loader';

const App = () => {
  const { activeTab, isLoading, setLoading } = useGPAStore();

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [setLoading]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'gpa-calculator':
        return <GPACalculator />;
      case 'cumulative-gpa':
        return <CumulativeGPACalculator />;
      case 'gpa-prediction':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <GPACalculator />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <Loader />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
        >
          {/* Background decoration */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Main container */}
          <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-morphism border-b border-white/20 sticky top-0 z-50"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">GPA Calculator Pro</h1>
                  <p className="text-sm text-gray-600">Advanced Academic Performance Tracker</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-600">Auto-save enabled</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Navigation */}
        <Navigation />

        {/* Main content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="container mx-auto px-4 py-8"
        >
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderActiveTab()}
          </motion.div>
        </motion.main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-morphism border-t border-white/20 mt-16"
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <span>© 2024 GPA Calculator Pro</span>
                <span>•</span>
                <span>Built with React & TailwindCSS</span>
              </div>
              <div className="flex items-center space-x-4">
                <button className="hover:text-primary-600 transition-colors">Privacy</button>
                <button className="hover:text-primary-600 transition-colors">Help</button>
                <button className="hover:text-primary-600 transition-colors">About</button>
              </div>
            </div>
          </div>
        </motion.footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
