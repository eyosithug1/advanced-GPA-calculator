import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useGPAStore from '../hooks/useGPAStore';

const Settings = () => {
  const { gradeScale, setGradeScale, settings, updateSettings, exportData, importData, clearAllData } = useGPAStore();
  const [importText, setImportText] = useState('');

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gpa-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importText);
      importData(data);
      setImportText('');
      alert('Data imported successfully!');
    } catch (error) {
      alert('Error importing data. Please check the format.');
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
      alert('All data has been cleared.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gradient">Settings</h1>
        <p className="text-gray-600">Customize your GPA calculator experience</p>
      </div>

      {/* Grade Scale Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Academic Settings</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Grade Scale</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['4.0', '5.0'].map((scale) => (
                <motion.button
                  key={scale}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setGradeScale(scale)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    gradeScale === scale
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white/50 hover:bg-white/70'
                  }`}
                >
                  <div className="text-lg font-semibold">{scale}.0 Scale</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {scale === '4.0' ? 'Standard US scale' : 'Extended scale'}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Appearance Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Appearance</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-700">Enable Animations</h4>
              <p className="text-sm text-gray-500">Smooth transitions and micro-interactions</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => updateSettings({ animationsEnabled: !settings.animationsEnabled })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.animationsEnabled ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: settings.animationsEnabled ? 24 : 0 }}
                className="w-5 h-5 bg-white rounded-full shadow-md"
              />
            </motion.button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-700">Auto-save</h4>
              <p className="text-sm text-gray-500">Automatically save your data</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => updateSettings({ autoSave: !settings.autoSave })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.autoSave ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: settings.autoSave ? 24 : 0 }}
                className="w-5 h-5 bg-white rounded-full shadow-md"
              />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Data Management</h3>
        
        <div className="space-y-6">
          {/* Export */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Export Data</h4>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              className="button-3d bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium w-full sm:w-auto"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export as JSON
            </motion.button>
          </div>

          {/* Import */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Import Data</h4>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your JSON data here..."
              className="input-3d w-full h-32 resize-none"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleImport}
              disabled={!importText.trim()}
              className="button-3d bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Data
            </motion.button>
          </div>

          {/* Clear Data */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-red-600 mb-3">Danger Zone</h4>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearData}
              className="button-3d bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Data
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-6">About</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-white/50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">GPA Calculator Pro</h4>
            <p className="text-sm text-gray-600 mb-3">
              Version 1.0.0 - Advanced Academic Performance Tracker
            </p>
            <p className="text-sm text-gray-600">
              Built with React, TailwindCSS, and Framer Motion. This application helps students track their academic progress with sophisticated GPA calculations, predictions, and analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/50 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">Features</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Single & Cumulative GPA calculation</li>
                <li>• GPA prediction scenarios</li>
                <li>• Goal planning tools</li>
                <li>• Data visualization</li>
              </ul>
            </div>
            <div className="p-4 bg-white/50 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">Technologies</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React 18</li>
                <li>• TailwindCSS</li>
                <li>• Framer Motion</li>
                <li>• Zustand State Management</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
