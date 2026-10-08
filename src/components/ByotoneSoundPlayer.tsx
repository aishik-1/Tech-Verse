import React, { useState, useEffect, useRef } from 'react';

interface ByotoneSoundPlayerProps {
  energy: number;
  onEnergyChange: (val: number) => void;
  isPlaying: boolean;
  onTogglePlay: (playing: boolean) => void;
}

export const ByotoneSoundPlayer: React.FC<ByotoneSoundPlayerProps> = ({
  energy,
  onEnergyChange,
  isPlaying,
  onTogglePlay,
}) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Determine current brainwave state based on energy level
  const getStateInfo = (val: number) => {
    if (val < 25) return { name: 'Delta', hz: '3.2 Hz', baseFreq: 108 };
    if (val < 50) return { name: 'Theta', hz: '5.5 Hz', baseFreq: 136.1 };
    if (val < 75) return { name: 'Alpha', hz: '8.0 Hz', baseFreq: 174 };
    return { name: 'Gamma', hz: '40.0 Hz', baseFreq: 216 };
  };

  const current = getStateInfo(energy);

  // Web Audio Synthesis (pure harmonic binaural drone)
  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 1.2);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Binaural carrier frequencies
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();

      const freq = current.baseFreq;
      const delta = parseFloat(current.hz);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, ctx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq + delta, ctx.currentTime);

      osc1.connect(masterGain);
      osc2.connect(masterGain);

      osc1.start();
      osc2.start();

      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      onTogglePlay(true);
    } catch (e) {
      console.warn('AudioContext not allowed or supported', e);
      onTogglePlay(true);
    }
  };

  const stopAudio = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtxRef.current.currentTime + 0.4
      );
      setTimeout(() => {
        try {
          osc1Ref.current?.stop();
          osc2Ref.current?.stop();
          audioCtxRef.current?.close();
        } catch {
          // ignore
        }
        audioCtxRef.current = null;
        onTogglePlay(false);
      }, 450);
    } else {
      onTogglePlay(false);
    }
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Adjust pitch dynamically when energy changes
  useEffect(() => {
    if (isPlaying && osc1Ref.current && osc2Ref.current && audioCtxRef.current) {
      const freq = current.baseFreq;
      const delta = parseFloat(current.hz);
      osc1Ref.current.frequency.setTargetAtTime(freq, audioCtxRef.current.currentTime, 0.2);
      osc2Ref.current.frequency.setTargetAtTime(freq + delta, audioCtxRef.current.currentTime, 0.2);
    }
  }, [energy, isPlaying, current.baseFreq, current.hz]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // noop
        }
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-3 sm:gap-5 px-3 py-1.5 rounded-full bg-[#191a1e]/90 border border-white/10 backdrop-blur-md shadow-2xl text-xs">
      {/* State Label: Alpha • 8.0 Hz */}
      <div className="flex items-center gap-1.5 font-mono text-[11px] whitespace-nowrap">
        <span className="font-semibold text-white tracking-wider uppercase">{current.name}</span>
        <span className="text-white/30">•</span>
        <span className="c-accent font-medium">{current.hz}</span>
      </div>

      {/* Energy Slider Track */}
      <div className="relative flex items-center w-24 sm:w-28 h-4">
        {/* Track Line */}
        <div className="absolute inset-x-0 h-[1px] bg-white/20" />
        {/* Track dots */}
        <div className="absolute inset-x-0 flex justify-between pointer-events-none px-0.5">
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span className="w-1 h-1 rounded-full bg-white/40" />
        </div>
        {/* Input Range */}
        <input
          type="range"
          min="0"
          max="100"
          value={energy}
          onChange={(e) => onEnergyChange(parseFloat(e.target.value))}
          className="relative z-10 w-full appearance-none bg-transparent cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#191a1e] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#acffce] [&::-webkit-slider-thumb]:shadow-[0_0_8px_#acffce]"
          aria-label="Field resonance energy slider"
        />
      </div>

      {/* Sound Play/Pause Button with Sinusoidal Waveform */}
      <button
        onClick={toggleSound}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          isPlaying
            ? 'border border-[#acffce] text-[#acffce] bg-[#acffce]/10 shadow-[0_0_12px_rgba(172,255,206,0.3)]'
            : 'border border-white/20 text-white/50 hover:text-white hover:border-white/40'
        }`}
        title={isPlaying ? 'Mute ambient harmonic drone' : 'Play Byotone harmonic sound'}
        aria-label="Toggle harmonic sound"
      >
        <svg
          viewBox="0 0 16 10"
          className={`w-4 h-2.5 transition-transform ${isPlaying ? 'scale-110' : 'opacity-60'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          {isPlaying ? (
            <path
              d="M1 5 Q 3.5 0, 6 5 T 11 5 T 15 5"
              className="animate-pulse"
            />
          ) : (
            <path d="M1 5 L 15 5" />
          )}
        </svg>
      </button>
    </div>
  );
};
