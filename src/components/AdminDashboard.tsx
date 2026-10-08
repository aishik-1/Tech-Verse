import React, { useState, useEffect } from 'react';
import { Profile, Sticker, Achievement, Idea, ChatMessage } from '../types';
import { db } from '../services/db';
import { useToast } from './Toast';
import {
  ShieldCheck,
  Users,
  Trophy,
  Sparkles,
  Lightbulb,
  MessageSquare,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: Profile;
  onRefreshAll: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onRefreshAll,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'students' | 'achievements' | 'stickers' | 'ideas' | 'chat'
  >('analytics');

  const [students, setStudents] = useState<Profile[]>(db.getProfiles());
  const [achievements, setAchievements] = useState<Achievement[]>(db.getAchievements());
  const [stickers, setStickers] = useState<Sticker[]>(db.getStickers());
  const [ideas, setIdeas] = useState<Idea[]>(db.getIdeas());
  const [messages, setMessages] = useState<ChatMessage[]>(db.getChatMessages());
  const [analytics, setAnalytics] = useState(db.getAdminAnalytics());

  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = () => {
    setStudents(db.getProfiles());
    setAchievements(db.getAchievements());
    setStickers(db.getStickers());
    setIdeas(db.getIdeas());
    setMessages(db.getChatMessages());
    setAnalytics(db.getAdminAnalytics());
    onRefreshAll();
  };

  useEffect(() => {
    refreshData();
    const unsub = db.subscribe('*', () => {
      refreshData();
    });
    return () => unsub();
  }, []);

  // Admin Actions
  const handleToggleStudentStatus = (student: Profile) => {
    const success = db.adminToggleUserStatus(student.id);
    if (success) {
      showToast(
        'info',
        `Account ${student.is_active ? 'deactivated' : 'activated'}`,
        student.full_name
      );
      refreshData();
    }
  };

  const handleDeleteAchievement = (ach: Achievement) => {
    if (window.confirm(`[ADMIN] Delete achievement "${ach.title}" submitted by ${ach.user_name}?`)) {
      db.deleteAchievement(ach.id);
      showToast('info', 'Achievement removed by admin moderation');
      refreshData();
    }
  };

  const handleDeleteSticker = (stk: Sticker) => {
    if (window.confirm(`[ADMIN] Purge sticker "${stk.sticker_name}" from ${stk.user_name}?`)) {
      db.deleteSticker(stk.id);
      showToast('info', 'Sticker purged from storage');
      refreshData();
    }
  };

  const handleDeleteIdea = (idea: Idea) => {
    if (window.confirm(`[ADMIN] Delete idea "${idea.title}"?`)) {
      db.deleteIdea(idea.id);
      showToast('info', 'Idea deleted by admin');
      refreshData();
    }
  };

  const handleDeleteMessage = (msg: ChatMessage) => {
    if (window.confirm(`[ADMIN] Moderate and delete chat message from ${msg.user_name}?`)) {
      db.deleteChatMessage(msg.id);
      showToast('info', 'Chat message removed');
      refreshData();
    }
  };

  if (currentUser.role !== 'admin') {
    return (
      <div className="cyber-card p-12 text-center rounded-2xl border border-rose-500/30">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 mt-1">
          This administration dashboard is restricted to verified TechVerse Executive Leads.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              TechVerse Admin Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Executive oversight for BST Tech Club. Moderate member submissions, audit event badges, inspect analytics, and enforce security policies.
          </p>
        </div>

        <span className="text-xs font-mono text-purple-300 bg-purple-950/80 px-3 py-1.5 rounded-xl border border-purple-800/60 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span>Elevated Privileges Active</span>
        </span>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 border border-white/10 rounded-xl overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('analytics');
            setSearchQuery('');
          }}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics & Overview</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('students');
            setSearchQuery('');
          }}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Students ({students.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('achievements');
            setSearchQuery('');
          }}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'achievements'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Achievements ({achievements.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('stickers');
            setSearchQuery('');
          }}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'stickers'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Badges & Stickers ({stickers.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('ideas');
            setSearchQuery('');
          }}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ideas'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Ideas ({ideas.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('chat');
            setSearchQuery('');
          }}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'chat'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat Log ({messages.length})</span>
        </button>
      </div>

      {/* 1. Analytics & Overview Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="cyber-card p-4 rounded-xl border border-white/10">
              <span className="text-[11px] text-slate-400">Total Members</span>
              <p className="text-2xl font-mono font-bold text-white mt-1">
                {analytics.totalMembers}
              </p>
              <p className="text-[10px] text-cyan-400 mt-0.5">{analytics.activeMembers} active</p>
            </div>

            <div className="cyber-card p-4 rounded-xl border border-white/10">
              <span className="text-[11px] text-slate-400">Total Badges</span>
              <p className="text-2xl font-mono font-bold text-cyan-400 mt-1">
                {analytics.totalStickers}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Stored in bucket</p>
            </div>

            <div className="cyber-card p-4 rounded-xl border border-white/10">
              <span className="text-[11px] text-slate-400">Hacktoberfest PRs</span>
              <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                {analytics.hacktoberfestBadges}
              </p>
              <p className="text-[10px] text-emerald-400/80 mt-0.5">Verified</p>
            </div>

            <div className="cyber-card p-4 rounded-xl border border-white/10">
              <span className="text-[11px] text-slate-400">Achievements</span>
              <p className="text-2xl font-mono font-bold text-purple-400 mt-1">
                {analytics.totalAchievements}
              </p>
              <p className="text-[10px] text-purple-400/80 mt-0.5">With proof docs</p>
            </div>

            <div className="cyber-card p-4 rounded-xl border border-white/10">
              <span className="text-[11px] text-slate-400">Ideas Sparked</span>
              <p className="text-2xl font-mono font-bold text-sky-400 mt-1">
                {analytics.totalIdeas}
              </p>
              <p className="text-[10px] text-sky-400/80 mt-0.5">Collaborations</p>
            </div>

            <div className="cyber-card p-4 rounded-xl border border-white/10">
              <span className="text-[11px] text-slate-400">Messages Sent</span>
              <p className="text-2xl font-mono font-bold text-white mt-1">
                {analytics.totalChatMessages}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Realtime stream</p>
            </div>
          </div>

          {/* Active Members & Popular Ideas Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="cyber-card p-5 rounded-2xl border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Top Active Club Contributors</span>
              </h3>
              <div className="divide-y divide-white/5">
                {analytics.mostActiveStudents.map((item) => (
                  <div key={item.user.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-slate-500 w-4">#{item.rank}</span>
                      <img
                        src={item.user.avatar_url}
                        alt={item.user.full_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-200">{item.user.full_name}</span>
                    </div>
                    <span className="font-mono text-cyan-400 font-bold">
                      {item.sticker_count} Stickers
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cyber-card p-5 rounded-2xl border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-sky-400" />
                <span>Most Upvoted Ideas</span>
              </h3>
              <div className="divide-y divide-white/5">
                {analytics.popularIdeas.map((idea) => (
                  <div key={idea.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-3">
                      <p className="font-semibold text-slate-200 truncate">{idea.title}</p>
                      <p className="text-[11px] text-slate-500">by {idea.user_name}</p>
                    </div>
                    <span className="font-mono text-rose-400 shrink-0 font-bold">
                      ❤️ {idea.likes_count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Students Management Tab */}
      {activeTab === 'students' && (
        <div className="cyber-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name, email, or roll..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <span className="text-xs font-mono text-slate-400">
              {students.length} Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 border-b border-white/10 text-slate-400 font-mono">
                <tr>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Roll No.</th>
                  <th className="p-3.5">Year</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {students
                  .filter((s) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      s.full_name.toLowerCase().includes(q) ||
                      s.email.toLowerCase().includes(q) ||
                      s.roll_number.toLowerCase().includes(q)
                    );
                  })
                  .map((student) => (
                    <tr key={student.id} className="hover:bg-slate-900/40">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.avatar_url}
                            alt={student.full_name}
                            className="w-7 h-7 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-bold text-white">{student.full_name}</p>
                            <p className="text-[11px] text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono">{student.roll_number}</td>
                      <td className="p-3.5">{student.year}</td>
                      <td className="p-3.5">
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                            student.role === 'admin'
                              ? 'text-purple-300 bg-purple-950/80 border-purple-800'
                              : 'text-slate-400 bg-slate-900 border-white/10'
                          }`}
                        >
                          {student.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {student.is_active ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1 font-mono text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {student.id !== currentUser.id && (
                          <button
                            onClick={() => handleToggleStudentStatus(student)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                              student.is_active
                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {student.is_active ? 'Disable' : 'Enable'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Achievements Moderation Tab */}
      {activeTab === 'achievements' && (
        <div className="cyber-card rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Review Submitted Achievements</h3>
            <span className="text-xs text-slate-400 font-mono">
              {achievements.length} Items Total
            </span>
          </div>

          <div className="space-y-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={ach.image_url}
                    alt={ach.title}
                    className="w-12 h-12 rounded-lg object-contain bg-slate-950 p-1 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{ach.title}</p>
                    <p className="text-[11px] text-slate-400">
                      by <strong className="text-slate-300">{ach.user_name}</strong> · {ach.organization} · {ach.achievement_date}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDeleteAchievement(ach)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete inappropriate submission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Stickers & Badges Moderation Tab */}
      {activeTab === 'stickers' && (
        <div className="cyber-card rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Audit Stickers & Hacktoberfest Badges</h3>
            <span className="text-xs text-slate-400 font-mono">
              {stickers.length} Uploaded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stickers.map((stk) => (
              <div
                key={stk.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={stk.image_url}
                    alt={stk.sticker_name}
                    className="w-12 h-12 rounded-lg object-contain bg-slate-950 p-1 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{stk.sticker_name}</p>
                    <p className="text-[11px] text-cyan-400 truncate">{stk.event_name}</p>
                    <p className="text-[10px] text-slate-500">by {stk.user_name}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSticker(stk)}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                  title="Purge sticker"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Ideas Moderation Tab */}
      {activeTab === 'ideas' && (
        <div className="cyber-card rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Moderate Idea Board</h3>
            <span className="text-xs text-slate-400 font-mono">{ideas.length} Ideas</span>
          </div>

          <div className="space-y-3">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{idea.title}</p>
                  <p className="text-[11px] text-slate-400">
                    by <strong className="text-slate-300">{idea.user_name}</strong> · Category:{' '}
                    {idea.category} · ❤️ {idea.likes_count}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {idea.description}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteIdea(idea)}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete idea"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Chat Messages Moderation Tab */}
      {activeTab === 'chat' && (
        <div className="cyber-card rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Community Chat Audit Log</h3>
            <span className="text-xs text-slate-400 font-mono">
              {messages.length} Messages
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={msg.user_avatar}
                    alt={msg.user_name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <span className="font-semibold text-white mr-2">{msg.user_name}:</span>
                    <span className="text-slate-300 break-words">{msg.message}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => handleDeleteMessage(msg)}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                    title="Moderate message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
