import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  Flame,
} from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState(db.getLeaderboard());

  useEffect(() => {
    setLeaderboard(db.getLeaderboard());
    const unsub = db.subscribe('leaderboard', () => {
      setLeaderboard(db.getLeaderboard());
    });
    return () => unsub();
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#acffce', '#89eefa', '#a2a7ff', '#ffffff'],
    });
  };

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191a1e] border border-white/10 text-xs font-mono text-[#acffce] uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-[#acffce]" />
          <span>BST TECH CLUB RANKINGS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
          Digital Sticker Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-white/50">
          Ranked by verified event stickers & Hacktoberfest 2026 pull request badges. Earn stickers to climb the citadel podium.
        </p>
      </div>

      {/* 3D Glowing Podium for Top 3 (Byotone Style) */}
      {leaderboard.length >= 3 && (
        <div className="max-w-4xl mx-auto pt-6 pb-2">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end">
            {/* Rank 2 (Silver) */}
            <div
              onClick={triggerConfetti}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="relative mb-3 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white/70 mb-2 group-hover:scale-110 transition-transform">
                  <Medal className="w-4 h-4 text-white/70" />
                </div>
                <div className="relative">
                  <img
                    src={top2.user.avatar_url}
                    alt={top2.user.full_name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-black/40 border border-white/25 shadow-lg group-hover:border-white transition-all"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#191a1e] border border-white/20 text-[10px] font-mono font-bold text-white">
                    #02
                  </span>
                </div>
              </div>

              <div className="text-center mt-2 w-full">
                <p className="text-xs sm:text-sm font-bold text-white truncate px-1">
                  {top2.user.full_name}
                </p>
                <p className="text-[11px] text-white/40 font-mono">
                  {top2.sticker_count} Stickers
                </p>
              </div>

              {/* Podium Block */}
              <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-[#191a1e] border-t border-x border-white/15 p-3 flex flex-col items-center justify-center shadow-lg mt-3">
                <span className="text-2xl sm:text-3xl font-display font-bold text-white/70">
                  2nd
                </span>
                <span className="text-[10px] font-mono text-white/40 mt-1 uppercase tracking-wider">
                  Silver Pod
                </span>
              </div>
            </div>

            {/* Rank 1 (Gold / Byotone Mint Accent - Elevated) */}
            <div
              onClick={triggerConfetti}
              className="flex flex-col items-center cursor-pointer group -translate-y-4"
            >
              <div className="relative mb-3 flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-[#acffce]/10 border border-[#acffce]/40 flex items-center justify-center text-[#acffce] mb-2 group-hover:scale-120 transition-transform">
                  <Crown className="w-5 h-5 text-[#acffce]" />
                </div>
                <div className="relative">
                  <img
                    src={top1.user.avatar_url}
                    alt={top1.user.full_name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-black/40 border-2 border-[#acffce] shadow-xl shadow-[#acffce]/15 group-hover:shadow-[#acffce]/30 transition-all"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#acffce] text-[#191a1e] text-xs font-mono font-bold shadow-md">
                    #01
                  </span>
                </div>
              </div>

              <div className="text-center mt-2 w-full">
                <p className="text-sm sm:text-base font-extrabold text-white truncate px-1">
                  {top1.user.full_name}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="text-xs text-[#acffce] font-mono font-bold">
                    {top1.sticker_count} Stickers
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    ({top1.hacktoberfest_count} HF)
                  </span>
                </div>
              </div>

              {/* Podium Block */}
              <div className="w-full h-36 sm:h-48 rounded-t-2xl bg-[#191a1e] border-t-2 border-x border-[#acffce]/50 p-3 flex flex-col items-center justify-center shadow-2xl mt-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(172,255,206,0.1),transparent_70%)] pointer-events-none" />
                <span className="text-3xl sm:text-4xl font-display font-bold text-[#acffce]">
                  1st
                </span>
                <span className="text-[10px] font-mono text-white/50 mt-1 uppercase tracking-widest">
                  Club Lead
                </span>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div
              onClick={triggerConfetti}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="relative mb-3 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#ffe990]/10 border border-[#ffe990]/30 flex items-center justify-center text-[#ffe990] mb-2 group-hover:scale-110 transition-transform">
                  <Medal className="w-4 h-4 text-[#ffe990]" />
                </div>
                <div className="relative">
                  <img
                    src={top3.user.avatar_url}
                    alt={top3.user.full_name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-black/40 border border-white/20 shadow-lg group-hover:border-white transition-all"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#191a1e] border border-white/20 text-[10px] font-mono font-bold text-white/80">
                    #03
                  </span>
                </div>
              </div>

              <div className="text-center mt-2 w-full">
                <p className="text-xs sm:text-sm font-bold text-white truncate px-1">
                  {top3.user.full_name}
                </p>
                <p className="text-[11px] text-white/40 font-mono">
                  {top3.sticker_count} Stickers
                </p>
              </div>

              {/* Podium Block */}
              <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-[#191a1e] border-t border-x border-white/15 p-3 flex flex-col items-center justify-center shadow-lg mt-3">
                <span className="text-2xl sm:text-3xl font-display font-bold text-white/50">
                  3rd
                </span>
                <span className="text-[10px] font-mono text-white/40 mt-1 uppercase tracking-wider">
                  Bronze Pod
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table (Byotone clean table) */}
      <div className="max-w-4xl mx-auto byotone-card rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 bg-[#131418] flex items-center justify-between">
          <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#acffce]" />
            <span>Complete Member Standings</span>
          </h3>
          <span className="text-xs font-mono text-white/40">
            {leaderboard.length} Verified Participants
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {leaderboard.map((entry) => {
            const isTop3 = entry.rank <= 3;
            return (
              <div
                key={entry.user.id}
                className={`p-4 sm:px-6 flex items-center justify-between transition-colors ${
                  isTop3 ? 'bg-[#191a1e]/90 hover:bg-[#202227]' : 'hover:bg-[#191a1e]'
                }`}
              >
                {/* Rank & User Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-8 text-center shrink-0 font-mono text-xs text-white/40">
                    {entry.rank === 1 ? (
                      <span className="text-[#acffce] font-bold">01</span>
                    ) : entry.rank === 2 ? (
                      <span className="text-white font-bold">02</span>
                    ) : entry.rank === 3 ? (
                      <span className="text-[#ffe990] font-bold">03</span>
                    ) : (
                      <span>{entry.rank < 10 ? `0${entry.rank}` : entry.rank}</span>
                    )}
                  </div>

                  <img
                    src={entry.user.avatar_url}
                    alt={entry.user.full_name}
                    className="w-10 h-10 rounded-xl object-cover bg-black/40 border border-white/10 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white truncate">
                        {entry.user.full_name}
                      </p>
                      {entry.user.role === 'admin' && (
                        <span className="text-[9px] font-mono uppercase tracking-wider text-[#acffce] bg-[#acffce]/10 px-1.5 py-0.2 rounded border border-[#acffce]/30">
                          Lead
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 font-mono truncate">
                      {entry.user.roll_number} • {entry.user.year}
                    </p>
                  </div>
                </div>

                {/* Badges Preview & Count */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex items-center -space-x-2">
                    {entry.recent_stickers.map((stk) => (
                      <img
                        key={stk.id}
                        src={stk.image_url}
                        alt={stk.sticker_name}
                        title={stk.sticker_name}
                        className="w-7 h-7 rounded-lg object-contain bg-black/60 border border-white/10 shadow-sm"
                      />
                    ))}
                  </div>

                  <div className="text-right min-w-[70px]">
                    <p className="text-base font-mono font-bold text-[#acffce] tabular-nums">
                      {entry.sticker_count}
                    </p>
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                      Stickers
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
