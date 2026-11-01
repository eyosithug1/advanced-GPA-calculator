import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import useAuthStore from '../store/authStore.js';
import useGPAStore from '../store/gpaStore.js';
import {
  calculateCumulativeGPA,
  getTotalCredits,
  getGPACategory,
  formatGPA
} from '../utils/gpaCalculations.js';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { semesters, fetchSemesters, isLoading } = useGPAStore();

  useEffect(() => {
    fetchSemesters();
  }, []);

  const scale = user?.gradeScale || '4.0';
  const targetGPA = parseFloat(user?.targetGPA || 3.8);
  const currentCumulativeGPA = calculateCumulativeGPA(semesters, scale);
  const totalCredits = getTotalCredits(semesters);
  const standing = getGPACategory(currentCumulativeGPA, scale);

  // Prepare chart data from recorded semesters
  const chartData = semesters.map((sem, idx) => ({
    name: sem.name || `Semester ${idx + 1}`,
    gpa: parseFloat(sem.semesterGPA || 0),
    credits: parseFloat(sem.totalCredits || 0),
    target: targetGPA
  }));

  // Target progress calculation
  const maxGPA = scale === '5.0' ? 5.0 : 4.0;
  const targetPct = targetGPA > 0 ? Math.min(100, Math.round((currentCumulativeGPA / targetGPA) * 100)) : 0;
  const gpaGap = (targetGPA - currentCumulativeGPA).toFixed(2);

  return (
    <div className={styles.dashboard}>
      {/* Top Welcome & Actions */}
      <div className={styles.welcomeBar}>
        <div>
          <h1 className={styles.welcomeTitle}>
            Academic Overview
          </h1>
          <p className={styles.welcomeSub}>
            Welcome back, {user?.name || 'Scholar'}. Here is your current academic performance.
          </p>
        </div>

        <div className={styles.actionRow}>
          <Link to="/calculator" className={styles.primaryBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Calculate Semester GPA
          </Link>
          <Link to="/cumulative" className={styles.secondaryBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Cumulative Manager
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className={styles.metricsGrid}>
        {/* Cumulative GPA Card */}
        <motion.div
          className={styles.metricCard}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Cumulative GPA</span>
            <div className={styles.metricIconWrap} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
          <div className={styles.metricVal}>
            {formatGPA(currentCumulativeGPA)}
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.35rem' }}>
              / {maxGPA.toFixed(1)}
            </span>
          </div>
          <div className={`${styles.metricBadge} badge ${standing.badge}`}>
            {standing.label}
          </div>
        </motion.div>

        {/* Target GPA Card */}
        <motion.div
          className={styles.metricCard}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Target Goal</span>
            <div className={styles.metricIconWrap} style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
          </div>
          <div className={styles.metricVal}>
            {targetGPA.toFixed(2)}
          </div>
          <div className={styles.metricBadge} style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
            {parseFloat(gpaGap) <= 0
              ? 'Target achieved or exceeded'
              : `${gpaGap} points to target`}
          </div>
        </motion.div>

        {/* Total Credits Card */}
        <motion.div
          className={styles.metricCard}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Total Credits</span>
            <div className={styles.metricIconWrap} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
          </div>
          <div className={styles.metricVal}>
            {totalCredits}
          </div>
          <div className={styles.metricBadge} style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
            Across {semesters.length} {semesters.length === 1 ? 'semester' : 'semesters'}
          </div>
        </motion.div>

        {/* Major & Program Card */}
        <motion.div
          className={styles.metricCard}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Program</span>
            <div className={styles.metricIconWrap} style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.major || 'General Studies'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {user?.university || 'Higher Education'}
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Trend Chart & Target Analysis */}
      <div className={styles.contentGrid}>
        {/* Trend Chart */}
        <div className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                GPA Trajectory
              </h2>
              <p className={styles.cardSub}>Performance history mapped across academic semesters</p>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div style={{ width: '100%', height: 280, marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, maxGPA]}
                    stroke="var(--text-muted)"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 21, 48, 0.95)',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="gpa"
                    name="Semester GPA"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#gpaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, marginBottom: '0.75rem' }}>
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <p>No semester data recorded yet.</p>
              <Link to="/calculator" style={{ color: '#818cf8', fontSize: '0.875rem', fontWeight: 600, display: 'inline-block', marginTop: '0.5rem' }}>
                Add your first courses in the Calculator
              </Link>
            </div>
          )}
        </div>

        {/* Target Analysis Card */}
        <div className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              Goal Progress
            </h2>
          </div>

          <div className={styles.gaugeContainer}>
            <div className={styles.targetCard}>
              <div className={styles.targetRow}>
                <span style={{ color: 'var(--text-secondary)' }}>Current Progress</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{targetPct}%</span>
              </div>
              <div className={styles.progressBarTrack}>
                <div className={styles.progressBarFill} style={{ width: `${Math.min(100, targetPct)}%` }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Benchmark</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{targetGPA.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Grading System</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{scale} Scale</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Academic Standing</span>
                <span className={`badge ${standing.badge}`}>{standing.label}</span>
              </div>
            </div>

            <Link
              to="/settings"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '0.6rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                textDecoration: 'none',
                marginTop: '0.5rem'
              }}
            >
              Adjust Target & Scale in Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Semesters Section */}
      <div className={styles.cardSection}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Recorded Semesters
            </h2>
            <p className={styles.cardSub}>Summary of all recorded terms and performance figures</p>
          </div>
          <Link to="/cumulative" style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
            Manage All Semesters
          </Link>
        </div>

        {semesters.length > 0 ? (
          <div className={styles.semesterList}>
            {semesters.slice(0, 4).map((sem) => (
              <div key={sem._id || sem.name} className={styles.semesterItem}>
                <div className={styles.semMeta}>
                  <div className={styles.semTitle}>{sem.name}</div>
                  <div className={styles.semDetails}>
                    <span>{sem.courses?.length || 0} Courses</span>
                    <span>{sem.totalCredits || sem.quickTotalCredits || 0} Credit Hours</span>
                    {sem.academicYear && <span>Year {sem.academicYear}</span>}
                  </div>
                </div>
                <div className={styles.semStats}>
                  <div className={styles.semGPABadge}>
                    {formatGPA(sem.semesterGPA || sem.quickGPA)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No semesters saved to your database yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
