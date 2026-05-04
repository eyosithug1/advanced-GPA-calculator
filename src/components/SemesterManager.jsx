import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGPAStore from '../hooks/useGPAStore';
import { calculateSemesterGPA, gradeScales, getGradeColor } from '../utils/gpaCalculations';

const SemesterManager = () => {
  const { 
    currentSemester, 
    gradeScale, 
    setCurrentSemester, 
    addCourseToCurrent, 
    updateCourseInCurrent, 
    removeCourseFromCurrent, 
    clearCurrentSemester,
    saveCurrentSemester,
    semesters,
    deleteSemester,
    setActiveTab
  } = useGPAStore();

  const [newCourse, setNewCourse] = useState({ name: '', credits: '', grade: '' });
  const [editingSemester, setEditingSemester] = useState(null);

  const currentGPA = calculateSemesterGPA(currentSemester.courses, gradeScale);
  const availableGrades = Object.keys(gradeScales[gradeScale]);

  const handleAddCourse = () => {
    if (newCourse.name && newCourse.credits && newCourse.grade) {
      addCourseToCurrent({
        name: newCourse.name,
        credits: parseFloat(newCourse.credits),
        grade: newCourse.grade
      });
      setNewCourse({ name: '', credits: '', grade: '' });
    }
  };

  const handleEditSemester = (semester) => {
    setEditingSemester(semester);
    setCurrentSemester(semester);
  };

  const handleSaveSemester = () => {
    saveCurrentSemester();
    setEditingSemester(null);
  };

  const totalCredits = currentSemester.courses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gradient">Semester Management</h1>
        <p className="text-gray-600">Add and manage your academic semesters</p>
      </div>

      {/* Current Semester Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {editingSemester ? 'Edit Semester' : 'Create New Semester'}
          </h2>
          {editingSemester && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                clearCurrentSemester();
                setEditingSemester(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </motion.button>
          )}
        </div>

        {/* Semester Name */}
        <div className="mb-6">
          <label className="floating-label">Semester Name</label>
          <input
            type="text"
            value={currentSemester.name}
            onChange={(e) => setCurrentSemester({ ...currentSemester, name: e.target.value })}
            placeholder="e.g., Fall 2024, Semester 1"
            className="input-3d w-full"
          />
        </div>

        {/* Add Course Form */}
        <div className="mb-6 p-4 bg-white/30 rounded-xl border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Add Course</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              placeholder="Course name"
              className="input-3d"
            />
            <input
              type="number"
              value={newCourse.credits}
              onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
              placeholder="Credits"
              min="0.5"
              max="6"
              step="0.5"
              className="input-3d"
            />
            <select
              value={newCourse.grade}
              onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
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
              onClick={handleAddCourse}
              className="button-3d bg-primary-600 text-white rounded-lg font-medium"
            >
              Add Course
            </motion.button>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-700">Courses ({currentSemester.courses.length})</h3>
          <AnimatePresence>
            {currentSemester.courses.map((course, index) => (
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
                    onClick={() => removeCourseFromCurrent(course.id)}
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

        {/* Semester Summary */}
        {currentSemester.courses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-200"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">{currentGPA}</div>
                <div className="text-sm text-gray-600">Semester GPA</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalCredits}</div>
                <div className="text-sm text-gray-600">Total Credits</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{currentSemester.courses.length}</div>
                <div className="text-sm text-gray-600">Courses</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearCurrentSemester}
            className="button-3d bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium"
          >
            Clear All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveSemester}
            disabled={!currentSemester.name || currentSemester.courses.length === 0}
            className="button-3d bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingSemester ? 'Update Semester' : 'Save Semester'}
          </motion.button>
        </div>
      </motion.div>

      {/* Existing Semesters */}
      {semesters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-2xl p-6"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Semesters</h2>
          <div className="space-y-4">
            {semesters.map((semester, index) => (
              <motion.div
                key={semester.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/50 rounded-xl border border-gray-200 hover:bg-white/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{semester.name}</h3>
                      <p className="text-sm text-gray-500">
                        {semester.courses?.length || 0} courses • 
                        {semester.courses?.reduce((sum, c) => sum + c.credits, 0) || 0} credits
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {calculateSemesterGPA(semester.courses, gradeScale)}
                      </div>
                      <div className="text-xs text-gray-500">GPA</div>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditSemester(semester)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteSemester(semester.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {semesters.length === 0 && !editingSemester && (
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
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Start Building Your Academic Record</h3>
          <p className="text-gray-500">Create your first semester to begin tracking your GPA journey</p>
        </motion.div>
      )}
    </div>
  );
};

export default SemesterManager;
