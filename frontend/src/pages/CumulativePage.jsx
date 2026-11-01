import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';
import useGPAStore from '../store/gpaStore.js';
import {
  calculateCumulativeGPA,
  getTotalCredits,
  getGPACategory,
  requiredGPAForTarget,
  formatGPA
} from '../utils/gpaCalculations.js';
import styles from './CumulativePage.module.css';

const CumulativePage = () => {
  const { user } = useAuthStore();
  const { semesters, fetchSemesters, createSemester, deleteSemester, isLoading } = useGPAStore();

  const [expandedId, setExpandedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [formType, setFormType] = useState('quick'); // 'quick' | 'detailed'
  const [semName, setSemName] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [quickGPA, setQuickGPA] = useState('3.75');
  const [quickCredits, setQuickCredits] = useState('15');

  // What-If Planner State
  const scale = user?.gradeScale || '4.0';
  const [targetGPA, setTargetGPA] = useState(user?.targetGPA || '3.80');
  const [remainingCredits, setRemainingCredits] = useState('30');

  useEffect(() => {
    fetchSemesters();
  }, []);

  const cumulativeGPA = calculateCumulativeGPA(semesters, scale);
  const totalCredits = getTotalCredits(semesters);
  const standing = getGPACategory(cumulativeGPA, scale);

  // Calculate required GPA for future
  const maxScaleVal = scale === '5.0' ? 5.0 : 4.0;
  const targetNum = parseFloat(targetGPA) || 3.8;
  const remainingNum = parseFloat(remainingCredits) || 30;
  const requiredGPA = requiredGPAForTarget(cumulativeGPA, totalCredits, targetNum, remainingNum);

  const isAchievable = requiredGPA <= maxScaleVal && requiredGPA >= 0;

  const handleCreateSemester = async (e) => {
    e.preventDefault();
    if (!semName.trim()) {
      toast.error('Please enter a semester name');
      return;
    }

    const payload = {
      name: semName,
      academicYear,
      isQuickAdd: formType === 'quick',
      gradeScale: scale
    };

    if (formType === 'quick') {
      payload.quickGPA = parseFloat(quickGPA) || 0;
      payload.quickTotalCredits = parseFloat(quickCredits) || 0;
      payload.semesterGPA = parseFloat(quickGPA) || 0;
      payload.totalCredits = parseFloat(quickCredits) || 0;
    } else {
      payload.courses = [];
    }

    const res = await createSemester(payload);
    if (res.success) {
      toast.success(`Semester "${semName}" added`);
      setSemName('');
      setShowAddForm(false);
    } else {
      toast.error(res.error || 'Failed to add semester');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}" from your cumulative record?`)) {
      const res = await deleteSemester(id);
      if (res.success) {
        toast.success('Semester removed');
      } else {
        toast.error('Failed to delete semester');
      }
    }
  };

  return (
    <div className={styles.cumulative}>
      {/* Top Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Cumulative GPA Manager</h1>
          <p className={styles.subtitle}>
            Aggregate semester transcripts, manage cumulative academic history, and model target scenarios.
          </p>
        </div>

        <button
          type="button"
          className={styles.submitBtn}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {showAddForm ? 'Close Add Form' : 'Add New Semester'}
        </button>
      </div>

      {/* Hero Cumulative Banner */}
      <div className={styles.cumulativeBanner}>
        <div className={styles.bannerLeft}>
          <div className={styles.gpaCircle}>
            <div className={styles.gpaCircleVal}>{formatGPA(cumulativeGPA)}</div>
            <div className={styles.gpaCircleLabel}>Cumulative</div>
          </div>
          <div className={styles.bannerMeta}>
            <div className={styles.bannerHeading}>Cumulative Standing</div>
            <div className={styles.bannerSub}>
              Calculated across {semesters.length} {semesters.length === 1 ? 'semester' : 'semesters'} and {totalCredits} credit hours.
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              <span className={`badge ${standing.badge}`}>{standing.label}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Credit Hours
            </div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {totalCredits}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Grade Scale
            </div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {scale}
            </div>
          </div>
        </div>
      </div>

      {/* Add Semester Form (Expandable) */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <form onSubmit={handleCreateSemester} className={styles.formBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Record Academic Term
                </h3>
                <div className={styles.typeToggle}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${formType === 'quick' ? styles.toggleBtnActive : ''}`}
                    onClick={() => setFormType('quick')}
                  >
                    Quick Add (Prior GPA + Credits)
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${formType === 'detailed' ? styles.toggleBtnActive : ''}`}
                    onClick={() => setFormType('detailed')}
                  >
                    Detailed Semester
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Semester Title *</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Spring 2024"
                    value={semName}
                    onChange={(e) => setSemName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Academic Year</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. 2023-2024"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                  />
                </div>

                {formType === 'quick' && (
                  <>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Semester / Prior GPA *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={maxScaleVal}
                        className={styles.input}
                        value={quickGPA}
                        onChange={(e) => setQuickGPA(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Credit Hours *</label>
                      <input
                        type="number"
                        min="0.5"
                        max="100"
                        step="0.5"
                        className={styles.input}
                        value={quickCredits}
                        onChange={(e) => setQuickCredits(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  Save to Cumulative Record
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Semesters Roster + What-If Scenario Planner */}
      <div className={styles.mainLayout}>
        {/* Left: Semesters List */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Semester Transcript History ({semesters.length})
            </h2>
          </div>

          {semesters.length > 0 ? (
            <div className={styles.semList}>
              {semesters.map((sem) => {
                const isExpanded = expandedId === sem._id;
                const semGPAVal = formatGPA(sem.semesterGPA || sem.quickGPA);
                const creditsVal = sem.totalCredits || sem.quickTotalCredits || 0;

                return (
                  <div key={sem._id} className={styles.semCard}>
                    <div
                      className={styles.semHead}
                      onClick={() => setExpandedId(isExpanded ? null : sem._id)}
                    >
                      <div className={styles.semHeadLeft}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            color: 'var(--text-muted)'
                          }}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <div>
                          <div className={styles.semName}>{sem.name}</div>
                          <div className={styles.semSubtitle}>
                            {sem.academicYear || 'Academic Term'} • {creditsVal} Credit Hours
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className={styles.semScore}>{semGPAVal}</div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(sem._id, sem.name);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.35rem'
                          }}
                          title="Delete semester"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Course Details */}
                    {isExpanded && (
                      <div className={styles.semBody}>
                        {sem.courses && sem.courses.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {sem.courses.map((c, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '0.85rem',
                                  padding: '0.4rem 0',
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
                                }}
                              >
                                <div>
                                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.courseName}</span>
                                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                                    ({c.credits} Credits)
                                  </span>
                                </div>
                                <span style={{ fontWeight: 700, color: '#818cf8' }}>{c.grade}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Aggregated record (Prior transcript entry: {creditsVal} credits at {semGPAVal} GPA).
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p>No semesters recorded yet.</p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                style={{
                  color: '#818cf8',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Add your first semester
              </button>
            </div>
          )}
        </div>

        {/* Right: What-If Target Planner */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              What-If Target Planner
            </h2>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Calculate the exact minimum GPA required across remaining terms to graduate with your desired cumulative honor.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Desired Target Cumulative GPA</label>
              <input
                type="number"
                step="0.01"
                min="1.0"
                max={maxScaleVal}
                className={styles.input}
                value={targetGPA}
                onChange={(e) => setTargetGPA(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Remaining Credit Hours</label>
              <input
                type="number"
                step="1"
                min="1"
                max="120"
                className={styles.input}
                value={remainingCredits}
                onChange={(e) => setRemainingCredits(e.target.value)}
              />
            </div>

            {/* Calculated Result */}
            <div className={styles.plannerResult}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Required Average GPA for Next {remainingCredits} Credits
              </div>
              <div className={styles.plannerRequiredScore}>
                {formatGPA(requiredGPA)}
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.4rem', fontWeight: 500 }}>
                  / {maxScaleVal.toFixed(1)}
                </span>
              </div>

              {isAchievable ? (
                <div style={{ fontSize: '0.825rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Mathematically achievable within your grading scale.
                </div>
              ) : (
                <div style={{ fontSize: '0.825rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Target exceeds maximum possible GPA score ({maxScaleVal.toFixed(1)}). Consider adjusting target or taking additional credits.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CumulativePage;
