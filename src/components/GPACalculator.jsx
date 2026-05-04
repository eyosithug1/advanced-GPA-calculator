import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGPAStore from '../hooks/useGPAStore';
import { calculateSemesterGPA, gradeScales, getGradeColor } from '../utils/gpaCalculations';

const GPACalculator = () => {
  const { gradeScale, gpaCourses, setGpaCourses, addGpaCourse, removeGpaCourse, clearGpaCourses } = useGPAStore();
  const [currentCourse, setCurrentCourse] = useState({ name: '', credits: '', grade: '' });
  
  // Calculate GPA from store data
  const calculatedGPA = gpaCourses.length > 0 ? calculateSemesterGPA(gpaCourses, gradeScale) : null;

  const availableGrades = Object.keys(gradeScales[gradeScale]);

  const courses = gpaCourses || [];

  // Dashboard helper functions
  const calculateAverageGrade = () => {
    if (courses.length === 0) return 'N/A';
    try {
      const gradePoints = courses
        .map(course => gradeScales[gradeScale]?.[course.grade] || 0)
        .filter(points => !isNaN(points));
      
      if (gradePoints.length === 0) return 'N/A';
      
      const avgPoints = gradePoints.reduce((sum, points) => sum + points, 0) / gradePoints.length;
      
      // Find closest grade
      let closestGrade = '';
      let minDiff = Infinity;
      
      Object.entries(gradeScales[gradeScale] || {}).forEach(([grade, points]) => {
        if (!isNaN(points)) {
          const diff = Math.abs(avgPoints - points);
          if (diff < minDiff) {
            minDiff = diff;
            closestGrade = grade;
          }
        }
      });
      
      return closestGrade || 'N/A';
    } catch (error) {
      console.error('Error calculating average grade:', error);
      return 'Error';
    }
  };

  const getBestGrade = () => {
    if (courses.length === 0) return 'N/A';
    try {
      const gradePoints = courses
        .map(course => gradeScales[gradeScale]?.[course.grade] || 0)
        .filter(points => !isNaN(points));
      
      if (gradePoints.length === 0) return 'N/A';
      
      const maxPoints = Math.max(...gradePoints);
      const gradeEntry = Object.entries(gradeScales[gradeScale] || {})
        .find(([grade, points]) => points === maxPoints);
      
      return gradeEntry ? gradeEntry[0] : 'N/A';
    } catch (error) {
      console.error('Error calculating best grade:', error);
      return 'Error';
    }
  };

  const getWorstGrade = () => {
    if (courses.length === 0) return 'N/A';
    try {
      const gradePoints = courses
        .map(course => gradeScales[gradeScale]?.[course.grade] || 0)
        .filter(points => !isNaN(points));
      
      if (gradePoints.length === 0) return 'N/A';
      
      const minPoints = Math.min(...gradePoints);
      const gradeEntry = Object.entries(gradeScales[gradeScale] || {})
        .find(([grade, points]) => points === minPoints);
      
      return gradeEntry ? gradeEntry[0] : 'N/A';
    } catch (error) {
      console.error('Error calculating worst grade:', error);
      return 'Error';
    }
  };

  const getGradeDistribution = () => {
    if (courses.length === 0) return 'No courses';
    try {
      const gradeCounts = {};
      
      courses.forEach(course => {
        if (course.grade && gradeScales[gradeScale]?.[course.grade] !== undefined) {
          gradeCounts[course.grade] = (gradeCounts[course.grade] || 0) + 1;
        }
      });
      
      const total = Object.values(gradeCounts).reduce((sum, count) => sum + count, 0);
      
      if (total === 0) return 'No valid grades';
      
      return Object.entries(gradeCounts)
        .map(([grade, count]) => `${grade}: ${count} (${((count/total)*100).toFixed(1)}%)`)
        .join(', ');
    } catch (error) {
      console.error('Error calculating grade distribution:', error);
      return 'Error';
    }
  };

  const getACredits = () => {
    try {
      return courses
        .filter(course => course.grade === 'A')
        .reduce((sum, course) => sum + parseFloat(course.credits || 0), 0)
        .toFixed(1);
    } catch (error) {
      console.error('Error calculating A credits:', error);
      return '0.0';
    }
  };

  const calculateCourseGPA = (course) => {
    try {
      const points = gradeScales[gradeScale]?.[course.grade] || 0;
      const credits = parseFloat(course.credits || 1);
      return credits > 0 ? (points / credits).toFixed(2) : '0.00';
    } catch (error) {
      console.error('Error calculating course GPA:', error);
      return 'Error';
    }
  };

  const calculateGPATrend = () => {
    if (courses.length < 2) return 'Insufficient data';
    
    try {
      // Simple trend based on recent performance
      const avgPoints = courses
        .map(course => gradeScales[gradeScale]?.[course.grade] || 0)
        .filter(points => !isNaN(points))
        .reduce((sum, points) => sum + points, 0) / courses.length;
      
      const maxPoints = Math.max(...courses.map(course => gradeScales[gradeScale]?.[course.grade] || 0));
      const trend = avgPoints >= maxPoints * 0.9 ? '📈 Excellent' : 
                    avgPoints >= maxPoints * 0.8 ? '📈 Good' :
                    avgPoints >= maxPoints * 0.7 ? '📈 Average' : '📉 Needs Improvement';
      
      return trend;
    } catch (error) {
      console.error('Error calculating GPA trend:', error);
      return 'Error';
    }
  };

  const totalCredits = courses.reduce((sum, course) => sum + parseFloat(course.credits || 0), 0);

  const addCourse = () => {
    try {
      if (!currentCourse.name?.trim()) {
        alert('Please enter a course name');
        return;
      }
      if (!currentCourse.credits || parseFloat(currentCourse.credits) <= 0) {
        alert('Please enter valid credit hours (0.5-35)');
        return;
      }
      if (!currentCourse.grade) {
        alert('Please select a grade');
        return;
      }
      
      addGpaCourse({ ...currentCourse, id: Date.now() });
      
      // Show success feedback
      const successNotification = document.createElement('div');
      successNotification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      successNotification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2-2-4m0 0v6m0 6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          <span>Course added successfully!</span>
        </div>
      `;
      document.body.appendChild(successNotification);
      
      setTimeout(() => {
        if (document.body.contains(successNotification)) {
          document.body.removeChild(successNotification);
        }
      }, 3000);
      
      setCurrentCourse({ name: '', credits: '', grade: '' });
      
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Error adding course. Please try again.');
    }
  };

  const removeCourse = (id) => {
    try {
      removeGpaCourse(id);
      
      // Show success feedback
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          <span>Course removed successfully!</span>
        </div>
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error removing course:', error);
      alert('Error removing course. Please try again.');
    }
  };

  const calculateGPA = () => {
    try {
      if (gpaCourses.length === 0) {
        alert('Please add at least one course to calculate GPA');
        return;
      }
      
      const gpa = calculateSemesterGPA(gpaCourses, gradeScale);
      
      // Auto-scroll to result after calculation
      setTimeout(() => {
        const resultElement = document.getElementById('gpa-result');
        if (resultElement) {
          resultElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
      
      // Show success notification
      const successNotification = document.createElement('div');
      successNotification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      successNotification.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2-2-4m0 0v6m0 6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          <span>GPA Calculated: ${gpa}</span>
        </div>
      `;
      document.body.appendChild(successNotification);
      
      setTimeout(() => {
        if (document.body.contains(successNotification)) {
          document.body.removeChild(successNotification);
        }
      }, 3000);
      
      return gpa;
    } catch (error) {
      console.error('Error calculating GPA:', error);
      alert('Error calculating GPA. Please try again.');
    }
  };

  const resetCalculator = () => {
    try {
      if (gpaCourses.length === 0) {
        alert('No courses to reset. Add some courses first.');
        return;
      }
      
      const courseCount = gpaCourses.length;
      const totalCredits = gpaCourses.reduce((sum, course) => sum + parseFloat(course.credits || 0), 0);
      
      if (confirm(`Are you sure you want to reset all ${courseCount} courses and ${totalCredits} total credits? This action cannot be undone.`)) {
        clearGpaCourses();
        setCurrentCourse({ name: '', credits: '', grade: '' });
        
        // Show success feedback
        const resetNotification = document.createElement('div');
        resetNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300';
        resetNotification.innerHTML = `
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            <span>All ${courseCount} courses reset successfully!</span>
          </div>
        `;
        document.body.appendChild(resetNotification);
        
        setTimeout(() => {
          if (document.body.contains(resetNotification)) {
            document.body.removeChild(resetNotification);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error resetting calculator:', error);
      alert('Error resetting calculator. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gradient">GPA Calculator</h1>
        <p className="text-gray-600">Calculate your single semester GPA quickly and easily</p>
      </div>

      {/* Input Section - Dynamic Height */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-morphism rounded-2xl p-6 transition-all duration-300 ${
          gpaCourses.length > 0 ? 'mb-6' : 'mb-24'
        }`}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Add Courses</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            value={currentCourse.name}
            onChange={(e) => setCurrentCourse({ ...currentCourse, name: e.target.value })}
            placeholder="Course name"
            className="input-3d"
          />
          <input
            type="number"
            value={currentCourse.credits}
            onChange={(e) => setCurrentCourse({ ...currentCourse, credits: e.target.value })}
            placeholder="Credits"
            min="0.5"
            max="35"
            step="0.5"
            className="input-3d"
          />
          <select
            value={currentCourse.grade}
            onChange={(e) => setCurrentCourse({ ...currentCourse, grade: e.target.value })}
            className="input-3d"
          >
            <option value="">Select Grade</option>
            {availableGrades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addCourse}
            disabled={!currentCourse.name || !currentCourse.credits || !currentCourse.grade}
            className="button-3d bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Course
          </motion.button>
        </div>

        {/* Courses Table - Vertical Format */}
        <div className="space-y-2 mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Courses ({gpaCourses.length})</h4>
          <div className="glass-morphism rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-gray-200">
              <div className="font-medium text-gray-700 text-sm">#</div>
              <div className="font-medium text-gray-700 text-sm">Course Name</div>
              <div className="font-medium text-gray-700 text-sm">Credits</div>
              <div className="font-medium text-gray-700 text-sm">Grade</div>
            </div>
            
            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              <AnimatePresence>
                {gpaCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`grid grid-cols-4 transition-all duration-300 ${
                      gpaCourses.length === 1 ? 'p-4' :
                      gpaCourses.length === 2 ? 'p-3' :
                      gpaCourses.length === 3 ? 'p-2.5' :
                      'p-2'
                    } bg-white/50 hover:bg-white/70 transition-colors`}
                  >
                    <div className="flex items-center">
                      <div className={`bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        gpaCourses.length === 1 ? 'w-8 h-8' :
                        gpaCourses.length === 2 ? 'w-7 h-7' :
                        gpaCourses.length === 3 ? 'w-6 h-6' :
                        'w-6 h-6'
                      }`}>
                        <span className={`text-white font-semibold transition-all duration-300 ${
                          gpaCourses.length === 1 ? 'text-sm' :
                          gpaCourses.length === 2 ? 'text-xs' :
                          'text-xs'
                        }`}>{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <h4 className={`font-medium text-gray-800 transition-all duration-300 ${
                        gpaCourses.length === 1 ? 'text-sm' :
                        gpaCourses.length === 2 ? 'text-xs' :
                        'text-xs'
                      }`}>{course.name}</h4>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-gray-600 transition-all duration-300 ${
                        gpaCourses.length === 1 ? 'text-sm' :
                        gpaCourses.length === 2 ? 'text-xs' :
                        'text-xs'
                      }`}>{course.credits}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`grade-badge ${getGradeColor(course.grade, gradeScale)} transition-all duration-300 ${
                        gpaCourses.length === 1 ? 'text-sm px-2 py-1' :
                        gpaCourses.length === 2 ? 'text-xs px-1.5 py-0.5' :
                        'text-xs px-1 py-0.5'
                      }`}>
                        {course.grade}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeCourse(course.id)}
                        className={`bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-all duration-300 ml-2 ${
                          gpaCourses.length === 1 ? 'w-6 h-6' :
                          gpaCourses.length === 2 ? 'w-5 h-5' :
                          'w-5 h-5'
                        }`}
                      >
                        <svg className={`fill-none stroke-current transition-all duration-300 ${
                          gpaCourses.length === 1 ? 'w-3 h-3' :
                          gpaCourses.length === 2 ? 'w-2.5 h-2.5' :
                          'w-2.5 h-2.5'
                        }`} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Action Buttons - Side by Side, Dynamic Positioning */}
        <div className={`flex justify-center space-x-4 transition-all duration-300 ${
          gpaCourses.length > 0 ? 'mt-4' : 'mt-16'
        }`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetCalculator}
            className={`button-3d bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
              gpaCourses.length > 0 ? 'translate-y-0' : 'translate-y-8'
            }`}
          >
            🔄 Reset
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={calculateGPA}
            disabled={gpaCourses.length === 0}
            className={`button-3d bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300 ${
              gpaCourses.length > 0 ? 'translate-y-0' : 'translate-y-8'
            }`}
          >
            🧮 Calculate GPA
          </motion.button>
        </div>
      </motion.div>

      {/* Sticky Calculate Button - REMOVED */}
      {/* Removed duplicate calculate button */}

      {/* Result */}
      {calculatedGPA !== null && (
        <motion.div
          id="gpa-result"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-morphism rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your GPA Result</h3>
          <div className="text-6xl font-bold text-primary-600 mb-4">
            {calculatedGPA}
          </div>
          <div className="text-lg text-gray-600 mb-6">
            Based on {gpaCourses.length} courses and {totalCredits} credit hours
          </div>
          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigator.clipboard.writeText(calculatedGPA);
                alert('GPA copied to clipboard!');
              }}
              className="button-3d bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              📋 Copy GPA
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.print()}
              className="button-3d bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              🖨️ Print Result
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Detailed Course Breakdown - After Result */}
      {calculatedGPA !== null && gpaCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-2xl p-6 mb-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Detailed Course Breakdown</h3>
          
          <div className="space-y-3">
            {gpaCourses.map((course, index) => (
              <div key={course.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{course.name}</h4>
                    <div className="text-sm text-gray-500">
                      {course.credits} credits • Grade: {course.grade} • Grade Points: {gradeScales[gradeScale][course.grade] || 0}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold text-indigo-600">
                  {calculateCourseGPA(course)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Performance Summary & Credit Analysis - After Result */}
      {calculatedGPA !== null && gpaCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-700 mb-2">📊 Performance Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Best Grade:</span>
                  <span className="font-bold text-blue-600">{getBestGrade()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Worst Grade:</span>
                  <span className="font-bold text-red-600">{getWorstGrade()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Grade Distribution:</span>
                  <span className="font-bold text-purple-600">{getGradeDistribution()}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-700 mb-2">💳 Credit Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Credits:</span>
                  <span className="font-bold text-green-600">{totalCredits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Credits/Course:</span>
                  <span className="font-bold text-green-600">{(totalCredits / gpaCourses.length).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits for A's:</span>
                  <span className="font-bold text-green-600">{getACredits()}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {gpaCourses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Start Adding Courses</h3>
          <p className="text-gray-500">Add your courses to calculate your semester GPA</p>
        </motion.div>
      )}
    </div>
  );
};

export default GPACalculator;
