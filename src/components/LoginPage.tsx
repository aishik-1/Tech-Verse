import React, { useState } from 'react';
import { db } from '../services/db';
import { useToast } from './Toast';
import { TplhWebglScene, TplhTheme } from './TplhWebglScene';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GitPullRequest,
  Terminal,
  Cpu,
  Trophy,
  ArrowLeft,
  UserCheck,
  Zap,
  Lock,
  User,
  Activity,
  Layers,
} from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBackToHome }) => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [theme, setTheme] = useState<TplhTheme>('gold');

  // Warp transition state (tplh.net warp hyperdrive sequence)
  const [isWarping, setIsWarping] = useState(false);
  const [warpStatusText, setWarpStatusText] = useState('AUTHENTICATING STUDENT CITADEL...');
  const [warpProgress, setWarpProgress] = useState(0);

  // Form states - support username OR college email
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration form states
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [year, setYear] = useState('2nd Year');
  const [domain, setDomain] = useState<'open_source' | 'cp' | 'robotics' | 'hackathon'>('open_source');

  // Play subtle futuristic audio chime using Web Audio API
  const playCyberChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const executeWarpAndEnter = (userNameStr: string) => {
    setIsWarping(true);
    playCyberChime();
    setWarpStatusText(`IDENTIFIED: ${userNameStr.toUpperCase()}`);

    let p = 0;
    const interval = setInterval(() => {
      p += 15;
      setWarpProgress(Math.min(100, p));
      if (p === 30) setWarpStatusText('ENGAGING 3D VORTEX PIPELINE...');
      if (p === 60) setWarpStatusText('SYNCHRONIZING CITADEL STATE...');
      if (p === 90) setWarpStatusText('ENTERING TECH CITADEL DASHBOARD...');
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onSuccess();
        }, 300);
      }
    }, 120);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim() || !usernameOrEmail.trim() || !password.trim()) {
          setErrorMsg('Please enter your full name, username/email, and password.');
          setLoading(false);
          return;
        }

        const emailFormatted = usernameOrEmail.includes('@')
          ? usernameOrEmail.trim()
          : `${usernameOrEmail.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@bst.edu`;

        const res = db.signup(fullName.trim(), emailFormatted, password);

        if (res.success && res.user) {
          db.updateProfile(res.user.id, {
            roll_number: rollNumber.trim() || 'BST/24/099',
            year,
            bio: `BST Tech Club Member // Track: ${
              domain === 'open_source'
                ? 'Open Source & Git Engineering'
                : domain === 'cp'
                ? 'Competitive Programming & DSA'
                : domain === 'robotics'
                ? 'Robotics & Hardware Systems'
                : 'Hackathons & National Podiums'
            }.`,
          });

          showToast('success', 'Profile Created!', `Welcome to TechVerse, ${fullName.split(' ')[0]}.`);
          executeWarpAndEnter(fullName.split(' ')[0]);
        } else {
          setErrorMsg(res.error || 'Failed to register account.');
          setLoading(false);
        }
      } else {
        if (!usernameOrEmail.trim() || !password.trim()) {
          setErrorMsg('Please enter your username / college email and password.');
          setLoading(false);
          return;
        }

        // Try direct login, or match by username/roll number
        let loginIdentifier = usernameOrEmail.trim();
        if (!loginIdentifier.includes('@')) {
          // Check if username corresponds to an existing user email
          const allProfiles = db.getProfiles();
          const match = allProfiles.find(
            (p) =>
              p.email.toLowerCase().startsWith(loginIdentifier.toLowerCase()) ||
              p.roll_number?.toLowerCase() === loginIdentifier.toLowerCase() ||
              p.full_name.toLowerCase().replace(/\s+/g, '').includes(loginIdentifier.toLowerCase())
          );
          if (match) {
            loginIdentifier = match.email;
          } else {
            loginIdentifier = `${loginIdentifier.toLowerCase()}@bst.edu`;
          }
        }

        const res = db.login(loginIdentifier, password);

        if (res.success && res.user) {
          showToast('success', 'Access Granted', 'Welcome back to TechVerse.');
          executeWarpAndEnter(res.user.full_name.split(' ')[0]);
        } else {
          setErrorMsg(res.error || 'Invalid username or password.');
          setLoading(false);
        }
      }
    } catch {
      setErrorMsg('An unexpected authentication error occurred.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await db.loginWithGoogle();
      if (res.success && res.user) {
        showToast('success', 'Firebase Authenticated', `Welcome back, ${res.user.full_name.split(' ')[0]}!`);
        executeWarpAndEnter(res.user.full_name.split(' ')[0]);
      } else {
        setErrorMsg(res.error || 'Google sign-in was cancelled or failed.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Google authentication failed.');
      setLoading(false);
    }
  };

  const handleQuickLogin = (userId: string, name: string) => {
    db.switchUser(userId);
    showToast('success', `Signed in as ${name}`);
    executeWarpAndEnter(name);
  };

  return (
    <div className="relative min-h-screen bg-[#131215] text-white/80 selection:bg-[#ffd166]/25 selection:text-[#ffd166] flex flex-col justify-between overflow-x-hidden">
      {/* 3D WebGL Canvas Layer (tplh.net Yoichi Kobayashi 3D Core + Aura + Petals) */}
      <div className="fixed inset-0 z-0">
        <TplhWebglScene
          colorScheme={theme}
          isWarping={isWarping}
          particleCount={580}
        />
      </div>

      {/* Cyber Grid Overlay */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, transparent 60%, #131215 100%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
        }}
      />

      {/* Top Header / Coordinates (tplh.net editorial header) */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between font-mono text-xs text-white/40 uppercase tracking-widest">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            disabled={isWarping}
            className="flex items-center gap-2 hover:text-[#ffd166] transition-colors cursor-pointer text-white/60 disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Landing Page</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Palette Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-[#18161c]/80 border border-white/10 text-[10px]">
            {(['gold', 'cyan', 'purple'] as TplhTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2 py-0.5 rounded-full uppercase tracking-wider transition-all cursor-pointer ${
                  theme === t
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#06d6a0] animate-pulse" />
            <span className="text-white/70">TPLH // PORTAL ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Grid */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Tech Club Intro & 4 Pillar Highlights */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1a20]/90 border border-white/10 text-[11px] font-mono text-[#ffd166]">
              <Sparkles className="w-3.5 h-3.5 text-[#ffd166]" />
              <span>BST TECH CLUB • CITADEL ENTRY GATEWAY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight leading-[1.12]">
              Authenticate into the student technology citadel.
            </h1>

            <p className="text-sm text-white/65 leading-relaxed font-sans max-w-md">
              Log in with your username and password to enter the club dashboard. Track open source commits, submit hackathon podium trophies, participate in ICPC contests, and collaborate with student engineers.
            </p>

            {/* 4 Pillars Badge Strip */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#18161c]/80 border border-white/10 space-y-1 hover:border-[#acffce]/40 transition-colors">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#acffce]">
                  <GitPullRequest className="w-3.5 h-3.5" />
                  <span>Open Source</span>
                </div>
                <p className="text-[11px] text-white/50">Hacktoberfest PRs & Repos</p>
              </div>

              <div className="p-3 rounded-xl bg-[#18161c]/80 border border-white/10 space-y-1 hover:border-[#89eefa]/40 transition-colors">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#89eefa]">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>ICPC / CP</span>
                </div>
                <p className="text-[11px] text-white/50">Algorithms & Contests</p>
              </div>

              <div className="p-3 rounded-xl bg-[#18161c]/80 border border-white/10 space-y-1 hover:border-[#ffd166]/40 transition-colors">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ffd166]">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Robotics & IoT</span>
                </div>
                <p className="text-[11px] text-white/50">ROS2 & Microcontrollers</p>
              </div>

              <div className="p-3 rounded-xl bg-[#18161c]/80 border border-white/10 space-y-1 hover:border-[#a2a7ff]/40 transition-colors">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#a2a7ff]">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Hackathons</span>
                </div>
                <p className="text-[11px] text-white/50">SIH & Innovation Sprints</p>
              </div>
            </div>

            {/* Quick Demo Access Pills */}
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-2">
                1-Click Student & Lead Accounts:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isWarping}
                  onClick={() => handleQuickLogin('usr_aishik', 'Aishik Roy')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#acffce] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Aishik (Lead)</span>
                </button>
                <button
                  type="button"
                  disabled={isWarping}
                  onClick={() => handleQuickLogin('usr_priya', 'Priya Sharma')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#89eefa] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Priya (SIH Lead)</span>
                </button>
                <button
                  type="button"
                  disabled={isWarping}
                  onClick={() => handleQuickLogin('usr_rohan', 'Rohan Verma')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#ffd166] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Rohan (CP Lead)</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Sleek Authentication Card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="lg:col-span-6 flex justify-center"
          >
            <div className="w-full max-w-md rounded-3xl bg-[#19171d]/90 border border-white/15 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/80 space-y-6 relative overflow-hidden">
              {/* Subtle top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd166] to-transparent opacity-60" />

              {/* Login / Sign Up Toggle */}
              <div className="flex rounded-xl bg-[#121115] p-1 border border-white/10 text-xs font-mono uppercase tracking-wider">
                <button
                  type="button"
                  disabled={isWarping}
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-[#ffd166] text-[#131215] shadow-md shadow-[#ffd166]/20'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  disabled={isWarping}
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-[#ffd166] text-[#131215] shadow-md shadow-[#ffd166]/20'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Register Student
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono animate-in fade-in duration-200">
                  {errorMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-white/50 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isWarping}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aishik Roy"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#121115] border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#ffd166] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-white/50 mb-1">
                          Roll Number
                        </label>
                        <input
                          type="text"
                          required
                          disabled={isWarping}
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          placeholder="BST/23/042"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#121115] border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#ffd166] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-white/50 mb-1">
                          Current Year
                        </label>
                        <select
                          value={year}
                          disabled={isWarping}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#121115] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ffd166] transition-colors cursor-pointer"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-white/50 mb-1">
                        Primary Tech Domain
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'open_source', label: 'Open Source' },
                          { id: 'cp', label: 'ICPC / CP' },
                          { id: 'robotics', label: 'Robotics' },
                          { id: 'hackathon', label: 'Hackathons' },
                        ].map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            disabled={isWarping}
                            onClick={() => setDomain(d.id as any)}
                            className={`px-2.5 py-2 rounded-lg text-[11px] font-mono uppercase text-center transition-all cursor-pointer ${
                              domain === d.id
                                ? 'bg-[#ffd166]/20 border border-[#ffd166] text-[#ffd166] font-bold'
                                : 'bg-[#121115] border border-white/10 text-white/50 hover:text-white'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-mono uppercase text-white/50 mb-1">
                    {mode === 'signup' ? 'College Email / Username' : 'Username or College Email'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      disabled={isWarping}
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder={mode === 'signup' ? 'student@bst.edu' : 'e.g. aishik.roy or student@bst.edu'}
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-[#121115] border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#ffd166] transition-colors font-mono"
                    />
                    <User className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono uppercase text-white/50">
                      Password
                    </label>
                    <span className="text-[10px] font-mono text-white/30">Secure Auth</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={isWarping}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 pl-9 pr-10 rounded-xl bg-[#121115] border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#ffd166] transition-colors font-mono"
                    />
                    <Lock className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      disabled={isWarping}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || isWarping}
                  className="w-full py-3.5 rounded-xl bg-[#ffd166] hover:bg-[#ffe082] text-[#131215] font-display font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#ffd166]/20 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50 active:scale-[0.98]"
                >
                  {isWarping ? (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 animate-spin text-[#131215]" />
                      <span>INITIALIZING CITADEL...</span>
                    </span>
                  ) : loading ? (
                    <span>Calibrating Gateway...</span>
                  ) : mode === 'signup' ? (
                    <>
                      <span>Register & Create Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Enter TechVerse Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Federated Google Firebase Sign-in */}
              <div className="relative flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative px-3 bg-[#19171d] text-[10px] font-mono uppercase text-white/40 tracking-wider">
                  or secure federated login
                </div>
              </div>

              <button
                type="button"
                disabled={loading || isWarping}
                onClick={handleGoogleSignIn}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#ffd166]/50 text-white font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 active:scale-[0.98] group shadow-md"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="font-semibold text-white/90 group-hover:text-white">
                  Continue with Google (Firebase)
                </span>
              </button>

              <div className="pt-2 border-t border-white/5 text-center">
                <p className="text-[11px] font-mono text-white/40">
                  {mode === 'login' ? (
                    <>
                      New to BST Tech Club?{' '}
                      <button
                        type="button"
                        disabled={isWarping}
                        onClick={() => setMode('signup')}
                        className="text-[#ffd166] hover:underline cursor-pointer"
                      >
                        Register student profile
                      </button>
                    </>
                  ) : (
                    <>
                      Already registered?{' '}
                      <button
                        type="button"
                        disabled={isWarping}
                        onClick={() => setMode('login')}
                        className="text-[#ffd166] hover:underline cursor-pointer"
                      >
                        Sign in directly
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between font-mono text-[11px] text-white/30 border-t border-white/5">
        <span className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#06d6a0]" />
          <span>TPLH // YOICHI KOBAYASHI 3D SHADER PIPELINE</span>
        </span>
        <span>BST TECH CLUB PLATFORM © 2026</span>
      </footer>

      {/* ========================================================= */}
      {/* TPLH.NET FULL SCREEN WARP / TRANSITION OVERLAY */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isWarping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-black/45 backdrop-blur-[2px]"
          >
            {/* Target Reticle & Coordinate telemetry */}
            <div className="relative flex flex-col items-center justify-center text-center space-y-6 max-w-md px-6">
              {/* Outer pulsing ring */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-[#ffd166]/40 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#ffd166]/60 animate-spin" style={{ animationDuration: '6s' }} />
                <div className="w-12 h-12 rounded-full bg-[#ffd166]/20 border border-[#ffd166] flex items-center justify-center text-[#ffd166] shadow-[0_0_25px_#ffd166]">
                  <Zap className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 border border-[#ffd166]/40 font-mono text-[10px] text-[#ffd166] tracking-widest uppercase">
                  <span>[ ACCESS GRANTED // CITADEL GATEWAY ]</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white tracking-widest uppercase">
                  {warpStatusText}
                </h3>
              </div>

              {/* Progress bar */}
              <div className="w-64 h-1.5 rounded-full bg-white/10 overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#ffd166] via-[#06d6a0] to-[#89eefa] shadow-[0_0_12px_#ffd166]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${warpProgress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.15 }}
                />
              </div>

              <div className="font-mono text-[10px] text-white/50 tracking-wider">
                COORDINATES: LAT 35.6762° • LON 139.6503° • SHADER: TPLH-2026
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
