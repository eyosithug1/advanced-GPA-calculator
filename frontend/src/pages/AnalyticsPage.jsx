import React, { useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import useAuthStore from '../store/authStore.js';
import useGPAStore from '../store/gpaStore.js';
import {
  calculateCumulativeGPA,
  getTotalCredits,
  getGPACategory,
  formatGPA
} from '../utils/gpaCalculations.js';
import styles from './AnalyticsPage.module.css';

const GRADE_COLORS = {
  'A+': '#22c55e',
  'A': '#10b981',
  'A-': '#34d399',
  'B+': '#3b82f6',
  'B': '#60a5fa',
  'B-': '#93c5fd',
  'C+': '#f59e0b',
  'C': '#fbbf24',
  'C-': '#fcd34d',
  'D+': '#f97316',
  'D': '#fb923c',
  'F': '#ef4444'
};

const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const { semesters, fetchSemesters } = useGPAStore();

  useEffect(() => {
    fetchSemesters();
  }, []);

  const scale = user?.gradeScale || '4.0';
  const maxScaleVal = scale === '5.0' ? 5.0 : 4.0;
  const cumulativeGPA = calculateCumulativeGPA(semesters, scale);
  const totalCredits = getTotalCredits(semesters);
  const standing = getGPACategory(cumulativeGPA, scale);

  // Semesters trend data
  const trendData = semesters.map((sem, idx) => ({
    name: sem.name || `Term ${idx + 1}`,
    gpa: parseFloat(sem.semesterGPA || sem.quickGPA || 0),
    credits: parseFloat(sem.totalCredits || sem.quickTotalCredits || 0)
  }));

  // Grade frequency distribution from all courses in all semesters
  const gradeCounts = {};
  semesters.forEach((sem) => {
    if (sem.courses) {
      sem.courses.forEach((c) => {
        const g = c.grade || 'A';
        gradeCounts[g] = (gradeCounts[g] || 0) + 1;
      });
    }
  });

  const gradeDistribution = Object.keys(gradeCounts).map((grade) => ({
    grade,
    count: gradeCounts[grade]
  }));

  // Compute stats
  const gpas = trendData.map((d) => d.gpa).filter((g) => g > 0);
  const highestGPA = gpas.length > 0 ? Math.max(...gpas) : 0;
  const lowestGPA = gpas.length > 0 ? Math.min(...gpas) : 0;
  const avgTermGPA = gpas.length > 0 ? (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2) : '—';

  return (
    <div className={styles.analytics}>
      {/* Top Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Academic Analytics & Trends</h1>
          <p className={styles.subtitle}>
            In-depth statistical breakdown, grade distributions, and predictive trajectory metrics.
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Cumulative Performance</span>
          <div className={styles.kpiVal} style={{ color: '#818cf8' }}>
            {formatGPA(cumulativeGPA)}
          </div>
          <span className={styles.kpiSub}>Standing: {standing.label}</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Highest Term Score</span>
          <div className={styles.kpiVal} style={{ color: '#34d399' }}>
            {highestGPA > 0 ? highestGPA.toFixed(2) : '—'}
          </div>
          <span className={styles.kpiSub}>Peak semester record</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Lowest Term Score</span>
          <div className={styles.kpiVal} style={{ color: '#f87171' }}>
            {lowestGPA > 0 ? lowestGPA.toFixed(2) : '—'}
          </div>
          <span className={styles.kpiSub}>Historical minimum</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Average Term GPA</span>
          <div className={styles.kpiVal}>
            {avgTermGPA}
          </div>
          <span className={styles.kpiSub}>Across completed terms</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* GPA Trajectory Line Chart */}
        <div className={styles.chartCard}>
          <div>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Semester GPA Trajectory
            </h2>
            <p className={styles.cardSub}>Term-by-term score evolution</p>
          </div>

          {trendData.length > 0 ? (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, maxScaleVal]} stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 21, 48, 0.95)',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gpa"
                    name="Term GPA"
                    stroke="#818cf8"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No recorded semesters for trend evaluation.
            </div>
          )}
        </div>

        {/* Grade Distribution Bar Chart */}
        <div className={styles.chartCard}>
          <div>
            <h2 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              Letter Grade Frequency
            </h2>
            <p className={styles.cardSub}>Distribution of awarded grades across curriculum</p>
          </div>

          {gradeDistribution.length > 0 ? (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistribution} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="grade" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <YAxis allowDecimals={false} stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 21, 48, 0.95)',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="count" name="Courses" radius={[4, 4, 0, 0]}>
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Add course-detailed semesters to unlock grade frequency graphs.
            </div>
          )}
        </div>
      </div>

      {/* Academic Insights & Intelligence */}
      <div className={styles.insightsCard}>
        <div>
          <h2 className={styles.cardTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Academic Performance Insights
          </h2>
          <p className={styles.cardSub}>Automated analytics derived from your current transcript trajectory</p>
        </div>

        <div className={styles.insightList}>
          <div className={styles.insightItem}>
            <div className={styles.insightIcon} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div className={styles.insightContent}>
              <div className={styles.insightTitle}>Honor Pacing</div>
              <div className={styles.insightText}>
                {cumulativeGPA >= 3.8
                  ? 'Your current score qualifies for highest academic honors. Maintain this consistency through your remaining credits.'
                  : 'A 0.15 GPA increase over the next 15 credits elevates your status to the next distinction tier.'}
              </div>
            </div>
          </div>

          <div className={styles.insightItem}>
            <div className={styles.insightIcon} style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className={styles.insightContent}>
              <div className={styles.insightTitle}>Credit Weight Sensitivity</div>
              <div className={styles.insightText}>
                With {totalCredits} completed credits, each 4-credit course shifts your cumulative GPA by approximately{' '}
                {(4 / (totalCredits + 4) * 0.5).toFixed(3)} points.
              </div>
            </div>
          </div>

          <div className={styles.insightItem}>
            <div className={styles.insightIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div className={styles.insightContent}>
              <div className={styles.insightTitle}>Grading Scale Compatibility</div>
              <div className={styles.insightText}>
                Currently evaluating on the standard {scale} scale. If your institution uses weighted honours, adjust in Settings.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
