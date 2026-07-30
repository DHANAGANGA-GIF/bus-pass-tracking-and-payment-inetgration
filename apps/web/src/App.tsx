import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BookPassPage } from './pages/BookPassPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminPage } from './pages/AdminPage';
import { QrVerifierPage } from './pages/QrVerifierPage';
import { SocketProvider } from './contexts/SocketContext';
import { AiChatWidget } from './components/AiChatWidget';

export const App: React.FC = () => {
  const { fetchCurrentUser, isLoading, user } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm font-medium">
        Loading BusPass Pro Engine...
      </div>
    );
  }

  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/routes" element={<LandingPage />} />
              <Route path="/book" element={<BookPassPage />} />
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/admin" element={user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? <AdminPage /> : <Navigate to="/" />} />
              <Route path="/verify" element={<QrVerifierPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-slate-950/80">
            &copy; 2026 BusPass Pro. Commercial Bus Booking Platform. Enterprise Grade.
          </footer>
        </div>
      </Router>
      <AiChatWidget />
    </SocketProvider>
  );
};

export default App;
