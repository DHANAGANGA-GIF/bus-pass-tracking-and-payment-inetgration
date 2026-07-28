import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { Route, PassDuration, DURATION_DISCOUNTS } from '@bus-pass/shared';
import { Bus, Calendar, CreditCard, ShieldCheck, Ticket, CheckCircle2, QrCode } from 'lucide-react';

export const BookPassPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [duration, setDuration] = useState<PassDuration>(PassDuration.MONTHLY);
  const [passengerType, setPassengerType] = useState<string>('GENERAL');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'SELECT' | 'PAYMENT' | 'SUCCESS'>('SELECT');
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/routes');
      if (res.data.success) {
        setRoutes(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedRouteId(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch routes', err);
    }
  };

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  // Calculate fare breakdown
  const multiplier = DURATION_DISCOUNTS[duration] || 1.0;
  let baseFare = (selectedRoute?.baseMonthlyFare || 1000) * multiplier;
  if (passengerType === 'STUDENT') baseFare *= 0.5;
  if (passengerType === 'SENIOR_CITIZEN') baseFare *= 0.7;
  const gstAmount = baseFare * 0.18;
  const totalAmount = baseFare + gstAmount;

  const handleInitiateBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/bookings', {
        routeId: selectedRouteId,
        duration,
        startDate,
        passengerType,
        studentIdNumber: studentId || undefined
      });

      if (res.data.success) {
        setBookingResult(res.data.data);
        setStep('PAYMENT');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      // 1. Initialize Payment
      const initRes = await api.post('/payments/initialize', {
        bookingId: bookingResult.booking.id,
        gateway: 'RAZORPAY',
        amount: totalAmount
      });

      if (initRes.data.success) {
        const paymentData = initRes.data.data;

        // 2. Verify Payment
        const verifyRes = await api.post('/payments/verify', {
          paymentId: paymentData.paymentId,
          orderId: paymentData.gatewayOrder,
          signature: 'simulated_valid_razorpay_signature'
        });

        if (verifyRes.data.success) {
          setStep('SUCCESS');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Book Digital Bus Pass</h1>
        <p className="text-sm text-slate-400 mt-1">Instant QR generation & instant activation</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {step === 'SELECT' && (
        <div className="glass-panel p-8 space-y-6">
          {/* Route Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Bus Route</label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="glass-input w-full"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                  {r.routeCode} — {r.source} to {r.destination} ({r.distanceKm} km)
                </option>
              ))}
            </select>
          </div>

          {/* Pass Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Pass Duration</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: PassDuration.MONTHLY, label: '1 Month', tag: 'Standard' },
                { type: PassDuration.QUARTERLY, label: '3 Months', tag: '10% OFF' },
                { type: PassDuration.HALF_YEARLY, label: '6 Months', tag: '15% OFF' },
                { type: PassDuration.YEARLY, label: '1 Year', tag: '20% OFF' }
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setDuration(item.type)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    duration === item.type
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-bold">{item.label}</div>
                  <div className="text-xs text-blue-400 font-semibold mt-1">{item.tag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Passenger Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Passenger Category</label>
              <select
                value={passengerType}
                onChange={(e) => setPassengerType(e.target.value)}
                className="glass-input w-full"
              >
                <option value="GENERAL" className="bg-slate-900 text-white">General Commuter</option>
                <option value="STUDENT" className="bg-slate-900 text-white">Student (50% Concession)</option>
                <option value="SENIOR_CITIZEN" className="bg-slate-900 text-white">Senior Citizen (30% Concession)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Pass Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input w-full"
              />
            </div>
          </div>

          {/* Fare Summary */}
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Base Pass Fare ({duration})</span>
              <span>₹{baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST Tax (18%)</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white text-base">
              <span>Total Amount Payable</span>
              <span className="text-blue-400">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleInitiateBooking}
            disabled={loading}
            className="glass-btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
            <CreditCard className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 'PAYMENT' && (
        <div className="glass-panel p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <CreditCard className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Razorpay / Stripe Secure Payment Gateway</h2>
          <p className="text-slate-400 text-sm">
            Simulating live credit card, debit card, or UPI checkout for pass number{' '}
            <strong className="text-white">{bookingResult.busPass.passNumber}</strong>
          </p>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 max-w-sm mx-auto text-left text-sm space-y-2">
            <div className="flex justify-between"><span className="text-slate-400">Merchant:</span><span className="text-white">BusPass Pro Inc.</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Amount:</span><span className="text-emerald-400 font-bold">₹{totalAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Status:</span><span className="text-yellow-400">Awaiting Auth</span></div>
          </div>

          <button
            onClick={handleSimulatePayment}
            disabled={loading}
            className="glass-btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
          >
            {loading ? 'Authorizing Payment...' : 'Pay ₹' + totalAmount.toFixed(2) + ' Now'}
            <ShieldCheck className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 'SUCCESS' && (
        <div className="glass-panel p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white">Pass Booked Successfully!</h2>
          <p className="text-slate-400 text-sm">
            Your digital bus pass is now <strong className="text-emerald-400">ACTIVE</strong> and verified.
          </p>

          {/* Digital Bus Pass Card Preview */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border border-blue-500/30 max-w-md mx-auto text-left shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-400 tracking-wider">BUSPASS PRO</span>
                <div className="text-lg font-extrabold text-white">{bookingResult.busPass.passNumber}</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">ACTIVE</span>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={bookingResult.busPass.qrCodeData}
                alt="Digital Pass QR"
                className="w-28 h-28 rounded-lg bg-white p-1"
              />
              <div className="text-xs space-y-1">
                <div><span className="text-slate-400">Passenger:</span> <strong className="text-white">{bookingResult.busPass.passengerName}</strong></div>
                <div><span className="text-slate-400">Route:</span> <strong className="text-white">{selectedRoute?.routeCode}</strong></div>
                <div><span className="text-slate-400">Source:</span> <span className="text-slate-200">{selectedRoute?.source}</span></div>
                <div><span className="text-slate-400">Destination:</span> <span className="text-slate-200">{selectedRoute?.destination}</span></div>
                <div><span className="text-slate-400">Valid Till:</span> <strong className="text-emerald-400">{new Date(bookingResult.busPass.expiryDate).toLocaleDateString()}</strong></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="glass-btn-primary px-8 py-3 text-sm"
          >
            Go to User Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
