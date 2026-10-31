import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';
import styles from './AuthPage.module.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    major: '',
    targetGPA: '3.8',
    gradeScale: '4.0'
  });
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      university: form.university,
      major: form.major,
      targetGPA: parseFloat(form.targetGPA) || 3.8,
      gradeScale: form.gradeScale
    };

    const result = await register(payload);
    if (result.success) {
      toast.success('Account created successfully');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  return (
    <div className={styles.authPage}>
      {/* Ambient background */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
      </div>

      <div className={styles.authContainer} style={{ maxWidth: '480px' }}>
        {/* Brand */}
        <motion.div
          className={styles.brand}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.brandIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20h.01" /><path d="M7 20v-4" /><path d="M12 20v-8" />
              <path d="M17 20v-12" /><path d="M22 4v16" />
            </svg>
          </div>
          <div>
            <div className={styles.brandName}>GPA Calculator Pro</div>
            <div className={styles.brandSub}>Advanced Academic Tracker</div>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Create Account</h1>
            <p className={styles.cardSub}>Set up your profile to track semesters, courses, and target GPA</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Full Name */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="name">Full Name *</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className={styles.input}
                  placeholder="e.g. Alex Johnson"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">Email Address *</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className={styles.input}
                  placeholder="alex@university.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password and Confirm */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="password">Password *</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    className={styles.input}
                    placeholder="Min 6 chars"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="confirmPassword">Confirm *</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <input
                    id="confirmPassword"
                    type={showPw ? 'text' : 'password'}
                    name="confirmPassword"
                    className={styles.input}
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* University & Major */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="university">University</label>
                <input
                  id="university"
                  type="text"
                  name="university"
                  className={styles.input}
                  placeholder="e.g. Stanford"
                  value={form.university}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="major">Major / Program</label>
                <input
                  id="major"
                  type="text"
                  name="major"
                  className={styles.input}
                  placeholder="Computer Science"
                  value={form.major}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Target GPA & Grade Scale */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="targetGPA">Target GPA</label>
                <input
                  id="targetGPA"
                  type="number"
                  name="targetGPA"
                  step="0.05"
                  min="1.0"
                  max={form.gradeScale === '5.0' ? '5.0' : '4.0'}
                  className={styles.input}
                  value={form.targetGPA}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="gradeScale">Grading Scale</label>
                <select
                  id="gradeScale"
                  name="gradeScale"
                  className={styles.input}
                  value={form.gradeScale}
                  onChange={handleChange}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="4.0">4.0 Scale (Standard)</option>
                  <option value="5.0">5.0 Scale (Weighted)</option>
                </select>
              </div>
            </div>

            {/* Toggle show password */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                id="showPw"
                checked={showPw}
                onChange={() => setShowPw(!showPw)}
                style={{ accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
              />
              <label htmlFor="showPw" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Show password characters
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
              style={{ marginTop: '0.5rem' }}
            >
              {isLoading ? (
                <div className={styles.spinner} />
              ) : (
                <>
                  <span>Create Account</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className={styles.cardFooter}>
            <p className={styles.footerText}>
              Already have an account?{' '}
              <Link to="/login" className={styles.footerLink}>
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
