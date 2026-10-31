import React from 'react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';
import styles from './Header.module.css';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Your academic overview' },
  '/calculator': { title: 'GPA Calculator', sub: 'Calculate your semester GPA' },
  '/cumulative': { title: 'Cumulative GPA', sub: 'Track your cumulative performance' },
  '/analytics': { title: 'Analytics', sub: 'Visualize and predict your grades' },
  '/settings': { title: 'Settings', sub: 'Customize your preferences' }
};

const Header = ({ onMenuToggle }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const page = pageTitles[location.pathname] || { title: 'GPA Pro', sub: '' };
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className={styles.header}>
      {/* Mobile menu toggle */}
      <button
        className={styles.menuToggle}
        onClick={onMenuToggle}
        aria-label="Toggle navigation menu"
        id="menu-toggle-btn"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Page title */}
      <div className={styles.titleBlock}>
        <h1 className={styles.pageTitle}>{page.title}</h1>
        {page.sub && <p className={styles.pageSub}>{page.sub}</p>}
      </div>

      {/* Right side */}
      <div className={styles.right}>
        {/* Live indicator */}
        <div className={styles.liveIndicator}>
          <div className={styles.liveDot} />
          <span className={styles.liveText}>{dateStr} &middot; {timeStr}</span>
        </div>

        {/* User avatar */}
        {user && (
          <div className={styles.headerAvatar} title={user.name}>
            {user.initials || user.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
