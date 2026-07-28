import React, { useState } from 'react';
import { api } from '../lib/api';
import { QrCode, ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const QrVerifierPage: React.FC = () => {
  const [qrString, setQrString] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerificationResult(null);
    setLoading(true);

    try {
      const res = await api.post('/admin/verify-qr', { qrString });
      setVerificationResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Forgery detected or invalid QR format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="glass-panel p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
            <QrCode className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Digital Pass Scanner & Inspector</h1>
          <p className="text-sm text-slate-400">Scan or paste QR payload for cryptographic HMAC integrity verification</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">QR Code Raw Data String</label>
            <textarea
              rows={4}
              required
              value={qrString}
              onChange={(e) => setQrString(e.target.value)}
              placeholder='Paste raw QR payload e.g. {"data":"...","sig":"..."}'
              className="glass-input w-full font-mono text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glass-btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? 'Verifying HMAC Signature...' : 'Inspect & Verify Pass'}
            <ShieldCheck className="w-5 h-5" />
          </button>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-3">
            <XCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <div className="font-bold">FORGERY / INVALID PASS</div>
              <div className="text-xs">{error}</div>
            </div>
          </div>
        )}

        {verificationResult && (
          <div className={`p-6 rounded-2xl border space-y-4 ${
            verificationResult.valid ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-rose-500/10 border-rose-500/40'
          }`}>
            <div className="flex items-center gap-3">
              {verificationResult.valid ? (
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              )}
              <div>
                <h3 className="text-lg font-bold text-white">{verificationResult.message}</h3>
                <p className="text-xs text-slate-400">Cryptographic Signature Validated</p>
              </div>
            </div>

            {verificationResult.data && (
              <div className="p-4 rounded-xl bg-slate-950/80 text-xs space-y-1 text-slate-300 font-mono">
                <div><strong>Pass Number:</strong> {verificationResult.data.passNumber}</div>
                <div><strong>Passenger:</strong> {verificationResult.data.passengerName}</div>
                <div><strong>Route:</strong> {verificationResult.data.routeCode} ({verificationResult.data.source} → {verificationResult.data.destination})</div>
                <div><strong>Validity:</strong> {new Date(verificationResult.data.expiryDate).toLocaleDateString()}</div>
                <div><strong>Status:</strong> <span className="text-emerald-400 font-bold">{verificationResult.data.status}</span></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
