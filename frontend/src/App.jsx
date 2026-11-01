import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useAuthStore from './store/authStore.js';
import Layout from './components/layout/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CalculatorPage from './pages/CalculatorPage.jsx';
import CumulativePage from './pages/CumulativePage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

const App = () => {
  const location = useLocation();
  const { isAuthenticated, refreshUser, token } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      refreshUser();
    }
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <motion.div key="login" {...pageVariants}>
                <LoginPage />
              </motion.div>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <motion.div key="register" {...pageVariants}>
                <RegisterPage />
              </motion.div>
            </PublicRoute>
          }
        />

        {/* Protected routes inside Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<motion.div key="dashboard" {...pageVariants}><DashboardPage /></motion.div>} />
          <Route path="calculator" element={<motion.div key="calculator" {...pageVariants}><CalculatorPage /></motion.div>} />
          <Route path="cumulative" element={<motion.div key="cumulative" {...pageVariants}><CumulativePage /></motion.div>} />
          <Route path="analytics" element={<motion.div key="analytics" {...pageVariants}><AnalyticsPage /></motion.div>} />
          <Route path="settings" element={<motion.div key="settings" {...pageVariants}><SettingsPage /></motion.div>} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
