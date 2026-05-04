import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useGPAStore from '../hooks/useGPAStore';
import { 
  calculateCumulativeGPA, 
  getGPACategory,
  gradeScales 
} from '../utils/gpaCalculations';

const Analytics = () => {
  const { gradeScale = '4.0', currentCGPA, cumulativeSemesters } = useGPAStore();
  const [futureSemesters, setFutureSemesters] = useState([]);
  const [currentFuture, setCurrentFuture] = useState({ gpa: '', credits: '' });
  const [futureCGPA, setFutureCGPA] = useState(null);
  const [predictionMode, setPredictionMode] = useState(false);

  // Use CGPA from store if available, otherwise calculate from cumulative semesters
  const currentGPA = currentCGPA || calculateCumulativeGPA(cumulativeSemesters, gradeScale || '4.0');
  
  // Get current credits from cumulative semesters
  const getCurrentTotalCredits = (semesterList) => {
    return semesterList.reduce((total, semester) => {
      return total + semester.courses.reduce((sum, course) => sum + parseFloat(course.credits || 0), 0);
    }, 0);
  };
  
  const currentCredits = getCurrentTotalCredits(cumulativeSemesters);
  const gpaCategory = getGPACategory(currentGPA, gradeScale || '4.0');

  const addFutureSemester = () => {
    if (currentFuture.gpa && currentFuture.credits) {
      setFutureSemesters([...futureSemesters, { ...currentFuture, id: Date.now() }]);
      setCurrentFuture({ gpa: '', credits: '' });
    }
  };

  const removeFutureSemester = (id) => {
    setFutureSemesters(futureSemesters.filter(sem => sem.id !== id));
  };

  const resetFutureSemesters = () => {
    setFutureSemesters([]);
    setCurrentFuture({ gpa: '', credits: '' });
    setFutureCGPA(null);
  };

  const calculatePredictedGPA = () => {
    if (cumulativeSemesters.length === 0 && !currentCGPA) return null;
    
    let totalQualityPoints = 0;
    let totalCredits = 0;
    
    // Calculate from cumulative semesters
    cumulativeSemesters.forEach(semester => {
      if (semester.isQuickAdd) {
        totalQualityPoints += semester.semesterGPA * semester.courses[0].credits;
        totalCredits += semester.courses[0].credits;
      } else if (semester.courses && semester.courses.length > 0) {
        semester.courses.forEach(course => {
          const scale = gradeScales[gradeScale || '4.0'];
          const gradePoints = scale ? scale[course.grade] || 0 : 0;
          totalQualityPoints += gradePoints * course.credits;
          totalCredits += course.credits;
        });
      }
    });
    
    // Add future semesters
    futureSemesters.forEach(future => {
      totalQualityPoints += parseFloat(future.gpa) * parseFloat(future.credits);
      totalCredits += parseFloat(future.credits);
    });
    
    const predictedGPA = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : null;
    
    // Auto-scroll to result after calculation
    setTimeout(() => {
      const resultElement = document.getElementById('predicted-gpa-result');
      if (resultElement) {
        resultElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
    
    return predictedGPA;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gradient">Analytics & Predictions</h1>
        <p className="text-gray-600">Explore your academic performance and future possibilities</p>
      </div>

      {/* Current Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-3d glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Current CGPA Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
            <span className="text-gray-600">Current CGPA</span>
            <span className="text-2xl font-bold text-primary-600">{currentGPA || '0.00'}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
            <span className="text-gray-600">Total Credits</span>
            <span className="text-xl font-semibold text-blue-600">{currentCredits}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
            <span className="text-gray-600">Performance Level</span>
            <span className={`font-semibold ${gpaCategory.color}`}>{gpaCategory.category}</span>
          </div>
        </div>
      </motion.div>

      {/* Enhanced GPA Prediction with Future Semesters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">🔮 Enhanced GPA Prediction</h3>
          {currentCGPA && (
            <div className="text-sm text-purple-600 font-medium">
              Using CGPA: {currentCGPA}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPredictionMode(!predictionMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              predictionMode 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {predictionMode ? '📊 View Results' : '🔮 Add Future Semesters'}
          </motion.button>
        </div>

        {predictionMode ? (
          // Add Future Semesters Mode
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                value={currentFuture.gpa}
                onChange={(e) => setCurrentFuture({ ...currentFuture, gpa: e.target.value })}
                placeholder="Next semester GPA"
                min="0.0"
                max={gradeScale === '5.0' ? '5.0' : '4.0'}
                step="0.01"
                className="input-3d border-l-4 border-purple-200"
              />
              <input
                type="number"
                value={currentFuture.credits}
                onChange={(e) => setCurrentFuture({ ...currentFuture, credits: e.target.value })}
                placeholder="Credit hours"
                min="0.5"
                max="35"
                step="0.5"
                className="input-3d"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addFutureSemester}
                disabled={!currentFuture.gpa || !currentFuture.credits}
                className="button-3d bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ➕ Add Future Semester
              </motion.button>
            </div>

            {/* Calculate Future CGPA Button */}
            {futureSemesters.length > 0 && (
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const predictedGPA = calculatePredictedGPA();
                    setFutureCGPA(predictedGPA);
                    
                    // Auto-scroll to result after calculation
                    setTimeout(() => {
                      const resultElement = document.getElementById('future-cgpa-result');
                      if (resultElement) {
                        resultElement.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'center' 
                        });
                      }
                    }, 100);
                  }}
                  className="button-3d bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg font-medium"
                >
                  🧮 Calculate Future CGPA
                </motion.button>
              </div>
            )}

            {/* Future CGPA Display */}
            {futureCGPA !== null && (
              <motion.div
                id="future-cgpa-result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200"
              >
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-purple-700 mb-3">Your Future CGPA</h4>
                  <div className="text-5xl font-bold text-purple-600 mb-3">{futureCGPA}</div>
                  <p className="text-sm text-gray-600">
                    After {futureSemesters.length} future semesters with {futureSemesters.reduce((sum, f) => sum + parseFloat(f.credits), 0)} total credits
                  </p>
                  <div className="flex justify-center space-x-4 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFutureCGPA(null)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Clear Result
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetFutureSemesters}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      🔄 Reset Future Semesters
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Future Semesters List */}
            {futureSemesters.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700">Future Semesters ({futureSemesters.length})</h4>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetFutureSemesters}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    🔄 Reset All Future Semesters
                  </motion.button>
                </div>
                {futureSemesters.map((future, index) => (
                  <motion.div
                    key={future.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">F{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">Future Semester {index + 1}</h4>
                        <p className="text-sm text-gray-500">{future.credits} credit hours</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="grade-badge bg-purple-100 text-purple-700 border-purple-300">
                        GPA: {future.gpa}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFutureSemester(future.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Results Mode
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-700">Future Semesters ({futureSemesters.length})</h4>
              {futureSemesters.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetFutureSemesters}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  🔄 Reset All Future Semesters
                </motion.button>
              )}
            </div>
            
            {futureSemesters.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                    <h4 className="font-medium text-blue-700 mb-2">Current CGPA</h4>
                    <div className="text-3xl font-bold text-blue-600">{currentGPA}</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
                    <h4 className="font-medium text-purple-700 mb-2">Predicted CGPA</h4>
                    <div id="predicted-gpa-result" className="text-3xl font-bold text-purple-600">{calculatePredictedGPA()}</div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const predictedGPA = calculatePredictedGPA();
                      setFutureCGPA(predictedGPA);
                    }}
                    className="button-3d bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg font-medium"
                  >
                    🧮 Calculate Future CGPA
                  </motion.button>
                </div>
                
                {/* Future CGPA Display in Results Mode */}
                {futureCGPA !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200"
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{futureCGPA}</div>
                      <p className="text-xs text-gray-500">Your Future CGPA</p>
                    </div>
                  </motion.div>
                )}
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      After {futureSemesters.length} future semesters with {futureSemesters.reduce((sum, f) => sum + parseFloat(f.credits), 0)} total credits:
                    </p>
                    <div className="text-4xl font-bold text-green-600">
                      Your CGPA will be: {calculatePredictedGPA()}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {parseFloat(calculatePredictedGPA()) > parseFloat(currentGPA) 
                        ? '📈 CGPA will increase!' 
                        : parseFloat(calculatePredictedGPA()) < parseFloat(currentGPA)
                        ? '📉 CGPA will decrease'
                        : '➡️ CGPA will stay the same'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Predict Your Future CGPA</h4>
                <p className="text-gray-500 mb-4">Add future semester plans to see how they'll affect your cumulative GPA</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPredictionMode(true)}
                  className="button-3d bg-purple-600 text-white px-6 py-3 rounded-lg font-medium"
                >
                  🔮 Add Future Semesters
                </motion.button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Analytics;
