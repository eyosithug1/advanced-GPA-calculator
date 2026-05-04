import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGPAStore from '../hooks/useGPAStore';
import { calculateSemesterGPA, calculateCumulativeGPA, gradeScales, getGradeColor } from '../utils/gpaCalculations';

const CumulativeGPACalculator = () => {
  const { gradeScale, setCurrentCGPA, currentCGPA, cumulativeSemesters, setCumulativeSemesters, clearCumulativeSemesters } = useGPAStore();
  const [semesters, setSemesters] = useState(cumulativeSemesters || []);
  const [currentCourse, setCurrentCourse] = useState({ name: '', credits: '', grade: '' });
  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);
  const [quickAddMode, setQuickAddMode] = useState(false);
  const [quickSemester, setQuickSemester] = useState({ name: '', totalCredits: '', gpa: '' });
  const [cumulativeGPA, setCumulativeGPA] = useState(currentCGPA || null);

  // Update store when semesters change
  React.useEffect(() => {
    setCumulativeSemesters(semesters);
  }, [semesters, setCumulativeSemesters]);

  // Update local state when store changes
  React.useEffect(() => {
    setSemesters(cumulativeSemesters || []);
    setCumulativeGPA(currentCGPA || null);
  }, [cumulativeSemesters, currentCGPA]);

  // Dashboard helper functions
  const calculateSemesterAverage = (semester) => {
    if (!semester.courses || semester.courses.length === 0) return 'N/A';
    try {
      const gradePoints = semester.courses
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
      console.error('Error calculating semester average:', error);
      return 'Error';
    }
  };

  const getOverallAverageGrade = () => {
    if (semesters.length === 0) return 'N/A';
    try {
      const allCourses = semesters.flatMap(sem => sem.courses || []);
      if (allCourses.length === 0) return 'N/A';
      
      const gradePoints = allCourses
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
      console.error('Error calculating overall average:', error);
      return 'Error';
    }
  };

  const getBestSemester = () => {
    if (semesters.length === 0) return null;
    try {
      const semesterGPAs = semesters.map(semester => {
        if (semester.isQuickAdd) {
          return parseFloat(semester.semesterGPA) || 0;
        } else if (semester.courses && semester.courses.length > 0) {
          const gradePoints = semester.courses
            .map(course => gradeScales[gradeScale]?.[course.grade] || 0)
            .filter(points => !isNaN(points));
          
          if (gradePoints.length === 0) return 0;
          
          const totalPoints = gradePoints.reduce((sum, points) => sum + points, 0);
          const totalCredits = semester.courses.reduce((sum, course) => sum + parseFloat(course.credits || 0), 0);
          
          return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
        } else {
          return 0;
        }
      });
      
      const maxGPA = Math.max(...semesterGPAs);
      const bestIndex = semesterGPAs.findIndex(gpa => gpa === maxGPA);
      
      return bestIndex >= 0 ? semesters[bestIndex] : null;
    } catch (error) {
      console.error('Error finding best semester:', error);
      return null;
    }
  };

  const getWorstSemester = () => {
    if (semesters.length === 0) return null;
    try {
      const semesterGPAs = semesters.map(semester => {
        if (semester.isQuickAdd) {
          return parseFloat(semester.semesterGPA) || 0;
        } else if (semester.courses && semester.courses.length > 0) {
          const gradePoints = semester.courses
            .map(course => gradeScales[gradeScale]?.[course.grade] || 0)
            .filter(points => !isNaN(points));
          
          if (gradePoints.length === 0) return 0;
          
          const totalPoints = gradePoints.reduce((sum, points) => sum + points, 0);
          const totalCredits = semester.courses.reduce((sum, course) => sum + parseFloat(course.credits || 0), 0);
          
          return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
        } else {
          return 0;
        }
      });
      
      const minGPA = Math.min(...semesterGPAs);
      const worstIndex = semesterGPAs.findIndex(gpa => gpa === minGPA);
      
      return worstIndex >= 0 ? semesters[worstIndex] : null;
    } catch (error) {
      console.error('Error finding worst semester:', error);
      return null;
    }
  };

  const getOverallGradeDistribution = () => {
    if (semesters.length === 0) return 'No courses';
    try {
      const allCourses = semesters.flatMap(sem => sem.courses || []);
      if (allCourses.length === 0) return 'No valid grades';
      
      const gradeCounts = {};
      
      allCourses.forEach(course => {
        if (course.grade && gradeScales[gradeScale]?.[course.grade] !== undefined) {
          gradeCounts[course.grade] = (gradeCounts[course.grade] || 0) + 1;
        }
      });
      
      const total = allCourses.length;
      
      if (total === 0) return 'No valid grades';
      
      return Object.entries(gradeCounts)
        .map(([grade, count]) => `${grade}: ${count} (${((count/total)*100).toFixed(1)}%)`)
        .join(', ');
    } catch (error) {
      console.error('Error calculating grade distribution:', error);
      return 'Error';
    }
  };

  const getTotalCredits = () => {
    return semesters.reduce((total, semester) => {
      if (semester.isQuickAdd) {
        return total + parseFloat(semester.courses[0]?.credits || 0);
      } else if (semester.courses) {
        return total + semester.courses.reduce((sum, course) => sum + parseFloat(course.credits || 0), 0);
      } else {
        return total;
      }
    }, 0);
  };

  const getTotalCourses = () => {
    return semesters.reduce((total, semester) => {
      return total + (semester.courses ? semester.courses.length : 1);
    }, 0);
  };

  const availableGrades = Object.keys(gradeScales[gradeScale]);

  const addCourseToCurrentSemester = () => {
    if (currentCourse.name && currentCourse.credits && currentCourse.grade) {
      const newSemesters = [...semesters];
      if (!newSemesters[currentSemesterIndex]) {
        newSemesters[currentSemesterIndex] = { courses: [], name: `Semester ${currentSemesterIndex + 1}` };
      }
      newSemesters[currentSemesterIndex].courses.push({ ...currentCourse, id: Date.now() });
      setSemesters(newSemesters);
      setCurrentCourse({ name: '', credits: '', grade: '' });
      setCumulativeGPA(null);
    }
  };

  const removeCourseFromSemester = (semesterIndex, courseId) => {
    const newSemesters = [...semesters];
    newSemesters[semesterIndex].courses = newSemesters[semesterIndex].courses.filter(course => course.id !== courseId);
    setSemesters(newSemesters);
    setCumulativeGPA(null);
  };

  const addNewSemester = () => {
    setCurrentSemesterIndex(semesters.length);
    setCurrentCourse({ name: '', credits: '', grade: '' });
  };

  const removeSemester = (semesterIndex) => {
    const newSemesters = semesters.filter((_, index) => index !== semesterIndex);
    setSemesters(newSemesters);
    if (currentSemesterIndex >= newSemesters.length) {
      setCurrentSemesterIndex(Math.max(0, newSemesters.length - 1));
    }
    setCumulativeGPA(null);
  };

  const calculateCumulative = () => {
    const totalCredits = getTotalCredits();
    let totalQualityPoints = 0;
    
    semesters.forEach(semester => {
      if (semester.isQuickAdd) {
        // Use stored semester GPA for quick add semesters
        totalQualityPoints += semester.semesterGPA * semester.courses[0].credits;
      } else if (semester.courses && semester.courses.length > 0) {
        // Calculate normally for detailed semesters
        semester.courses.forEach(course => {
          const gradePoints = gradeScales[gradeScale][course.grade] || 0;
          totalQualityPoints += gradePoints * course.credits;
        });
      }
    });
    
    const gpa = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : 0;
    setCumulativeGPA(gpa);
    // Send CGPA to store for prediction page
    setCurrentCGPA(gpa);
    
    // Auto-scroll to result after calculation
    setTimeout(() => {
      const resultElement = document.getElementById('cumulative-gpa-result');
      if (resultElement) {
        resultElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      
      // Auto-scroll to dashboard after result
      setTimeout(() => {
        const dashboardElement = document.getElementById('cgpa-dashboard');
        if (dashboardElement) {
          dashboardElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500);
    }, 100);
  };

  const addQuickSemester = () => {
    if (quickSemester.name && quickSemester.totalCredits && quickSemester.gpa) {
      // Create a mock course that represents the entire semester
      const mockCourse = {
        id: Date.now(),
        name: `All Courses - ${quickSemester.name}`,
        credits: parseFloat(quickSemester.totalCredits),
        grade: 'A', // Default grade for display
        actualGPA: parseFloat(quickSemester.gpa) // Store actual GPA
      };
      
      const newSemesters = [...semesters];
      newSemesters.push({
        name: quickSemester.name,
        courses: [mockCourse],
        isQuickAdd: true,
        semesterGPA: parseFloat(quickSemester.gpa) // Store semester GPA directly
      });
      
      setSemesters(newSemesters);
      setQuickSemester({ name: '', totalCredits: '', gpa: '' });
      setQuickAddMode(false);
      setCumulativeGPA(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gradient">Cumulative GPA Calculator</h1>
        <p className="text-gray-600">Calculate your cumulative GPA across multiple semesters</p>
      </div>

      {/* Current Semester Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {quickAddMode ? 'Quick Add Semester' : (semesters[currentSemesterIndex]?.name || `Semester ${currentSemesterIndex + 1}`)}
          </h3>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setQuickAddMode(!quickAddMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                quickAddMode 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {quickAddMode ? '📝 Detailed' : '⚡ Quick Add'}
            </motion.button>
            {!quickAddMode && semesters.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSemesterIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  currentSemesterIndex === index
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
            {!quickAddMode && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={addNewSemester}
                className="w-8 h-8 rounded-full bg-green-500 text-white font-bold hover:bg-green-600"
              >
                +
              </motion.button>
            )}
          </div>
        </div>

        {quickAddMode ? (
          // Quick Add Mode
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              value={quickSemester.name}
              onChange={(e) => setQuickSemester({ ...quickSemester, name: e.target.value })}
              placeholder="Semester name (e.g., Fall 2024)"
              className="input-3d border-r-4 border-r-gray-200"
            />
            <div className="text-xs text-gray-500 mt-1 mb-3">📝 Semester Name</div>
            
            <input
              type="number"
              value={quickSemester.totalCredits}
              onChange={(e) => setQuickSemester({ ...quickSemester, totalCredits: e.target.value })}
              placeholder="Total credits"
              min="1"
              max="35"
              step="0.5"
              className="input-3d border-r-4 border-r-gray-200"
            />
            <div className="text-xs text-gray-500 mt-1 mb-3">📚 Total Credits</div>
            
            <input
              type="number"
              value={quickSemester.gpa}
              onChange={(e) => setQuickSemester({ ...quickSemester, gpa: e.target.value })}
              placeholder="Enter GPA (e.g., 3.42)"
              min="0.0"
              max={gradeScale === '5.0' ? '5.0' : '4.0'}
              step="0.01"
              className="input-3d border-l-4 border-blue-200"
            />
            <div className="text-xs text-gray-500 mt-1 mb-3">🎯 GPA (0.0 ━━━━━━━ {gradeScale === '5.0' ? '5.0' : '4.0'})</div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addQuickSemester}
              disabled={!quickSemester.name || !quickSemester.totalCredits || !quickSemester.gpa}
              className="button-3d bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⚡ Add Semester
            </motion.button>
          </div>
        ) : (
          // Detailed Mode (existing code)
          <>
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
                onClick={addCourseToCurrentSemester}
                disabled={!currentCourse.name || !currentCourse.credits || !currentCourse.grade}
                className="button-3d bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Course
              </motion.button>
            </div>

            {/* Current Semester Courses */}
            {semesters[currentSemesterIndex]?.courses?.length > 0 && (
              <div className="space-y-3 mb-6">
                <h4 className="font-medium text-gray-700">
                  Courses in {semesters[currentSemesterIndex].name} ({semesters[currentSemesterIndex].courses.length})
                </h4>
                <AnimatePresence>
                  {semesters[currentSemesterIndex].courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{course.name}</h4>
                          <p className="text-sm text-gray-500">{course.credits} credit hours</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`grade-badge ${getGradeColor(course.grade, gradeScale)}`}>
                          {course.grade}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeCourseFromSemester(currentSemesterIndex, course.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* CGPA Dashboard */}
          {semesters.length > 0 && (
            <motion.div
              id="cgpa-dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-morphism rounded-2xl p-6 mb-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gradient-to-r from-blue-600 to-indigo-600 mb-2">📊 CGPA Dashboard</h3>
                <p className="text-sm text-gray-500">Your comprehensive academic performance overview</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Current CGPA */}
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 shadow-lg">
                  <div className="mb-3">
                    <div className="text-xs text-blue-600 font-medium mb-1">CURRENT CGPA</div>
                    <div className="text-4xl font-bold text-blue-600">{cumulativeGPA || '0.00'}</div>
                    <div className="text-sm text-gray-500">Overall Performance</div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-blue-600 font-medium mb-1">GRADE SCALE</div>
                    <div className="text-2xl font-bold text-blue-600">{gradeScale}</div>
                    <div className="text-sm text-gray-500">Calculation Standard</div>
                  </div>
                </div>
                
                {/* Academic Progress */}
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-300 shadow-lg">
                  <div className="mb-3">
                    <div className="text-xs text-green-600 font-medium mb-1">ACADEMIC RECORD</div>
                    <div className="text-4xl font-bold text-green-600">{semesters.length}</div>
                    <div className="text-sm text-gray-500">Total Semesters</div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-green-600 font-medium mb-1">TOTAL CREDITS</div>
                    <div className="text-4xl font-bold text-green-600">{getTotalCredits()}</div>
                    <div className="text-sm text-gray-500">All Time</div>
                  </div>
                </div>
                
                {/* Performance Analysis */}
                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-300 shadow-lg">
                  <div className="mb-3">
                    <div className="text-xs text-yellow-600 font-medium mb-1">AVERAGE GRADE</div>
                    <div className="text-4xl font-bold text-yellow-600">{getOverallAverageGrade()}</div>
                    <div className="text-sm text-gray-500">Performance Level</div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-yellow-600 font-medium mb-1">GRADE DISTRIBUTION</div>
                    <div className="text-lg font-bold text-yellow-600">{getOverallGradeDistribution()}</div>
                    <div className="text-sm text-gray-500">Across All Semesters</div>
                  </div>
                </div>
                
                {/* Best/Worst Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getBestSemester() && (
                    <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-300 shadow-lg">
                      <div className="mb-3">
                        <div className="text-xs text-indigo-600 font-medium mb-1">BEST SEMESTER</div>
                        <div className="text-2xl font-bold text-indigo-600">{getBestSemester()?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">Highest Performance</div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-indigo-600 font-medium mb-1">SEMESTER GPA</div>
                        <div className="text-2xl font-bold text-indigo-600">{getBestSemester()?.isQuickAdd ? getBestSemester()?.semesterGPA : calculateSemesterGPA(getBestSemester()?.courses, gradeScale)}</div>
                        <div className="text-sm text-gray-500">Grade Point Average</div>
                      </div>
                    </div>
                  )}
                  
                  {getWorstSemester() && (
                    <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-300 shadow-lg">
                      <div className="mb-3">
                        <div className="text-xs text-red-600 font-medium mb-1">NEEDS IMPROVEMENT</div>
                        <div className="text-2xl font-bold text-red-600">{getWorstSemester()?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">Lowest Performance</div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-red-600 font-medium mb-1">SEMESTER GPA</div>
                        <div className="text-2xl font-bold text-red-600">{getWorstSemester()?.isQuickAdd ? getWorstSemester()?.semesterGPA : calculateSemesterGPA(getWorstSemester()?.courses, gradeScale)}</div>
                        <div className="text-sm text-gray-500">Grade Point Average</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Quick Stats */}
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-300 shadow-lg md:col-span-2">
                  <div className="mb-3">
                    <div className="text-xs text-purple-600 font-medium mb-1">QUICK STATS</div>
                    <div className="text-2xl font-bold text-purple-600">{semesters.length > 0 ? (getTotalCredits() / semesters.length).toFixed(1) : '0.0'}</div>
                    <div className="text-sm text-gray-500">Avg Credits per Semester</div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-purple-600 font-medium mb-1">CURRENT TREND</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {semesters.length > 1 ? '📈 Improving' : '📊 Starting'}
                    </div>
                    <div className="text-sm text-gray-500">Based on Recent Performance</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

      {/* Current Semester Summary */}
            {semesters[currentSemesterIndex]?.courses?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {calculateSemesterGPA(semesters[currentSemesterIndex].courses, gradeScale)}
                    </div>
                    <div className="text-sm text-gray-600">Semester GPA</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {semesters[currentSemesterIndex].courses.reduce((sum, course) => sum + parseFloat(course.credits || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Credits</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {semesters[currentSemesterIndex].courses.length}
                    </div>
                    <div className="text-sm text-gray-600">Courses</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Add Semester Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addNewSemester}
                className="button-3d bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-medium"
              >
                ➕ Add Semester
              </motion.button>
            </div>
          </>
        )}
      </motion.div>

      {/* All Semesters Overview */}
      {semesters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6">All Semesters Overview</h3>
          <div className="space-y-4">
            {semesters.map((semester, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{semester.name}</h4>
                    <p className="text-sm text-gray-500">
                      {semester.isQuickAdd 
                        ? `Quick Add - ${semester.courses[0]?.credits} credits, GPA: ${semester.semesterGPA?.toFixed(2) || '0.00'}`
                        : `${semester.courses.length} courses • ${semester.courses.reduce((sum, course) => sum + parseFloat(course.credits || 0), 0)} credits`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary-600">
                      {semester.isQuickAdd 
                        ? semester.semesterGPA?.toFixed(2) || '0.00'
                        : calculateSemesterGPA(semester.courses, gradeScale)
                      }
                    </div>
                    <div className="text-xs text-gray-500">GPA</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeSemester(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Calculate Cumulative GPA Button */}
      {semesters.length > 0 && semesters.some(sem => sem.courses.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={calculateCumulative}
            className="button-3d bg-gradient-to-r from-primary-600 to-primary-700 text-white px-12 py-4 rounded-lg font-medium text-lg"
          >
            🧮 Calculate Cumulative GPA
          </motion.button>
        </motion.div>
      )}

      {/* Cumulative Result */}
      {cumulativeGPA !== null && (
        <motion.div
          id="cumulative-gpa-result"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-morphism rounded-2xl p-6 text-center"
        >
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Cumulative GPA</h3>
          <div className="text-7xl font-bold text-primary-600 mb-4">
            {cumulativeGPA}
          </div>
          <div className="text-lg text-gray-600 mb-6">
            Based on {getTotalCourses()} courses across {semesters.length} semesters and {getTotalCredits()} total credit hours
          </div>
          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigator.clipboard.writeText(cumulativeGPA);
                alert('Cumulative GPA copied to clipboard!');
              }}
              className="button-3d bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              📋 Copy GPA
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetAll}
              className="button-3d bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              🔄 Reset All
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CumulativeGPACalculator;
