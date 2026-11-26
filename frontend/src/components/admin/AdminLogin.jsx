// frontend/src/components/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CornerMarks from '../common/CornerMarks';

export default function AdminLogin({ onClose, onLoginSuccess }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const loggedUser = await login(email, password);
      onLoginSuccess?.(loggedUser);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#EFE5D8] via-[#F7F1E8] to-[#EDE2D3] flex items-center justify-center p-4">
      <div className="bg-atelier-grid pointer-events-none absolute inset-0 opacity-65" />
      <div className="pointer-events-none absolute -top-24 left-1/3 h-96 w-96 rounded-full bg-[#D6A984]/35 blur-[130px]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 max-w-md w-full bg-salon-card rounded-3xl border border-[#B4563E]/30 shadow-[10px_10px_0px_rgba(180,86,62,0.16)] p-6 sm:p-10 space-y-6"
      >
        <CornerMarks all size={12} thickness={2} color="text-[#B4563E]/70" />
        {/* Brand */}
        <div className="text-center space-y-2">
          <h2 className="font-editorial text-3xl font-light text-salon-dark">
            Atelier Management Portal
          </h2>
          <p className="text-xs text-salon-muted font-light">
            Sign in to manage appointments, staff schedules, and atelier settings.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-salon-muted mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-salon-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-salon-border text-sm text-salon-dark focus:outline-none focus:border-salon-primary bg-salon-light/40 focus:bg-salon-card"
                placeholder="admin@salon.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-salon-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-salon-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-salon-border text-sm text-salon-dark focus:outline-none focus:border-salon-primary bg-salon-light/40 focus:bg-salon-card"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs sm:text-sm font-semibold tracking-wide shadow-soft-pink transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#FFFDF8] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {onClose && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-salon-muted hover:text-salon-primary underline"
            >
              Return to Public Atelier
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}
