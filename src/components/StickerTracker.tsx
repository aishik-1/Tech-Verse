import React, { useState, useRef } from 'react';
import { Sticker, Profile, StickerCategory } from '../types';
import { db } from '../services/db';
import { useToast } from './Toast';
import {
  Plus,
  Upload,
  Trash2,
  Calendar,
  Sparkles,
  X,
  Maximize2,
  Tag,
  AlertCircle,
  GitPullRequest,
  CheckCircle2,
} from 'lucide-react';

interface StickerTrackerProps {
  currentUser: Profile;
  onRefreshLeaderboard?: () => void;
}

export const StickerTracker: React.FC<StickerTrackerProps> = ({
  currentUser,
  onRefreshLeaderboard,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stickers, setStickers] = useState<Sticker[]>(db.getStickers());
  const [filter, setFilter] = useState<'all' | StickerCategory>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<{
    url: string;
    name: string;
    event: string;
  } | null>(null);

  // Form states
  const [eventName, setEventName] = useState('');
  const [stickerName, setStickerName] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<StickerCategory>('hacktoberfest');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setStickers(db.getStickers());
    if (onRefreshLeaderboard) onRefreshLeaderboard();
  };

  const handleFileUpload = async (file: File) => {
    setFormError('');
    setIsUploading(true);
    const result = await db.uploadImage('sticker_images', file);
    setIsUploading(false);

    if (result.success && result.url) {
      setImageUrl(result.url);
      showToast('success', 'Sticker photograph verified and loaded!');
    } else {
      setFormError(result.error || 'Failed to upload sticker image.');
      showToast('error', 'Upload failed', result.error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // STRICT MANDATORY IMAGE REQUIREMENT:
    if (!imageUrl) {
      setFormError('A screenshot or photograph of the sticker is MANDATORY to verify submission.');
      return;
    }

    if (!eventName.trim() || !stickerName.trim()) {
      setFormError('Please fill in both event name and sticker name.');
      return;
    }

    const res = db.addSticker({
      event_name: eventName,
      sticker_name: stickerName,
      event_date: eventDate,
      image_url: imageUrl,
      category,
    });

    if (res.success) {
      showToast('success', 'Sticker added to collection!', '+1 recorded on TechVerse Leaderboard.');
      refreshList();
      // Reset form
      setEventName('');
      setStickerName('');
      setImageUrl('');
      setIsModalOpen(false);
    } else {
      setFormError(res.error || 'Failed to add sticker.');
    }
  };

  const handleDelete = (sticker: Sticker) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${sticker.sticker_name}"? The image will be permanently purged from storage.`
    );
    if (!confirmDelete) return;

    const res = db.deleteSticker(sticker.id);
    if (res.success) {
      showToast('info', 'Sticker and storage image deleted.');
      refreshList();
    } else {
      showToast('error', 'Permission Denied', res.error);
    }
  };

  const filteredStickers = stickers.filter((s) => {
    if (filter === 'all') return true;
    return s.category === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#191a1e] text-[#acffce] border border-white/10">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Badges & Sticker Tracker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl font-mono">
            Log your Hacktoberfest 2026 PR badges, hackathon laptop stickers, and developer seals. Verified badges elevate your rank on the club leaderboard.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="button-orbit is-primary !py-2 !px-4 !text-xs flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sticker / Badge</span>
        </button>
      </div>

      {/* Interactive Category Filter Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-[#191a1e] border border-white/10 rounded-full overflow-x-auto text-xs font-mono uppercase tracking-wider">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
            filter === 'all'
              ? 'bg-[#acffce] text-[#191a1e] font-semibold shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          All Badges ({stickers.length})
        </button>
        <button
          onClick={() => setFilter('hacktoberfest')}
          className={`px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            filter === 'hacktoberfest'
              ? 'bg-[#acffce] text-[#191a1e] font-semibold shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Hacktoberfest 2026</span>
        </button>
        <button
          onClick={() => setFilter('hackathon')}
          className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
            filter === 'hackathon'
              ? 'bg-[#acffce] text-[#191a1e] font-semibold shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Hackathons
        </button>
        <button
          onClick={() => setFilter('conference')}
          className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
            filter === 'conference'
              ? 'bg-[#acffce] text-[#191a1e] font-semibold shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Conferences
        </button>
        <button
          onClick={() => setFilter('workshop')}
          className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
            filter === 'workshop'
              ? 'bg-[#acffce] text-[#191a1e] font-semibold shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Workshops
        </button>
        <button
          onClick={() => setFilter('club')}
          className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
            filter === 'club'
              ? 'bg-[#acffce] text-[#191a1e] font-semibold shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Club Events
        </button>
      </div>

      {/* Grid of Sticker Cards */}
      {filteredStickers.length === 0 ? (
        <div className="byotone-card p-12 text-center rounded-2xl space-y-3">
          <Sparkles className="w-10 h-10 mx-auto text-white/30" />
          <h3 className="text-base font-bold text-white">No stickers found in this category</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto font-mono">
            Your TechVerse journey starts here. Be the first to add your Hacktoberfest badge or tech sticker.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="button-orbit is-primary !py-2 !px-4 !text-xs inline-flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Badge</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStickers.map((sticker) => {
            const isOwner = sticker.user_id === currentUser.id;
            const isAdmin = currentUser.role === 'admin';
            const canDelete = isOwner || isAdmin;

            return (
              <div
                key={sticker.id}
                className="byotone-card rounded-2xl flex flex-col justify-between overflow-hidden group hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image Container with Lightbox Trigger */}
                <div className="relative aspect-square w-full bg-[#131418] p-4 flex items-center justify-center border-b border-white/5 overflow-hidden">
                  <img
                    src={sticker.image_url}
                    alt={sticker.sticker_name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() =>
                      setSelectedPreviewImage({
                        url: sticker.image_url,
                        name: sticker.sticker_name,
                        event: sticker.event_name,
                      })
                    }
                  />

                  {/* Lightbox Quick Button */}
                  <button
                    onClick={() =>
                      setSelectedPreviewImage({
                        url: sticker.image_url,
                        name: sticker.sticker_name,
                        event: sticker.event_name,
                      })
                    }
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-[#acffce] hover:text-[#191a1e] text-white/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Enlarge preview"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Category Chip */}
                  <div className="absolute bottom-2.5 left-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#acffce] bg-[#191a1e] px-2 py-0.5 rounded border border-white/10">
                      {sticker.category}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#acffce] transition-colors line-clamp-1">
                      {sticker.sticker_name}
                    </h3>
                    <p className="text-xs text-white/50 line-clamp-1">{sticker.event_name}</p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40 font-mono">
                    {/* Contributor / Owner Avatar */}
                    <div className="flex items-center gap-2">
                      <img
                        src={sticker.user_avatar}
                        alt={sticker.user_name}
                        className="w-5 h-5 rounded-full object-cover border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[11px] text-white/70 truncate max-w-[90px]">
                        {sticker.user_name.split(' ')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/40">
                        {sticker.event_date}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(sticker)}
                          className="p-1 text-white/40 hover:text-rose-400 rounded transition-colors cursor-pointer"
                          title={isAdmin && !isOwner ? 'Admin Remove Sticker' : 'Delete Sticker'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Sticker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#090D16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-display font-bold text-white">
                  Add Verified Sticker / Badge
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* MANDATORY IMAGE UPLOAD FIELD */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>Sticker Screenshot / Photo</span>
                    <span className="text-cyan-400 text-[10px] font-mono">*MANDATORY</span>
                  </label>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (Max 5MB)</span>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    imageUrl
                      ? 'border-cyan-500/50 bg-cyan-950/20'
                      : isDragOver
                      ? 'border-cyan-400 bg-cyan-950/40'
                      : 'border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />

                  {isUploading ? (
                    <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs py-3">
                      <span className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                      <span>Optimizing and uploading to storage...</span>
                    </div>
                  ) : imageUrl ? (
                    <div className="flex items-center justify-center gap-4 py-2">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-16 h-16 object-contain rounded-lg bg-black/60 p-1 border border-cyan-500/40 shadow-md"
                      />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-cyan-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Photo verified & ready
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click to replace image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 space-y-1">
                      <Upload className="w-6 h-6 mx-auto text-cyan-400/80 mb-1" />
                      <p className="text-xs text-slate-300">
                        <span className="text-cyan-400 font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-[10px] text-slate-400">Photo must clearly show the sticker badge</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Sticker / Badge Name
                </label>
                <input
                  type="text"
                  required
                  value={stickerName}
                  onChange={(e) => setStickerName(e.target.value)}
                  placeholder="e.g. Hacktoberfest 2026 Core PR Badge"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Event / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Hacktoberfest / DigitalOcean / GitHub"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as StickerCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="hacktoberfest">Hacktoberfest 2026</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="club">Club Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Date Received
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={!imageUrl || isUploading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Sticker to Vault</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPreviewImage && (
        <div
          onClick={() => setSelectedPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl max-h-[85vh] bg-[#090D16] border border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col items-center cursor-default"
          >
            <button
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/60 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={selectedPreviewImage.url}
              alt={selectedPreviewImage.name}
              className="max-h-[60vh] max-w-full object-contain filter drop-shadow-[0_15px_30px_rgba(6,182,212,0.25)]"
            />

            <div className="text-center mt-4">
              <h3 className="text-base font-bold text-white">{selectedPreviewImage.name}</h3>
              <p className="text-xs text-cyan-400 mt-0.5">{selectedPreviewImage.event}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
