import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { db } from '../services/db';
import { TplhWebglScene } from './TplhWebglScene';
import { motion, type Variants } from 'motion/react';
import {
  Trophy,
  Sparkles,
  Lightbulb,
  MessageSquare,
  GitPullRequest,
  Heart,
  ArrowRight,
  Plus,
  User,
  Terminal,
  Cpu,
  Flame,
  Activity,
  Layers,
  Zap,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface DashboardProps {
  currentUser: Profile;
  onNavigateTab: (tab: string) => void;
  onOpenProfile: () => void;
}

interface RecentActivityItem {
  id: string;
  type: 'achievement' | 'sticker' | 'idea' | 'track';
  title: string;
  subtitle: string;
  tab: string;
  icon: React.ElementType;
  accentColor: string;
  badgeText: string;
  timeAgo: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  onNavigateTab,
  onOpenProfile,
}) => {
  const [stats, setStats] = useState(db.getUserStats(currentUser.id));
  const [leaderboard, setLeaderboard] = useState(db.getLeaderboard());
  const [recentStickers, setRecentStickers] = useState(db.getStickers().slice(0, 4));
  const [recentAchievements, setRecentAchievements] = useState(
    db.getAchievements().slice(0, 3)
  );
  const [recentIdeas, setRecentIdeas] = useState(db.getIdeas().slice(0, 3));

  const refreshDashboardData = () => {
    setStats(db.getUserStats(currentUser.id));
    setLeaderboard(db.getLeaderboard());
    setRecentStickers(db.getStickers().slice(0, 4));
    setRecentAchievements(db.getAchievements().slice(0, 3));
    setRecentIdeas(db.getIdeas().slice(0, 3));
  };

  useEffect(() => {
    refreshDashboardData();
    const unsub = db.subscribe('*', () => {
      refreshDashboardData();
    });
    return () => unsub();
  }, [currentUser]);

  // Dynamic time-based greeting calculation
  const getTimeGreeting = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
      return {
        greeting: 'Good morning',
        subtext: 'Dawn cycle online • Prime algorithmic hours',
        icon: Sunrise,
        timeTag: 'MORNING // ALPHA PHASE',
        accentColor: 'text-[#ffd166]',
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: 'Good afternoon',
        subtext: 'Midday sprint active • High-throughput compilation',
        icon: Sun,
        timeTag: 'AFTERNOON // PEAK THROUGHPUT',
        accentColor: 'text-[#acffce]',
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        greeting: 'Good evening',
        subtext: 'Evening collaborative lab • Code review & merges',
        icon: Sunset,
        timeTag: 'EVENING // REVIEWS & SPRINTS',
        accentColor: 'text-[#89eefa]',
      };
    } else {
      return {
        greeting: 'Good night',
        subtext: 'Late night node • Quiet deep focus architecture',
        icon: Moon,
        timeTag: 'NIGHT // DEEP FOCUS',
        accentColor: 'text-[#c084fc]',
      };
    }
  };

  const timeGreetingInfo = getTimeGreeting();
  const TimeIcon = timeGreetingInfo.icon;

  // Determine user's most recent activity shortcut
  const getMostRecentActivity = (): RecentActivityItem => {
    const userAchievements = db.getAchievements().filter((a) => a.user_id === currentUser.id);
    const userStickers = db.getStickers().filter((s) => s.user_id === currentUser.id);
    const userIdeas = db.getIdeas().filter((i) => i.user_id === currentUser.id);

    const activities: { item: RecentActivityItem; date: number }[] = [];

    userAchievements.forEach((a) => {
      activities.push({
        date: new Date(a.created_at || a.achievement_date).getTime(),
        item: {
          id: a.id,
          type: 'achievement',
          title: a.title,
          subtitle: a.organization,
          tab: 'achievements',
          icon: Trophy,
          accentColor: 'text-[#a2a7ff]',
          badgeText: 'Recent Trophy',
          timeAgo: 'Recently Verified',
        },
      });
    });

    userStickers.forEach((s) => {
      activities.push({
        date: new Date(s.created_at || s.event_date).getTime(),
        item: {
          id: s.id,
          type: 'sticker',
          title: s.sticker_name,
          subtitle: s.event_name,
          tab: 'badges',
          icon: Sparkles,
          accentColor: 'text-[#acffce]',
          badgeText: 'Recent Badge',
          timeAgo: 'Unlocked',
        },
      });
    });

    userIdeas.forEach((i) => {
      activities.push({
        date: new Date(i.created_at).getTime(),
        item: {
          id: i.id,
          type: 'idea',
          title: i.title,
          subtitle: `${i.likes_count} upvotes`,
          tab: 'ideas',
          icon: Lightbulb,
          accentColor: 'text-[#ffd166]',
          badgeText: 'Recent Idea',
          timeAgo: 'Proposed',
        },
      });
    });

    if (activities.length > 0) {
      activities.sort((a, b) => b.date - a.date);
      return activities[0].item;
    }

    // Default shortcut if new profile
    return {
      id: 'default_track',
      type: 'track',
      title: 'Hacktoberfest 2026 PR Sprint',
      subtitle: 'Pillar 01 // Open Source',
      tab: 'tracks',
      icon: GitPullRequest,
      accentColor: 'text-[#89eefa]',
      badgeText: 'Active Track',
      timeAgo: 'Ready to Sprint',
    };
  };

  const mostRecentActivity = getMostRecentActivity();
  const ActivityIcon = mostRecentActivity.icon;

  const userRank = leaderboard.find((l) => l.user.id === currentUser.id)?.rank ?? 1;
  const userPoints =
    stats.stickersCount * 25 +
    stats.achievementsCount * 50 +
    stats.hacktoberfestCount * 40 +
    stats.likesCount * 10;

  // Framer Motion staggered animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* 1. Welcome Banner with time-based greeting & Quick Access Recent Activity */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-[#191a1e] border border-white/10 p-6 sm:p-9 shadow-2xl"
      >
        {/* Ambient 3D Scene (tplh.net low-poly core & swirling particles in Dashboard) */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 opacity-40 sm:opacity-75 pointer-events-none z-0">
          <TplhWebglScene particleCount={220} interactive={true} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-xl">
            {/* Top Telemetry & Time Indicator */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131418] border border-white/15 text-[11px] font-mono tracking-wider text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffd166] animate-pulse" />
                <span className="text-white">BST TECH CITADEL</span>
                <span className="text-white/20">•</span>
                <span className="text-[#ffd166]">TPLH SHADER CORE</span>
              </div>

              {/* Time Cycle Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-wider text-white/50">
                <TimeIcon className={`w-3 h-3 ${timeGreetingInfo.accentColor}`} />
                <span>{timeGreetingInfo.timeTag}</span>
              </div>
            </div>

            {/* Time-Based Greeting */}
            <div>
              <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight flex flex-wrap items-baseline gap-2">
                <span>{timeGreetingInfo.greeting},</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/70">
                  {currentUser.full_name.split(' ')[0]}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans mt-1">
                {timeGreetingInfo.subtext}. Active across Open Source, ICPC/CP, Robotics, and Hackathons.
              </p>
            </div>

            {/* Quick-Access Shortcut for Most Recent Activity */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onNavigateTab(mostRecentActivity.tab)}
                className="group inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[#131418]/90 hover:bg-[#15161b] border border-white/10 hover:border-[#acffce]/50 transition-all cursor-pointer backdrop-blur-md shadow-lg shadow-black/40 text-left"
              >
                <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ActivityIcon className={`w-3.5 h-3.5 ${mostRecentActivity.accentColor}`} />
                </div>

                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-white/40">
                    <span className="text-[#acffce]">Resume Recent</span>
                    <span>•</span>
                    <span>{mostRecentActivity.badgeText}</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-white group-hover:text-[#acffce] transition-colors truncate max-w-[280px] sm:max-w-[340px]">
                    {mostRecentActivity.title}
                  </p>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-[#acffce] group-hover:translate-x-1 transition-all shrink-0 ml-1" />
              </button>
            </div>
          </div>

          {/* Quick Actions in Byotone button-orbit style */}
          <div className="flex flex-wrap items-center gap-2.5 relative z-10">
            <button
              onClick={() => onNavigateTab('tracks')}
              className="button-orbit is-primary !py-2 !px-4 !text-xs flex items-center gap-1.5 shadow-lg shadow-[#ffd166]/10 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Explore Tracks</span>
            </button>
            <button
              onClick={() => onNavigateTab('badges')}
              className="button-orbit !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Badge</span>
            </button>
            <button
              onClick={() => onNavigateTab('achievements')}
              className="button-orbit !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Trophy</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 1.5 The Four Pillars Quick Navigator */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <motion.button
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          onClick={() => onNavigateTab('tracks')}
          className="p-3.5 rounded-2xl bg-[#191a1e] border border-white/10 hover:border-[#acffce]/40 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-white/40 mb-1.5">
            <span className="text-[10px] uppercase">Pillar 01</span>
            <GitPullRequest className="w-3.5 h-3.5 text-[#acffce]" />
          </div>
          <p className="font-bold text-white group-hover:text-[#acffce] transition-colors">Open Source</p>
          <p className="text-[11px] text-[#acffce] mt-0.5">48+ PRs Verified</p>
        </motion.button>

        <motion.button
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          onClick={() => onNavigateTab('tracks')}
          className="p-3.5 rounded-2xl bg-[#191a1e] border border-white/10 hover:border-[#89eefa]/40 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-white/40 mb-1.5">
            <span className="text-[10px] uppercase">Pillar 02</span>
            <Terminal className="w-3.5 h-3.5 text-[#89eefa]" />
          </div>
          <p className="font-bold text-white group-hover:text-[#89eefa] transition-colors">ICPC / CP</p>
          <p className="text-[11px] text-[#89eefa] mt-0.5">1840 Peak Rating</p>
        </motion.button>

        <motion.button
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          onClick={() => onNavigateTab('tracks')}
          className="p-3.5 rounded-2xl bg-[#191a1e] border border-white/10 hover:border-[#ffd166]/40 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-white/40 mb-1.5">
            <span className="text-[10px] uppercase">Pillar 03</span>
            <Cpu className="w-3.5 h-3.5 text-[#ffd166]" />
          </div>
          <p className="font-bold text-white group-hover:text-[#ffd166] transition-colors">Robotics & IoT</p>
          <p className="text-[11px] text-[#ffd166] mt-0.5">Lab 402 Active</p>
        </motion.button>

        <motion.button
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          onClick={() => onNavigateTab('tracks')}
          className="p-3.5 rounded-2xl bg-[#191a1e] border border-white/10 hover:border-[#a2a7ff]/40 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-white/40 mb-1.5">
            <span className="text-[10px] uppercase">Pillar 04</span>
            <Trophy className="w-3.5 h-3.5 text-[#a2a7ff]" />
          </div>
          <p className="font-bold text-white group-hover:text-[#a2a7ff] transition-colors">Hackathons</p>
          <p className="text-[11px] text-[#a2a7ff] mt-0.5">32 Podiums Logged</p>
        </motion.button>
      </motion.div>

      {/* 2. Key Statistics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Achievements Stat */}
        <div className="byotone-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 font-mono text-xs text-white/40 uppercase">
            <span>Achievements</span>
            <Trophy className="w-4 h-4 text-[#a2a7ff]" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
              {stats.achievementsCount}
            </p>
            <p className="text-[11px] font-mono text-[#a2a7ff] mt-1">Verified honors</p>
          </div>
        </div>

        {/* Stickers Stat */}
        <div className="byotone-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 font-mono text-xs text-white/40 uppercase">
            <span>Stickers & Badges</span>
            <Sparkles className="w-4 h-4 text-[#acffce]" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
              {stats.stickersCount}
            </p>
            <p className="text-[11px] font-mono text-[#acffce] mt-1">Collected</p>
          </div>
        </div>

        {/* Hacktoberfest Stat */}
        <div className="byotone-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 font-mono text-xs text-white/40 uppercase">
            <span>Hacktoberfest PRs</span>
            <GitPullRequest className="w-4 h-4 text-[#89eefa]" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
              {stats.hacktoberfestCount} / 4
            </p>
            <p className="text-[11px] font-mono text-[#89eefa] mt-1">
              {stats.hacktoberfestCount >= 4 ? 'Goal Completed' : 'Sprint in progress'}
            </p>
          </div>
        </div>

        {/* Ideas Shared */}
        <div className="byotone-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 font-mono text-xs text-white/40 uppercase">
            <span>Ideas & Sparks</span>
            <Lightbulb className="w-4 h-4 text-[#ffd166]" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
              {stats.ideasCount}
            </p>
            <p className="text-[11px] font-mono text-[#ffd166] mt-1">Shared</p>
          </div>
        </div>

        {/* Leaderboard Rank */}
        <div className="byotone-card p-5 rounded-2xl flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3 font-mono text-xs text-white/40 uppercase">
            <span>Citadel Rank</span>
            <Flame className="w-4 h-4 text-[#ffd166]" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-mono font-bold text-[#ffd166] tabular-nums">
              #{userRank}
            </p>
            <p className="text-[11px] font-mono text-white/50 mt-1">
              {userPoints} pts accrued
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3. Recent Activity Panels */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stickers */}
        <div className="byotone-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#acffce]" />
              <span>Community Sticker Drops</span>
            </h3>
            <button
              onClick={() => onNavigateTab('badges')}
              className="text-xs font-mono text-[#acffce] hover:underline cursor-pointer"
            >
              View All ({db.getStickers().length})
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {recentStickers.map((sticker) => (
              <div
                key={sticker.id}
                className="p-3 rounded-xl bg-[#131418] border border-white/5 flex items-center gap-3 hover:border-white/20 transition-all group"
              >
                <img
                  src={sticker.image_url}
                  alt={sticker.sticker_name}
                  className="w-12 h-12 rounded-lg object-contain bg-black/40 p-1 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover:text-[#acffce] transition-colors">
                    {sticker.sticker_name}
                  </p>
                  <p className="text-[11px] text-white/40 truncate">{sticker.event_name}</p>
                  <p className="text-[10px] font-mono text-[#acffce] mt-0.5">
                    by {sticker.user_name.split(' ')[0]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="byotone-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#a2a7ff]" />
              <span>Recent Club Achievements</span>
            </h3>
            <button
              onClick={() => onNavigateTab('achievements')}
              className="text-xs font-mono text-[#a2a7ff] hover:underline cursor-pointer"
            >
              View All ({db.getAchievements().length})
            </button>
          </div>

          <div className="space-y-3">
            {recentAchievements.map((ach) => (
              <div
                key={ach.id}
                className="p-3 rounded-xl bg-[#131418] border border-white/5 flex items-center gap-3 hover:border-white/20 transition-all"
              >
                <img
                  src={ach.image_url}
                  alt={ach.title}
                  className="w-11 h-11 rounded-lg object-contain bg-black/40 p-1 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{ach.title}</p>
                  <div className="flex items-center gap-2 text-[11px] text-white/40 font-mono">
                    <span className="text-[#a2a7ff]">{ach.organization}</span>
                    <span aria-hidden="true">•</span>
                    <span>{ach.user_name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
