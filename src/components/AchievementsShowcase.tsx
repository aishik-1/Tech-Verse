import React, { useState, useRef } from 'react';
import { Achievement, Profile, AchievementCategory } from '../types';
import { db } from '../services/db';
import { useToast } from './Toast';
import {
  Trophy,
  Plus,
  Upload,
  Trash2,
  Edit2,
  ExternalLink,
  Calendar,
  Building,
  Maximize2,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface AchievementsShowcaseProps {
  currentUser: Profile;
  onRefreshStats?: () => void;
}

export const AchievementsShowcase: React.FC<AchievementsShowcaseProps> = ({
  currentUser,
  onRefreshStats,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [achievements, setAchievements] = useState<Achievement[]>(db.getAchievements());
  const [filter, setFilter] = useState<'All' | AchievementCategory>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
    org: string;
  } | null>(null);

  // Form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AchievementCategory>('Hackathon');
  const [organization, setOrganization] = useState('');
  const [achievementDate, setAchievementDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [proofLink, setProofLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setAchievements(db.getAchievements());
    if (onRefreshStats) onRefreshStats();
  };

  const openAddModal = () => {
    setEditingAchievement(null);
    setTitle('');
    setDescription('');
    setCategory('Hackathon');
    setOrganization('');
    setAchievementDate(new Date().toISOString().split('T')[0]);
    setProofLink('');
    setImageUrl('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (ach: Achievement) => {
    setEditingAchievement(ach);
    setTitle(ach.title);
    setDescription(ach.description);
    setCategory(ach.category);
    setOrganization(ach.organization);
    setAchievementDate(ach.achievement_date);
    setProofLink(ach.proof_link || '');
    setImageUrl(ach.image_url);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    setFormError('');
    setIsUploading(true);
    const result = await db.uploadImage('achievement_images', file);
    setIsUploading(false);

    if (result.success && result.url) {
      setImageUrl(result.url);
      showToast('success', 'Proof document / certificate uploaded successfully!');
    } else {
      setFormError(result.error || 'Failed to upload achievement image.');
      showToast('error', 'Upload failed', result.error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // MANDATORY IMAGE CHECK:
    if (!imageUrl) {
      setFormError('A certificate or proof image is MANDATORY to verify this achievement.');
      return;
    }

    if (!title.trim() || !organization.trim()) {
      setFormError('Title and Organization are required fields.');
      return;
    }

    if (editingAchievement) {
      const res = db.updateAchievement(editingAchievement.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        organization: organization.trim(),
        achievement_date: achievementDate,
        image_url: imageUrl,
        proof_link: proofLink.trim(),
      });
      if (res.success) {
        showToast('success', 'Achievement updated successfully!');
        refreshList();
        setIsModalOpen(false);
      } else {
        setFormError(res.error || 'Failed to update achievement.');
      }
    } else {
      const res = db.addAchievement({
        title: title.trim(),
        description: description.trim(),
        category,
        organization: organization.trim(),
        achievement_date: achievementDate,
        image_url: imageUrl,
        proof_link: proofLink.trim(),
      });
      if (res.success) {
        showToast('success', 'Achievement published to BST Showcase!');
        refreshList();
        setIsModalOpen(false);
      } else {
        setFormError(res.error || 'Failed to create achievement.');
      }
    }
  };

  const handleDelete = (ach: Achievement) => {
    const confirmDelete = window.confirm(
      `Delete "${ach.title}"? The certificate image will also be purged from storage.`
    );
    if (!confirmDelete) return;

    const res = db.deleteAchievement(ach.id);
    if (res.success) {
      showToast('info', 'Achievement and proof image deleted.');
      refreshList();
    } else {
      showToast('error', 'Permission Denied', res.error);
    }
  };

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'All') return true;
    return a.category === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#191a1e] text-[#a2a7ff] border border-white/10">
              <Trophy className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Achievements Showcase
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl font-mono">
            Verified hall of honors for BST Tech Club students. Explore national hackathon trophies, open-source milestones, cloud certifications, and academic triumphs.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="button-orbit is-primary !py-2 !px-4 !text-xs flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Achievement</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#191a1e] border border-white/10 rounded-full overflow-x-auto text-xs font-mono uppercase tracking-wider">
        {(
          [
            'All',
            'Hackathon',
            'Competition',
            'Certification',
            'Workshop',
            'Open Source',
            'Project',
          ] as Array<'All' | AchievementCategory>
        ).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              filter === cat
                ? 'bg-[#acffce] text-[#191a1e] font-semibold shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {cat} {cat === 'All' ? `(${achievements.length})` : ''}
          </button>
        ))}
      </div>

      {/* Grid of Achievements */}
      {filteredAchievements.length === 0 ? (
        <div className="byotone-card p-12 text-center rounded-2xl space-y-3">
          <Trophy className="w-10 h-10 mx-auto text-white/30" />
          <h3 className="text-base font-bold text-white">No achievements in this category</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto font-mono">
            Your TechVerse journey starts here. Add your first achievement to inspire the community.
          </p>
          <button
            onClick={openAddModal}
            className="button-orbit is-primary !py-2 !px-4 !text-xs inline-flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Achievement</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((ach) => {
            const isOwner = ach.user_id === currentUser.id;
            const isAdmin = currentUser.role === 'admin';
            const canManage = isOwner || isAdmin;

            return (
              <div
                key={ach.id}
                className="byotone-card rounded-2xl flex flex-col justify-between overflow-hidden group hover:-translate-y-1 transition-all duration-300"
              >
                {/* Proof Image Banner */}
                <div className="relative h-48 w-full bg-[#131418] p-3 flex items-center justify-center border-b border-white/5 overflow-hidden">
                  <img
                    src={ach.image_url}
                    alt={ach.title}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() =>
                      setLightboxImage({
                        url: ach.image_url,
                        title: ach.title,
                        org: ach.organization,
                      })
                    }
                  />

                  {/* Quick Expand Button */}
                  <button
                    onClick={() =>
                      setLightboxImage({
                        url: ach.image_url,
                        title: ach.title,
                        org: ach.organization,
                      })
                    }
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-[#acffce] hover:text-[#191a1e] text-white/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Enlarge proof document"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute bottom-2.5 left-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#a2a7ff] bg-[#191a1e] px-2 py-0.5 rounded border border-white/10">
                      {ach.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white group-hover:text-[#acffce] transition-colors leading-snug">
                      {ach.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-white/40">
                      <span className="text-[#a2a7ff] truncate">{ach.organization}</span>
                      <span aria-hidden="true">•</span>
                      <span className="text-[11px]">{ach.achievement_date}</span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed line-clamp-3">
                      {ach.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40 font-mono">
                    <div className="flex items-center gap-2">
                      <img
                        src={ach.user_avatar}
                        alt={ach.user_name}
                        className="w-5 h-5 rounded-full object-cover border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[11px] text-white/70 truncate max-w-[100px]">
                        {ach.user_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {ach.proof_link && (
                        <a
                          href={ach.proof_link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-white/40 hover:text-[#acffce] rounded transition-colors"
                          title="Open Verification Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {canManage && (
                        <>
                          {isOwner && (
                            <button
                              onClick={() => openEditModal(ach)}
                              className="p-1.5 text-white/40 hover:text-[#acffce] rounded transition-colors cursor-pointer"
                              title="Edit Achievement"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(ach)}
                            className="p-1.5 text-white/40 hover:text-rose-400 rounded transition-colors cursor-pointer"
                            title={isAdmin && !isOwner ? 'Admin Remove' : 'Delete Achievement'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#090D16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Trophy className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-display font-bold text-white">
                  {editingAchievement ? 'Edit Achievement' : 'Publish Verified Achievement'}
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

              {/* MANDATORY PROOF IMAGE UPLOAD */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>Certificate / Proof Picture</span>
                    <span className="text-purple-400 text-[10px] font-mono">*MANDATORY</span>
                  </label>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (Max 5MB)</span>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    imageUrl
                      ? 'border-purple-500/50 bg-purple-950/20'
                      : isDragOver
                      ? 'border-purple-400 bg-purple-950/40'
                      : 'border-white/10 hover:border-purple-500/40 hover:bg-slate-900/40'
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
                    <div className="flex items-center justify-center gap-2 text-purple-400 text-xs py-3">
                      <span className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                      <span>Uploading proof image to storage...</span>
                    </div>
                  ) : imageUrl ? (
                    <div className="flex items-center justify-center gap-4 py-2">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-16 h-16 object-contain rounded-lg bg-black/60 p-1 border border-purple-500/40 shadow-md"
                      />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Proof verified & loaded
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click to replace</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 space-y-1">
                      <Upload className="w-6 h-6 mx-auto text-purple-400/80 mb-1" />
                      <p className="text-xs text-slate-300">
                        <span className="text-purple-400 font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Certificate photo, trophy picture, or acceptance letter
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Achievement Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 1st Place - National Smart India Hackathon"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AchievementCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Competition">Competition</option>
                    <option value="Certification">Certification</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Project">Project</option>
                    <option value="Club">Club Achievement</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={achievementDate}
                    onChange={(e) => setAchievementDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Organization / Issuer
                </label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Devfolio / Google / AWS / College"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Verification URL (Optional)
                </label>
                <input
                  type="url"
                  value={proofLink}
                  onChange={(e) => setProofLink(e.target.value)}
                  placeholder="https://github.com/... or cert credential link"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Description & Impact
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what you built or accomplished, your tech stack, and key metrics..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={!imageUrl || isUploading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Trophy className="w-4 h-4" />
                  <span>{editingAchievement ? 'Save Changes' : 'Publish Achievement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[90vh] bg-[#090D16] border border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col items-center cursor-default"
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/60 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-h-[65vh] max-w-full object-contain filter drop-shadow-[0_15px_30px_rgba(168,85,247,0.2)]"
            />

            <div className="text-center mt-4">
              <h3 className="text-base font-bold text-white">{lightboxImage.title}</h3>
              <p className="text-xs text-purple-400 mt-0.5">{lightboxImage.org}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
