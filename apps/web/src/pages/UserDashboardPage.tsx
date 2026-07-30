import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { Booking } from '@bus-pass/shared';
import { Bus, Calendar, Download, RefreshCw, Ticket, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setTokens, fetchCurrentUser } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle OAuth token injection from URL params (Google OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      // Strip sensitive tokens from URL immediately
      window.history.replaceState({}, document.title, '/dashboard');
      fetchCurrentUser();
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, []);


  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/user');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const activePass = bookings.find((b) => b.busPass && b.busPass.status === 'ACTIVE')?.busPass;

  const downloadPdfPass = (pass: any, route: any) => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); // slate-900 background
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('BUSPASS PRO — OFFICIAL DIGITAL PASS', 20, 30);

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text(`Pass Number: ${pass.passNumber}`, 20, 50);

    doc.setFontSize(12);
    doc.setTextColor(203, 213, 225);
    doc.text(`Passenger Name: ${user?.fullName}`, 20, 70);
    doc.text(`Route Code: ${route?.routeCode}`, 20, 85);
    doc.text(`Source: ${route?.source}`, 20, 100);
    doc.text(`Destination: ${route?.destination}`, 20, 115);
    doc.text(`Status: ACTIVE`, 20, 130);
    doc.text(`Valid Till: ${new Date(pass.expiryDate).toLocaleDateString()}`, 20, 145);

    doc.save(`${pass.passNumber}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {user?.fullName}!</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your active bus passes, bookings, and digital transit credentials</p>
        </div>
      </div>

      {/* Active Pass Card */}
      {activePass ? (
        <div className="glass-panel p-8 border border-blue-500/30 relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">
                Active Pass
              </span>
              <h2 className="text-2xl font-bold text-white">{activePass.passNumber}</h2>
              <div className="text-sm text-slate-300 space-y-1">
                <div>Passenger: <strong className="text-white">{activePass.passengerName}</strong></div>
                <div>Duration: <span className="text-blue-400 font-semibold">{activePass.duration}</span></div>
                <div>Expiry Date: <strong className="text-emerald-400">{new Date(activePass.expiryDate).toLocaleDateString()}</strong></div>
              </div>
              <button
                onClick={() => downloadPdfPass(activePass, activePass.routeDetails)}
                className="glass-btn-primary py-2 px-5 text-sm flex items-center gap-2 mt-4"
              >
                <Download className="w-4 h-4" />
                Download PDF Pass
              </button>
            </div>

            <div className="text-center p-4 bg-white rounded-2xl">
              <img src={activePass.qrCodeData} alt="Pass QR" className="w-36 h-36 mx-auto" />
              <span className="text-[10px] text-slate-600 font-mono font-bold block mt-2">SCAN TO VERIFY</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 text-center space-y-4">
          <Ticket className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Active Bus Pass</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You do not currently have an active bus pass. Book a new pass to start commuting immediately.
          </p>
        </div>
      )}

      {/* Booking History Table */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Pass Booking History</h3>
        {bookings.length === 0 ? (
          <p className="text-sm text-slate-400">No booking history recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Route</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Fare Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Booked On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">{b.route?.routeCode} ({b.route?.source} → {b.route?.destination})</td>
                    <td className="p-3">{b.duration}</td>
                    <td className="p-3 text-emerald-400 font-semibold">₹{b.fareAmount.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        b.status === 'APPROVED' || b.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3">{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
