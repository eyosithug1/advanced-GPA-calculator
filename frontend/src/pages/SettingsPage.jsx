import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';
import useGPAStore from '../store/gpaStore.js';
import { gradeScales } from '../utils/gpaCalculations.js';
import styles from './SettingsPage.module.css';

const SettingsPage = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const { semesters } = useGPAStore();

  const [form, setForm] = useState({
    name: user?.name || '',
    university: user?.university || '',
    major: user?.major || '',
    targetGPA: user?.targetGPA || '3.80',
    gradeScale: user?.gradeScale || '4.0'
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      name: form.name,
      university: form.university,
      major: form.major,
      targetGPA: parseFloat(form.targetGPA) || 3.8,
      gradeScale: form.gradeScale
    });

    if (result.success) {
      toast.success('Academic profile updated');
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  };

  const handleExportJSON = () => {
    const backupData = {
      user: {
        name: user?.name,
        email: user?.email,
        university: user?.university,
        major: user?.major,
        targetGPA: user?.targetGPA,
        gradeScale: user?.gradeScale
      },
      exportDate: new Date().toISOString(),
      semesters
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `GPA_Pro_Transcript_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Academic data downloaded as JSON');
  };

  const currentScale = form.gradeScale === '5.0' ? '5.0' : '4.0';
  const scaleEntries = Object.entries(gradeScales[currentScale]);

  return (
    <div className={styles.settings}>
      {/* Top Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Academic Settings & Profile</h1>
          <p className={styles.subtitle}>
            Configure your target honor goals, grading scale weights, and profile information.
          </p>
        </div>
      </div>

      <div className={styles.settingsGrid}>
        {/* Profile & Academic Goals Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Academic Profile
          </h2>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                className={styles.input}
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Institution / College</label>
                <input
                  type="text"
                  name="university"
                  className={styles.input}
                  placeholder="e.g. Stanford University"
                  value={form.university}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Degree Major / Program</label>
                <input
                  type="text"
                  name="major"
                  className={styles.input}
                  placeholder="e.g. Computer Science"
                  value={form.major}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Target Cumulative GPA</label>
                <input
                  type="number"
                  name="targetGPA"
                  step="0.01"
                  min="1.0"
                  max={form.gradeScale === '5.0' ? '5.0' : '4.0'}
                  className={styles.input}
                  value={form.targetGPA}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Grading System Scale</label>
                <select
                  name="gradeScale"
                  className={styles.select}
                  value={form.gradeScale}
                  onChange={handleChange}
                >
                  <option value="4.0">4.0 Scale (Standard US / International)</option>
                  <option value="5.0">5.0 Scale (Weighted Honors)</option>
                </select>
              </div>
            </div>

            <button type="submit" className={styles.saveBtn} disabled={isLoading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Configuration
            </button>
          </form>

          {/* Backup / Export Section */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Academic Data Backup
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Download your complete semester transcripts and course data in standard JSON format.
            </p>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onClick={handleExportJSON}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export JSON Transcript
            </button>
          </div>
        </div>

        {/* Grading Scale Reference Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Active Scale Reference ({form.gradeScale} Scale)
          </h2>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Each letter grade yields fixed quality points multiplied by credit weight.
          </p>

          <table className={styles.refTable}>
            <thead>
              <tr>
                <th>Letter Grade</th>
                <th>Quality Points</th>
                <th>Percentage Equivalent</th>
              </tr>
            </thead>
            <tbody>
              {scaleEntries.map(([grade, pts]) => (
                <tr key={grade}>
                  <td style={{ fontWeight: 700, color: '#818cf8' }}>{grade}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pts.toFixed(2)}</td>
                  <td>
                    {pts >= 3.7
                      ? '90% – 100%'
                      : pts >= 3.0
                      ? '80% – 89%'
                      : pts >= 2.0
                      ? '70% – 79%'
                      : pts >= 1.0
                      ? '60% – 69%'
                      : 'Below 60%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
