import React, { useState, useRef } from 'react';
import { Profile, Sticker, Achievement } from '../types';
import { db } from '../services/db';
import { useToast } from './Toast';
import {
  X,
  Upload,
  Trash2,
  Camera,
  Award,
  Sparkles,
  Calendar,
  Github,
  Mail,
  GraduationCap,
  Save,
  Check,
} from 'lucide-react';

interface StudentProfileProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Profile;
  onProfileUpdated: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'details' | 'stickers' | 'achievements'>('details');
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [rollNumber, setRollNumber] = useState(currentUser.roll_number || '');
  const [year, setYear] = useState(currentUser.year || '3rd Year');
  const [github, setGithub] = useState(currentUser.github_username || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const stats = db.getUserStats(currentUser.id);
  const userStickers: Sticker[] = db.getStickersByUser(currentUser.id);
  const userAchievements: Achievement[] = db.getAchievementsByUser(currentUser.id);

  // File Upload Handlers
  const handleFileProcess = async (file: File) => {
    setUploadingImage(true);
    const result = await db.uploadImage('profile_images', file);
    setUploadingImage(false);

    if (result.success && result.url) {
      setAvatarUrl(result.url);
      showToast('success', 'Profile photo uploaded!', 'Click "Save Changes" to finalize.');
    } else {
      showToast('error', 'Upload failed', result.error);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemovePhoto = () => {
    // Revert to generated avatar
    const defaultSeed = encodeURIComponent(currentUser.full_name);
    setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${defaultSeed}&backgroundColor=06b6d4`);
    showToast('info', 'Photo reset to default monogram avatar');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const result = db.updateProfile(currentUser.id, {
      full_name: fullName.trim(),
      bio: bio.trim(),
      roll_number: rollNumber.trim(),
      year: year.trim(),
      github_username: github.trim(),
      avatar_url: avatarUrl,
    });

    setIsSaving(false);

    if (result.success) {
      showToast('success', 'Profile updated successfully!');
      onProfileUpdated();
    } else {
      showToast('error', 'Failed to update profile', result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#090D16] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <GraduationCap className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-display font-bold text-white">Student Profile & Vault</h2>
              <p className="text-xs text-slate-400">BST Tech Club Identity</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/5 bg-[#080C14]">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Identity & Edit
          </button>
          <button
            onClick={() => setActiveTab('stickers')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'stickers'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>My Stickers ({userStickers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'achievements'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>My Achievements ({userAchievements.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-center">
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">Total Stickers</p>
              <p className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
                {stats.stickersCount}
              </p>
            </div>
            <div className="text-center border-x border-white/5">
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">Achievements</p>
              <p className="text-xl font-mono font-bold text-purple-400 tabular-nums">
                {stats.achievementsCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">Events Attended</p>
              <p className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
                {stats.eventsAttendedCount}
              </p>
            </div>
          </div>

          {activeTab === 'details' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Photo Uploader Section */}
              <div className="p-4 rounded-xl cyber-card border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                    Profile Picture
                  </h3>
                  <span className="text-[11px] text-slate-400">JPG, PNG, WEBP (Max 5MB)</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Avatar Preview */}
                  <div className="relative group shrink-0">
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-20 h-20 rounded-2xl object-cover bg-slate-800 border-2 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                      title="Change image"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                      isDragOver
                        ? 'border-cyan-400 bg-cyan-950/30'
                        : 'border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/40'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />

                    {uploadingImage ? (
                      <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs py-2">
                        <span className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                        <span>Processing image...</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 mx-auto text-slate-400" />
                        <p className="text-xs text-slate-300">
                          <span className="text-cyan-400 font-semibold">Click to upload</span> or drag and drop
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 border border-white/5 transition-colors shrink-0"
                    title="Reset photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address (Read-only)
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-900/40 border border-white/5 text-sm text-slate-400">
                    <Mail className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{currentUser.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    College Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. BST-2024-042"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Academic Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year (Senior)">4th Year (Senior)</option>
                    <option value="Postgraduate / Alumni">Postgraduate / Alumni</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    GitHub Username
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 focus-within:border-cyan-500">
                    <Github className="w-4 h-4 mr-2 text-slate-400" />
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="e.g. torvalds"
                      className="bg-transparent border-none text-sm text-white focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Student Bio & Tech Interests
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your tech stack, hackathon interests, and club roles..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {isSaving ? (
                    <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'stickers' && (
            <div className="space-y-4">
              {userStickers.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded-2xl">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-sm text-slate-300 font-medium">No stickers collected yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Your TechVerse journey starts here. Add your first Hacktoberfest badge or event sticker.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {userStickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      className="cyber-card p-3 rounded-xl border border-white/10 flex flex-col items-center text-center space-y-2 group hover:border-cyan-500/40 transition-all"
                    >
                      <img
                        src={sticker.image_url}
                        alt={sticker.sticker_name}
                        className="w-20 h-20 rounded-lg object-contain bg-slate-950/60 p-1 group-hover:scale-105 transition-transform"
                      />
                      <div className="w-full">
                        <p className="text-xs font-bold text-white truncate">{sticker.sticker_name}</p>
                        <p className="text-[10px] text-cyan-400 truncate">{sticker.event_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-4">
              {userAchievements.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded-2xl">
                  <Award className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-sm text-slate-300 font-medium">No achievements logged</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Log your hackathon certificates, contests, and open-source contributions.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userAchievements.map((ach) => (
                    <div
                      key={ach.id}
                      className="cyber-card p-3.5 rounded-xl border border-white/10 flex items-start gap-3 hover:border-purple-500/40 transition-all"
                    >
                      <img
                        src={ach.image_url}
                        alt={ach.title}
                        className="w-14 h-14 rounded-lg object-contain bg-slate-950/80 p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{ach.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{ach.organization}</span>
                          <span aria-hidden="true">·</span>
                          <span>{ach.achievement_date}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
