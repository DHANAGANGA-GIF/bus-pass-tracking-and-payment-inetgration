import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../lib/api';
import { Bus, Lock, Mail, ArrowRight, ShieldCheck, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setTokens, fetchCurrentUser } = useAuthStore();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await api.post('/auth/login', { emailOrPhone, password });
      if (res.data.success) {
        setTokens(res.data.data.accessToken, res.data.data.refreshToken);
        await fetchCurrentUser();
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg glass-panel p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-3">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Sign In to BusPass Pro</h2>
          <p className="text-sm text-slate-400">Access your digital passes and transit history</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Email Address or Phone Number</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="commuter@gmail.com or 9123456789"
                className="glass-input w-full pl-10"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-blue-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input w-full pl-10"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="glass-btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        
        {/* Google Sign In Link */}
        <div className="mt-6 text-center">
          <a href="/api/auth/google" className="glass-btn-secondary w-full py-3 flex items-center justify-center gap-2 text-sm">
            <LogIn className="w-4 h-4 text-blue-400" />
            Sign in with Google
          </a>
        </div>
        
        {/* Demo Account Banner */}
        <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-300">
          <div className="font-bold text-blue-400 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Demo Quick Login Credentials:
          </div>
          <div className="space-y-1 mt-2">
            <div><strong className="text-white">Admin:</strong> admin@buspass.com / Admin@12345</div>
            <div><strong className="text-white">Staff:</strong> conductor@buspass.com / Admin@12345</div>
            <div><strong className="text-white">User:</strong> commuter@gmail.com / User@12345</div>
          </div>
        </div>
      </div>
    </div>
  );
};