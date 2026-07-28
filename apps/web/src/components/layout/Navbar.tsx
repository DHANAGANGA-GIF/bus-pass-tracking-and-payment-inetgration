import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Bus, Shield, User, LogOut, Bell, Ticket, LayoutDashboard, QrCode } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
                BusPass<span className="text-blue-500">Pro</span>
              </span>
              <span className="block text-[10px] text-slate-400 tracking-wider font-semibold uppercase">
                Enterprise Transit
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/routes" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
              <Bus className="w-4 h-4 text-blue-500" />
              Routes & Fares
            </Link>
            <Link to="/book" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-indigo-500" />
              Book Pass
            </Link>
            {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
              <Link to="/admin" className="hover:text-purple-400 transition-colors flex items-center gap-1.5 text-purple-400 font-semibold">
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            ) : null}
            {user?.role === 'STAFF' || user?.role === 'ADMIN' ? (
              <Link to="/verify" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-emerald-400 font-semibold">
                <QrCode className="w-4 h-4" />
                QR Verifier
              </Link>
            ) : null}
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 glass-card px-3 py-1.5 hover:bg-slate-800/60"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white text-sm">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-white">{user.fullName}</div>
                    <div className="text-[10px] text-slate-400">{user.role}</div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel py-2 shadow-2xl border border-slate-800 z-50">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-400" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    >
                      <User className="w-4 h-4 text-indigo-400" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-slate-800/80 hover:text-rose-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="glass-btn-secondary text-sm">
                  Sign In
                </Link>
                <Link to="/register" className="glass-btn-primary text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
