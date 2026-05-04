import React from 'react';
import { motion } from 'framer-motion';
import useGPAStore from '../hooks/useGPAStore';

const Navigation = () => {
  const { activeTab, setActiveTab } = useGPAStore();

  const tabs = [
    { id: 'gpa-calculator', label: 'GPA Calculator', icon: '🧮' },
    { id: 'cumulative-gpa', label: 'Cumulative GPA', icon: '📊' },
    { id: 'gpa-prediction', label: 'GPA Estimation', icon: '🎯' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="sticky top-16 z-40 glass-morphism border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab relative px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-primary-600 bg-white/50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-white/30'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center space-x-2">
                  <motion.span
                    animate={{ rotate: activeTab === tab.id ? 360 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {tab.icon}
                  </motion.span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
                
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-lg border border-white/20"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 font-medium">Real-time Updates</span>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
