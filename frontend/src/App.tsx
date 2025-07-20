import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HRDashboardPage from './pages/HRDashboardPage';
import OnboardingFlow from './components/OnboardingFlow';
import Header from './components/Header';
import NotificationCenter from './components/NotificationCenter';
import LoadingSpinner from './components/LoadingSpinner';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        {isAuthenticated && <Header />}
        <NotificationCenter />
        
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? (
              user?.role === 'hr' ? <HRDashboardPage /> : <DashboardPage />
            ) : <Navigate to="/login" />} 
          />
          <Route 
            path="/hr-dashboard" 
            element={isAuthenticated && user?.role === 'hr' ? <HRDashboardPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/onboarding" 
            element={isAuthenticated ? <OnboardingFlow /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to={isAuthenticated && user?.role === 'hr' ? "/hr-dashboard" : "/dashboard"} />} />
        </Routes>
      </Router>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <OnboardingProvider>
          <AppContent />
        </OnboardingProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;