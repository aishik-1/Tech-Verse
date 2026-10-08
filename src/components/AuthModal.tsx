import React, { useState } from 'react';
import { db } from '../services/db';
import { useToast } from './Toast';
import {
  X,
  Eye,
  EyeOff,
  Sparkles,
  Trophy,
  Users,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (!isLogin && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (isLogin) {
        const res = db.login(email, password);
        setLoading(false);
        if (res.success && res.user) {
          showToast('success', `Welcome back, ${res.user.full_name}!`);
          onSuccess();
          onClose();
        } else {
          setErrorMessage(res.error || 'Failed to sign in. Please verify credentials.');
        }
      } else {
        const res = db.signup(fullName, email, password);
        setLoading(false);
        if (res.success && res.user) {
          showToast('success', 'Profile Created!', `Welcome to TechVerse, ${res.user.full_name}.`);
          onSuccess();
          onClose();
        } else {
          setErrorMessage(res.error || 'Signup failed.');
        }
      }
    }, 450);
  };

  // Quick Switcher for immediate testing
  const handleQuickLogin = (demoEmail: string) => {
    setLoading(true);
    setTimeout(() => {
      const res = db.login(demoEmail);
      setLoading(false);
      if (res.success && res.user) {
        showToast('success', `Logged in as ${res.user.full_name} (${res.user.role})`);
        onSuccess();
        onClose();
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#191a1e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[560px]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-white/50 hover:text-white rounded-full bg-[#131418]/60 hover:bg-[#131418] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: TechVerse Branding & Visuals (Byotone Aesthetic) */}
        <div className="w-full md:w-5/12 bg-[#131418] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-[#acffce]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#acffce] shadow-[0_0_10px_#acffce]" />
              <div>
                <h3 className="font-display font-bold text-lg text-white tracking-[0.14em]">TECHVERSE</h3>
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">BST TECH CLUB</p>
              </div>
            </div>

            <p className="text-xs text-white/60 leading-relaxed pt-2">
              The high-prestige digital headquarters for college developers, hackers, and open-source contributors.
            </p>

            {/* Feature Highlights in Byotone minimal style */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-xs text-white/70">
                <span className="text-[#acffce] font-mono text-[11px] font-bold">01 //</span>
                <span>Track Hacktoberfest 2026 PR Badges</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/70">
                <span className="text-[#89eefa] font-mono text-[11px] font-bold">02 //</span>
                <span>Showcase Verified Hackathon Podiums</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/70">
                <span className="text-[#a2a7ff] font-mono text-[11px] font-bold">03 //</span>
                <span>Realtime Community Chat & Squads</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/70">
                <span className="text-[#ffe990] font-mono text-[11px] font-bold">04 //</span>
                <span>Spark & Vote on Campus Prototypes</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Switcher */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              Instant Access Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('aishik.roy1234@gmail.com')}
                className="px-2.5 py-1.5 rounded-lg bg-[#191a1e] hover:bg-[#202227] border border-white/10 hover:border-[#acffce]/40 text-[11px] font-mono text-white/80 transition-colors text-left truncate cursor-pointer"
                title="Login as Aishik Roy (Core Lead)"
              >
                Lead: Aishik
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('sneha.patel@bst.edu')}
                className="px-2.5 py-1.5 rounded-lg bg-[#191a1e] hover:bg-[#202227] border border-white/10 hover:border-white/30 text-[11px] font-mono text-white/80 transition-colors text-left truncate cursor-pointer"
                title="Login as Sneha Patel (Student)"
              >
                Student: Sneha
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Authentication Form */}
        <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-center bg-[#191a1e]">
          {/* Toggle Login / Signup */}
          <div className="flex items-center gap-1.5 p-1 bg-[#131418] rounded-full border border-white/10 max-w-xs mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrorMessage('');
              }}
              className={`flex-1 py-1 px-3 text-xs font-mono uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                isLogin
                  ? 'bg-[#acffce] text-[#191a1e] font-semibold shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-1 px-3 text-xs font-mono uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                !isLogin
                  ? 'bg-[#acffce] text-[#191a1e] font-semibold shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Join Club
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">
              {isLogin ? 'Access TechVerse Portal' : 'Create Student Account'}
            </h2>
            <p className="text-xs text-white/50 mt-1">
              {isLogin
                ? 'Enter your student credentials to continue.'
                : 'Join BST Tech Club. Profile is generated automatically upon signup.'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aishik Roy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#131418] border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#acffce] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@bst.edu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#131418] border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#acffce] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#131418] border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#acffce] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="button-orbit is-primary w-full !py-3 !text-xs !font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-[#191a1e]/30 border-t-[#191a1e] rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Portal' : 'Create TechVerse Profile'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-[11px] font-mono text-white/40 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#acffce]" />
              <span>Instant activation • Email confirmation OFF</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
