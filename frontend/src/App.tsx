import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { CropDashboard } from './pages/CropDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  if (user.role === 'admin') return <AdminDashboard />;
  return <CropDashboard />;
};

export const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

