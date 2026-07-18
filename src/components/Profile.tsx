import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, LogOut, Lock, X, AlertCircle, CheckCircle } from 'lucide-react';

interface ProfileProps {
  user: { id: string; name: string; email: string };
  onLogout: () => void;
  onClose: () => void;
}

export default function Profile({ user, onLogout, onClose }: ProfileProps) {
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState(user.email);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setResetMessage('Password reset link has been sent to your email!');
      setTimeout(() => setShowResetPassword(false), 3000);
    } catch (err: any) {
      setResetError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('token');
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
      onLogout(); // Logout anyway
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200"
      >
        {/* Header */}
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-slate-900">Profile</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{user.name}</h3>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>

            {/* Info Cards */}
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Name</div>
                  <div className="text-sm font-medium text-slate-900">{user.name}</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <Mail className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Email</div>
                  <div className="text-sm font-medium text-slate-900">{user.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Reset Section */}
          {!showResetPassword ? (
            <button
              onClick={() => setShowResetPassword(true)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition flex items-center justify-center space-x-2"
            >
              <Lock className="w-5 h-5" />
              <span>Reset Password</span>
            </button>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-slate-900 text-sm">Reset Password</h4>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
                />

                {resetError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-red-700">{resetError}</span>
                  </div>
                )}

                {resetMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-green-700">{resetMessage}</span>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-2 rounded-lg transition text-sm"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetError('');
                      setResetMessage('');
                    }}
                    className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 rounded-lg transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl transition flex items-center justify-center space-x-2 border border-red-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
