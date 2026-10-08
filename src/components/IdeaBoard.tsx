import React, { useState, useEffect } from 'react';
import { Idea, Profile, IdeaCategory } from '../types';
import { db } from '../services/db';
import { useToast } from './Toast';
import {
  Lightbulb,
  Plus,
  Heart,
  Trash2,
  Search,
  X,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Share2,
} from 'lucide-react';

interface IdeaBoardProps {
  currentUser: Profile;
  onRefreshStats?: () => void;
}

export const IdeaBoard: React.FC<IdeaBoardProps> = ({
  currentUser,
  onRefreshStats,
}) => {
  const { showToast } = useToast();

  const [ideas, setIdeas] = useState<Idea[]>(db.getIdeas());
  const [filter, setFilter] = useState<'All' | IdeaCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IdeaCategory>('Hackathon');
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setIdeas(db.getIdeas());
    if (onRefreshStats) onRefreshStats();
  };

  useEffect(() => {
    const unsub = db.subscribe('ideas', () => {
      setIdeas(db.getIdeas());
    });
    return () => unsub();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !description.trim()) {
      setFormError('Please enter both title and description.');
      return;
    }

    const res = db.addIdea({
      title: title.trim(),
      description: description.trim(),
      category,
    });

    if (res.success) {
      showToast('success', 'Idea published to TechVerse board!');
      refreshList();
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
    } else {
      setFormError(res.error || 'Failed to post idea.');
    }
  };

  const handleToggleLike = (ideaId: string) => {
    const res = db.toggleLikeIdea(ideaId);
    if (res.success) {
      if (res.liked) {
        showToast('info', 'Idea liked! ❤️');
      }
      refreshList();
    } else {
      showToast('error', 'Error', res.error);
    }
  };

  const handleDelete = (idea: Idea) => {
    const confirmDelete = window.confirm(`Delete idea "${idea.title}"?`);
    if (!confirmDelete) return;

    const res = db.deleteIdea(idea.id);
    if (res.success) {
      showToast('info', 'Idea removed from board.');
      refreshList();
    } else {
      showToast('error', 'Permission denied', res.error);
    }
  };

  const filteredIdeas = ideas
    .filter((idea) => {
      if (filter !== 'All' && idea.category !== filter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          idea.title.toLowerCase().includes(query) ||
          idea.description.toLowerCase().includes(query) ||
          idea.user_name.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => b.likes_count - a.likes_count);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Lightbulb className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              Collaborative Idea Board
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Brainstorm hackathon projects, hardware prototypes, campus startups, and BST Tech Club initiatives. Vote for your favorites and find teammates.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Spark New Idea</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ideas by keyword or author..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-white/10 rounded-xl overflow-x-auto">
          {(
            [
              'All',
              'Hackathon',
              'AI/ML',
              'Web',
              'App',
              'Robotics',
              'Project',
              'Startup',
            ] as Array<'All' | IdeaCategory>
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filter === cat
                  ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Idea Cards */}
      {filteredIdeas.length === 0 ? (
        <div className="cyber-card p-12 text-center rounded-2xl border border-white/10 space-y-3">
          <Lightbulb className="w-10 h-10 mx-auto text-slate-500" />
          <h3 className="text-base font-bold text-white">No ideas yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Be the first to spark something revolutionary for BST Tech Club.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold border border-sky-500/30 transition-all inline-flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post an Idea</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIdeas.map((idea) => {
            const hasLiked = db.hasUserLikedIdea(idea.id, currentUser.id);
            const isOwner = idea.user_id === currentUser.id;
            const isAdmin = currentUser.role === 'admin';
            const canDelete = isOwner || isAdmin;

            return (
              <div
                key={idea.id}
                className="cyber-card rounded-2xl border border-white/10 hover:border-sky-500/40 transition-all duration-300 p-5 flex flex-col justify-between group hover:-translate-y-1 shadow-lg hover:shadow-sky-500/10"
              >
                <div className="space-y-3">
                  {/* Category Chip & Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded border border-sky-800/60">
                      {idea.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                    {idea.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                    {idea.description}
                  </p>
                </div>

                {/* Footer Bar */}
                <div className="pt-4 mt-5 border-t border-white/5 flex items-center justify-between">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <img
                      src={idea.user_avatar}
                      alt={idea.user_name}
                      className="w-6 h-6 rounded-full object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[100px]">
                      {idea.user_name.split(' ')[0]}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleLike(idea.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 active:scale-90 ${
                        hasLiked
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                          : 'bg-slate-900/60 text-slate-400 hover:text-rose-400 border border-white/5'
                      }`}
                      title={hasLiked ? 'Unlike idea' : 'Upvote idea'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          hasLiked ? 'fill-rose-400 text-rose-400' : ''
                        }`}
                      />
                      <span className="tabular-nums">{idea.likes_count}</span>
                    </button>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(idea)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title={isAdmin && !isOwner ? 'Admin Remove' : 'Delete Idea'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Idea Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#090D16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                  <Lightbulb className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-display font-bold text-white">
                  Spark a TechVerse Idea
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Idea Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous Campus Delivery Rover or AI Lab Assistant"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IdeaCategory)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Hackathon">Hackathon</option>
                  <option value="AI/ML">AI / Machine Learning</option>
                  <option value="Web">Web & Cloud</option>
                  <option value="App">Mobile App</option>
                  <option value="Robotics">Robotics & IoT</option>
                  <option value="Project">Club Project</option>
                  <option value="Startup">Campus Startup</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Event">Club Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Concept Description & Implementation Vision
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the problem statement, proposed technology stack, and how other club members can collaborate..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Publish to Idea Board</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
