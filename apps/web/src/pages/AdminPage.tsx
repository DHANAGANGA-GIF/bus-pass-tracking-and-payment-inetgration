import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Shield, Users, Bus, Ticket, DollarSign, Check, X, QrCode } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [passes, setPasses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'PASSES'>('OVERVIEW');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, passesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/passes')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (passesRes.data.success) setPasses(passesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewPass = async (passId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await api.post('/admin/passes/review', { passId, status });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to review pass', err);
    }
  };

  const handleToggleUser = async (userId: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/suspend`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to suspend user', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-purple-400" />
            Admin Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">Enterprise management, pass approvals, and revenue analytics</p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 glass-panel p-1">
          {(['OVERVIEW', 'USERS', 'PASSES'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6">
            <Users className="w-6 h-6 text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            <div className="text-xs text-slate-400">Total Users</div>
          </div>
          <div className="glass-panel p-6">
            <Ticket className="w-6 h-6 text-indigo-400 mb-2" />
            <div className="text-2xl font-bold text-white">{stats.activePasses}</div>
            <div className="text-xs text-slate-400">Active Bus Passes</div>
          </div>
          <div className="glass-panel p-6">
            <Bus className="w-6 h-6 text-emerald-400 mb-2" />
            <div className="text-2xl font-bold text-white">{stats.pendingPasses}</div>
            <div className="text-xs text-slate-400">Pending Approvals</div>
          </div>
          <div className="glass-panel p-6">
            <DollarSign className="w-6 h-6 text-yellow-400 mb-2" />
            <div className="text-2xl font-bold text-white">₹{stats.totalRevenue.toFixed(2)}</div>
            <div className="text-xs text-slate-400">Total System Revenue</div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'USERS' && (
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Registered Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="p-3 font-semibold text-white">{u.fullName}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.phoneNumber}</td>
                    <td className="p-3 font-mono text-xs text-blue-400">{u.role}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.isSuspended ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleUser(u.id)}
                        className="px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Passes Tab */}
      {activeTab === 'PASSES' && (
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Pass Applications & Reviews</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Pass Number</th>
                  <th className="p-3">Passenger</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {passes.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3 font-mono font-bold text-white">{p.passNumber}</td>
                    <td className="p-3">{p.passengerName}</td>
                    <td className="p-3">{p.route?.routeCode}</td>
                    <td className="p-3">{p.duration}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.status === 'ACTIVE' || p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      {p.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleReviewPass(p.id, 'APPROVED')}
                            className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReviewPass(p.id, 'REJECTED')}
                            className="p-1.5 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/40"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
