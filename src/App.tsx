"use client";

import { useState, useEffect } from 'react';
import { LandingPage } from './views/Landing';
import { AuthPage } from './views/Auth';
import { Dashboard } from './views/Dashboard';
import { useAuth, useNotifications } from './hooks';
import { ToastContainer } from './components/Toast';

type View = 'landing' | 'login' | 'register' | 'dashboard';

export default function App() {
  const { user, login, logout, isAuthenticated, loading } = useAuth();
  const { notifications, addNotification } = useNotifications();
  const [view, setView] = useState<View>('landing');

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        setView('dashboard');
      } else {
        setView('landing');
      }
    }
  }, [loading, isAuthenticated]);

  const handleAuthSuccess = (userData: any) => {
    login(userData);
    setView('dashboard');
    addNotification('Успішний вхід', 'success');
  };

  const handleLogout = () => {
    logout();
    setView('landing');
    addNotification('Ви вийшли з системи', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {loading && (
        <div className="flex items-center justify-center min-h-screen text-slate-500">
          Завантаження...
        </div>
      )}

      {!loading && view === 'landing' && (
        <LandingPage
          onStart={() => setView('register')}
          onLogin={() => setView('login')}
          onRegister={() => setView('register')}
        />
      )}

      {!loading && (view === 'login' || view === 'register') && (
        <AuthPage
          type={view}
          onBack={() => setView('landing')}
          onSuccess={handleAuthSuccess}
        />
      )}

      {!loading && view === 'dashboard' && user && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          addNotification={addNotification}
        />
      )}

      <ToastContainer notifications={notifications} />
    </div>
  );
}
