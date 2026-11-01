import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';
import useGPAStore from '../store/gpaStore.js';
import {
  calculateSemesterGPA,
  getGPACategory,
  gradeScales,
  formatGPA
} from '../utils/gpaCalculations.js';
import styles from './CalculatorPage.module.css';

const defaultCourses = [
  { id: 1, name: 'Data Structures & Algorithms', credits: 4, grade: 'A', type: 'Regular' },
  { id: 2, name: 'Computer Systems Architecture', credits: 3, grade: 'A-', type: 'Regular' },
  { id: 3, name: 'Linear Algebra & Matrix Theory', credits: 3, grade: 'B+', type: 'Regular' },
  { id: 4, name: 'Technical Communication & Ethics', credits: 2, grade: 'A', type: 'Regular' }
];

const sampleSets = [
  { id: 101, name: 'Calculus III', credits: 4, grade: 'A', type: 'Honors' },
  { id: 102, name: 'Operating Systems', credits: 4, grade: 'A', type: 'Regular' },
  { id: 103, name: 'Database Management Systems', credits: 3, grade: 'B+', type: 'Regular' },
  { id: 104, name: 'Artificial Intelligence Concepts', credits: 3, grade: 'A', type: 'Honors' }
];

const CalculatorPage = () => {
  const { user } = useAuthStore();
  const { createSemester, isLoading } = useGPAStore();

  const [scale, setScale] = useState(user?.gradeScale || '4.0');
  const [courses, setCourses] = useState(defaultCourses);
  const [semesterName, setSemesterName] = useState('Fall 2024');
  const [academicYear, setAcademicYear] = useState('2024-2025');

  const gradeOptions = Object.keys(gradeScales[scale] || gradeScales['4.0']);

  // Handle course changes
  const handleCourseChange = (id, field, value) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleAddCourse = () => {
    const newCourse = {
      id: Date.now(),
      name: '',
      credits: 3,
      grade: 'A',
      type: 'Regular'
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  const handleRemoveCourse = (id) => {
    if (courses.length <= 1) {
      toast.error('Minimum one course required');
      return;
    }
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleLoadSample = () => {
    setCourses(sampleSets);
    toast.success('Sample curriculum loaded');
  };

  const handleClearAll = () => {
    setCourses([{ id: Date.now(), name: '', credits: 3, grade: 'A', type: 'Regular' }]);
    toast('Course list reset');
  };

  // Calculations
  const semesterGPA = calculateSemesterGPA(courses, scale);
  const totalCredits = courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
  const totalQualityPoints = courses.reduce((sum, c) => {
    const pts = (gradeScales[scale] || gradeScales['4.0'])[c.grade] ?? 0;
    return sum + pts * (parseFloat(c.credits) || 0);
  }, 0);

  const category = getGPACategory(semesterGPA, scale);

  // Save to MongoDB
  const handleSaveToDatabase = async () => {
    if (!semesterName.trim()) {
      toast.error('Please specify a semester title');
      return;
    }

    const payload = {
      name: semesterName,
      academicYear,
      gradeScale: scale,
      courses: courses.map((c) => ({
        courseName: c.name || 'Untitled Course',
        credits: parseFloat(c.credits) || 3,
        grade: c.grade,
        courseType: c.type
      }))
    };

    const res = await createSemester(payload);
    if (res.success) {
      toast.success(`"${semesterName}" saved to your academic record`);
    } else {
      toast.error(res.error || 'Failed to save semester');
    }
  };

  return (
    <div className={styles.calculator}>
      {/* Top Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Semester GPA Calculator</h1>
          <p className={styles.subtitle}>
            Enter courses, credit weighting, and expected letter grades for real-time GPA evaluation.
          </p>
        </div>

        {/* Grading Scale Switcher */}
        <div className={styles.scaleSelector}>
          <span className={styles.scaleLabel}>Grading Scale:</span>
          <button
            type="button"
            className={`${styles.scaleBtn} ${scale === '4.0' ? styles.scaleBtnActive : ''}`}
            onClick={() => setScale('4.0')}
          >
            4.0 Scale
          </button>
          <button
            type="button"
            className={`${styles.scaleBtn} ${scale === '5.0' ? styles.scaleBtnActive : ''}`}
            onClick={() => setScale('5.0')}
          >
            5.0 Scale
          </button>
        </div>
      </div>

      {/* Real-time Stats Banner */}
      <div className={styles.statsBanner}>
        <motion.div
          className={styles.statBox}
          key={`gpa-${semesterGPA}`}
          initial={{ scale: 0.96 }}
          animate={{ scale: 1 }}
        >
          <span className={styles.statBoxLabel}>Semester GPA</span>
          <div className={styles.statBoxValue} style={{ color: '#818cf8' }}>
            {formatGPA(semesterGPA)}
          </div>
        </motion.div>

        <div className={styles.statBox}>
          <span className={styles.statBoxLabel}>Academic Standing</span>
          <div style={{ marginTop: '0.4rem' }}>
            <span className={`badge ${category.badge}`} style={{ fontSize: '0.85rem' }}>
              {category.label}
            </span>
          </div>
        </div>

        <div className={styles.statBox}>
          <span className={styles.statBoxLabel}>Total Credit Hours</span>
          <div className={styles.statBoxValue}>
            {totalCredits}
          </div>
        </div>

        <div className={styles.statBox}>
          <span className={styles.statBoxLabel}>Quality Points</span>
          <div className={styles.statBoxValue}>
            {totalQualityPoints.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Course Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.cardTopActions}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Course Roster ({courses.length})
          </h2>

          <div className={styles.tableActions}>
            <button type="button" className={styles.toolBtn} onClick={handleLoadSample}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Load Sample Courses
            </button>
            <button type="button" className={styles.toolBtn} onClick={handleClearAll}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Clear
            </button>
            <button type="button" className={styles.toolBtn} onClick={() => window.print()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print / PDF
            </button>
          </div>
        </div>

        {/* Courses Table */}
        <div className={styles.tableContainer}>
          <table className={styles.courseTable}>
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Course Title & Code</th>
                <th style={{ width: '18%' }}>Credits</th>
                <th style={{ width: '18%' }}>Grade</th>
                <th style={{ width: '12%' }}>Points</th>
                <th style={{ width: '7%', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {courses.map((course, index) => {
                  const pts = (gradeScales[scale] || gradeScales['4.0'])[course.grade] ?? 0;
                  const rowQP = (pts * (parseFloat(course.credits) || 0)).toFixed(1);

                  return (
                    <motion.tr
                      key={course.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td>
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder={`Course #${index + 1} (e.g. MATH 201)`}
                          value={course.name}
                          onChange={(e) => handleCourseChange(course.id, 'name', e.target.value)}
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          className={styles.inputField}
                          min="0.5"
                          max="20"
                          step="0.5"
                          value={course.credits}
                          onChange={(e) => handleCourseChange(course.id, 'credits', e.target.value)}
                        />
                      </td>

                      <td>
                        <select
                          className={styles.selectField}
                          value={course.grade}
                          onChange={(e) => handleCourseChange(course.id, 'grade', e.target.value)}
                        >
                          {gradeOptions.map((g) => (
                            <option key={g} value={g}>
                              {g} ({(gradeScales[scale] || gradeScales['4.0'])[g].toFixed(1)})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {rowQP}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => handleRemoveCourse(course.id)}
                          title="Remove row"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <button type="button" className={styles.addRowBtn} onClick={handleAddCourse}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Course Row
        </button>
      </div>

      {/* Save to Semester Record (MongoDB) */}
      <div className={styles.saveSection}>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            Persist to Academic Record
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Store these courses under your student profile to automatically update cumulative calculations.
          </div>
        </div>

        <div className={styles.saveInputRow}>
          <input
            type="text"
            className={styles.inputField}
            style={{ width: '160px' }}
            placeholder="Semester Name"
            value={semesterName}
            onChange={(e) => setSemesterName(e.target.value)}
          />
          <input
            type="text"
            className={styles.inputField}
            style={{ width: '130px' }}
            placeholder="Year (e.g. 2024)"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSaveToDatabase}
            disabled={isLoading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Semester
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
