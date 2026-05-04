import React from 'react';
import { motion } from 'framer-motion';
import useGPAStore from '../hooks/useGPAStore';
import { calculateCumulativeGPA, getCurrentTotalCredits, getGPACategory } from '../utils/gpaCalculations';

const Dashboard = () => {
  const { semesters, gradeScale } = useGPAStore();
  
  const cumulativeGPA = calculateCumulativeGPA(semesters, gradeScale);
  const totalCredits = getCurrentTotalCredits(semesters);
  const totalSemesters = semesters.length;
  const gpaCategory = getGPACategory(cumulativeGPA, gradeScale);

  const recentSemesters = semesters.slice(-3).reverse();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold text-gradient"
        >
          Academic Dashboard
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-gray-600"
        >
          Track your academic performance at a glance
        </motion.p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          className="card-3d glass-morphism rounded-2xl p-6 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Cumulative GPA</h3>
          <div className="text-4xl font-bold text-primary-600 mb-2">{cumulativeGPA}</div>
          <div className={`text-sm font-medium ${gpaCategory.color}`}>{gpaCategory.category}</div>
          <div className="text-xs text-gray-500 mt-1">Scale: {gradeScale}.0</div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          className="card-3d glass-morphism rounded-2xl p-6 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Credits</h3>
          <div className="text-4xl font-bold text-blue-600 mb-2">{totalCredits}</div>
          <div className="text-sm text-gray-500">Credit Hours Completed</div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          className="card-3d glass-morphism rounded-2xl p-6 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Semesters</h3>
          <div className="text-4xl font-bold text-green-600 mb-2">{totalSemesters}</div>
          <div className="text-sm text-gray-500">Academic Terms</div>
        </motion.div>
      </div>

      {/* Recent Semesters */}
      {recentSemesters.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="glass-morphism rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Semesters
          </h3>
          <div className="space-y-3">
            {recentSemesters.map((semester, index) => (
              <motion.div
                key={semester.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200 hover:bg-white/70 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{semester.name}</h4>
                    <p className="text-sm text-gray-500">{semester.courses?.length || 0} courses</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    {semester.gpa || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">GPA</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="button-3d bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl p-4 text-center font-medium shadow-lg"
        >
          <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Semester
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="button-3d bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 text-center font-medium shadow-lg"
        >
          <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          View Analytics
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="button-3d bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 text-center font-medium shadow-lg"
        >
          <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Predict GPA
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="button-3d bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 text-center font-medium shadow-lg"
        >
          <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Data
        </motion.button>
      </motion.div>

      {/* Empty State */}
      {semesters.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Yet</h3>
          <p className="text-gray-500 mb-6">Start by adding your first semester to track your GPA</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="button-3d bg-primary-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Add Your First Semester
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
