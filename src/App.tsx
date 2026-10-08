import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { Profile } from './types';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { TechTracksSection } from './components/TechTracksSection';
import { StickerTracker } from './components/StickerTracker';
import { AchievementsShowcase } from './components/AchievementsShowcase';
import { IdeaBoard } from './components/IdeaBoard';
import { CommunityChat } from './components/CommunityChat';
import { Leaderboard } from './components/Leaderboard';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentProfile } from './components/StudentProfile';
import { LoginPage } from './components/LoginPage';
import { motion, AnimatePresence } from 'motion/react';

function MainApp() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<Profile | null>(db.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isLoginView, setIsLoginView] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // Check URL hash for direct login link
    if (window.location.hash === '#login' && !currentUser) {
      setIsLoginView(true);
    }

    const handleHash = () => {
      if (window.location.hash === '#login') {
        setIsLoginView(true);
      } else if (window.location.hash === '#dashboard' && currentUser) {
        setIsLoginView(false);
        setCurrentTab('dashboard');
      }
    };

    window.addEventListener('hashchange', handleHash);

    // Listen to reactive auth changes
    const unsub = db.subscribe('auth', () => {
      const user = db.getCurrentUser();
      setCurrentUser(user);
      if (!user) {
        setCurrentTab('landing');
      }
    });

    return () => {
      window.removeEventListener('hashchange', handleHash);
      unsub();
    };
  }, [currentUser]);

  const handleLogout = () => {
    db.logout();
    showToast('info', 'Signed out of TechVerse.');
    setCurrentTab('landing');
    setIsLoginView(false);
    window.location.hash = '';
  };

  const handleAuthSuccess = () => {
    const user = db.getCurrentUser();
    setCurrentUser(user);
    setIsLoginView(false);
    setCurrentTab('dashboard');
    window.location.hash = '#dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#131418] text-white/75 selection:bg-[#acffce]/30 selection:text-[#acffce]">
      <AnimatePresence mode="wait">
        {isLoginView && !currentUser ? (
          <motion.div
            key="login-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full min-h-screen"
          >
            <LoginPage
              onSuccess={handleAuthSuccess}
              onBackToHome={() => {
                setIsLoginView(false);
                window.location.hash = '';
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="portal-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex-1 flex flex-col min-h-screen"
          >
            {/* Top Navbar */}
            <Navbar
              currentTab={currentTab}
              onTabChange={(tab) => {
                if (!currentUser && tab !== 'landing') {
                  setIsLoginView(true);
                  window.location.hash = '#login';
                } else {
                  setCurrentTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              currentUser={currentUser}
              onOpenAuth={() => {
                setIsLoginView(true);
                window.location.hash = '#login';
              }}
              onLogout={handleLogout}
              onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* Main Content View Container */}
            <main className="flex-1 w-full">
              {!currentUser || currentTab === 'landing' ? (
                <LandingPage
                  onGetStarted={() => {
                    setIsLoginView(true);
                    window.location.hash = '#login';
                  }}
                  onExploreDemo={() => {
                    // Sign in as default user if not logged in
                    db.switchUser('usr_aishik');
                    setCurrentUser(db.getCurrentUser());
                    setCurrentTab('dashboard');
                    showToast('success', 'Entered as Aishik Roy (BST Tech Club Lead)');
                  }}
                />
              ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                  {/* Framer Motion Animated Tab Switching */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTab}
                      initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full"
                    >
                      {currentTab === 'dashboard' && (
                        <Dashboard
                          currentUser={currentUser}
                          onNavigateTab={(tab) => setCurrentTab(tab)}
                          onOpenProfile={() => setIsProfileOpen(true)}
                        />
                      )}

                      {currentTab === 'tracks' && (
                        <div className="space-y-6">
                          <TechTracksSection
                            onJoinTrack={(trackId) => {
                              showToast('success', 'Track Selected', `You have registered interest in ${trackId}.`);
                            }}
                          />
                        </div>
                      )}

                      {currentTab === 'badges' && (
                        <StickerTracker
                          currentUser={currentUser}
                          onRefreshLeaderboard={() => {
                            // Reactive sync
                          }}
                        />
                      )}

                      {currentTab === 'achievements' && (
                        <AchievementsShowcase currentUser={currentUser} />
                      )}

                      {currentTab === 'ideas' && <IdeaBoard currentUser={currentUser} />}

                      {currentTab === 'community' && <CommunityChat currentUser={currentUser} />}

                      {currentTab === 'leaderboard' && <Leaderboard />}

                      {currentTab === 'admin' && (
                        <AdminDashboard
                          currentUser={currentUser}
                          onRefreshAll={() => {
                            // Refresh
                          }}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </main>

            {/* Student Profile Modal */}
            {currentUser && (
              <StudentProfile
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                currentUser={currentUser}
                onProfileUpdated={() => {
                  setCurrentUser(db.getCurrentUser());
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
