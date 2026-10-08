import React, { useState } from 'react';
import { Profile } from '../types';
import { ShieldCheck, LogOut, User, Menu, X, Sparkles, Key } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: Profile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tracks', label: 'Tech Tracks' },
    { id: 'badges', label: 'Badges' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'ideas', label: 'Ideas' },
    { id: 'community', label: 'Community' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ];

  if (currentUser?.role === 'admin') {
    navLinks.push({ id: 'admin', label: 'Admin' });
  }

  const handleTabClick = (tabId: string) => {
    if (tabId === 'login') {
      onOpenAuth();
    } else {
      onTabChange(tabId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#131418]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Byotone minimal high-fashion style) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTabClick(currentUser ? 'dashboard' : 'landing')}
            className="text-left font-display text-lg font-bold tracking-widest text-white hover:text-[#acffce] transition-colors flex items-center gap-2.5 cursor-pointer group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#acffce] shadow-[0_0_10px_#acffce] group-hover:scale-125 transition-transform" />
            <span className="tracking-[0.16em]">TECHVERSE</span>
          </button>
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-white/40 px-2 py-0.5 rounded border border-white/10 bg-[#191a1e]">
            BST Tech Club
          </span>
        </div>

        {/* Zone 2: Navigation Links with Framer Motion Layout Transition */}
        {currentUser && (
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs font-mono tracking-wider uppercase relative">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleTabClick(link.id)}
                  className={`relative py-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'text-[#acffce] font-semibold'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {link.id === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-[#acffce]" />}
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="navTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#acffce] rounded-full shadow-[0_0_10px_#acffce]"
                      transition={{ type: 'spring', stiffness: 480, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              {/* Direct Access to 3D Login Portal anytime */}
              <button
                onClick={onOpenAuth}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffd166]/10 hover:bg-[#ffd166]/20 border border-[#ffd166]/30 text-[#ffd166] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                title="Switch Account or open 3D Login Portal"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Login Portal</span>
              </button>

              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#191a1e] border border-white/10 hover:border-[#acffce]/40 transition-all hover:bg-[#202227] cursor-pointer"
                title="View Profile"
              >
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-7 h-7 rounded-full object-cover bg-slate-800 border border-[#acffce]/40"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-mono text-white/80 hidden sm:inline max-w-[100px] truncate">
                  {currentUser.full_name.split(' ')[0]}
                </span>
                {currentUser.role === 'admin' && (
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#acffce] bg-[#acffce]/10 px-1.5 py-0.5 rounded border border-[#acffce]/30 hidden lg:inline">
                    Lead
                  </span>
                )}
              </button>

              <button
                onClick={onLogout}
                className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white/60 hover:text-white rounded-lg cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenAuth}
                className="button-orbit is-primary !py-2 !px-5 !text-xs whitespace-nowrap cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(255,209,102,0.4)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#131418]" />
                <span className="font-bold">STUDENT LOGIN / REGISTER</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#131418] px-4 py-3 space-y-1">
          {currentUser && navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleTabClick(link.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-between ${
                currentTab === link.id
                  ? 'bg-[#acffce]/10 text-[#acffce] font-semibold border border-[#acffce]/25'
                  : 'text-white/60 hover:bg-[#191a1e]'
              }`}
            >
              <span className="flex items-center gap-2">
                {link.id === 'admin' && <ShieldCheck className="w-4 h-4 text-[#acffce]" />}
                {link.label}
              </span>
            </button>
          ))}
          <button
            onClick={() => {
              onOpenAuth();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono uppercase text-[#ffd166] bg-[#ffd166]/10 border border-[#ffd166]/20 flex items-center gap-2 mt-2"
          >
            <Key className="w-4 h-4 text-[#ffd166]" />
            3D Student Login Portal
          </button>
          {currentUser && (
            <button
              onClick={() => {
                onOpenProfile();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono uppercase text-white/60 hover:bg-[#191a1e] flex items-center gap-2 border-t border-white/5 mt-2 pt-2"
            >
              <User className="w-4 h-4 text-[#acffce]" />
              My Profile & Settings
            </button>
          )}
        </div>
      )}
    </header>
  );
};
