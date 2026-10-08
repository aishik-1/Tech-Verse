import React, { useState, useEffect, useRef } from 'react';
import { ByotoneWebglShape, ByotoneGeometry } from './ByotoneWebglShape';
import { ByotoneSoundPlayer } from './ByotoneSoundPlayer';
import { TechTracksSection } from './TechTracksSection';
import {
  GitPullRequest,
  Trophy,
  Lightbulb,
  Users,
  Terminal,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Play,
  Pause,
  Calendar,
  Clock,
  Radio,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Flame,
  Award,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreDemo,
}) => {
  const [energy, setEnergy] = useState<number>(50);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const [geometryType, setGeometryType] = useState<ByotoneGeometry>('knot');
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Audio Dispatch / Voice Note state
  const [activeVoiceDispatch, setActiveVoiceDispatch] = useState<number | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedNotes, setRecordedNotes] = useState<string[]>([]);
  const recordIntervalRef = useRef<number | null>(null);

  // Somatic frequency cards
  const [activeHarmonicPreset, setActiveHarmonicPreset] = useState<number>(2); // Alpha 8Hz / 432Hz

  // RSVP state for upcoming club sessions
  const [rsvpList, setRsvpList] = useState<{ [key: string]: boolean }>({
    'sprint-1': true,
  });

  const gitCommand = 'git clone https://github.com/bst-techverse/hacktoberfest-2026.git';

  const handleCopyCommand = () => {
    navigator.clipboard?.writeText(gitCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const harmonicFrequencies = [
    {
      hz: '108 Hz',
      beat: '3.2 Hz',
      state: 'Delta',
      tag: '01 // DEEP RESET',
      title: 'Sub-bass Grounding',
      description: 'Ultra-low resonance designed to reduce autonomic tension after grueling debugging and late-night sprints.',
      energyVal: 15,
      accent: 'text-[#acffce]',
      border: 'border-[#acffce]/30',
      glow: 'shadow-[0_0_24px_rgba(172,255,206,0.15)]',
      bg: 'bg-[#acffce]/10',
    },
    {
      hz: '136.1 Hz',
      beat: '5.5 Hz',
      state: 'Theta',
      tag: '02 // ARCHITECTURE',
      title: 'Neural Phase-Lock',
      description: 'Somatic frequency for complex system architecture, database graph schema design, and algorithmic focus.',
      energyVal: 40,
      accent: 'text-[#89eefa]',
      border: 'border-[#89eefa]/30',
      glow: 'shadow-[0_0_24px_rgba(137,238,250,0.15)]',
      bg: 'bg-[#89eefa]/10',
    },
    {
      hz: '174 Hz',
      beat: '8.0 Hz',
      state: 'Alpha',
      tag: '03 // SOMATIC CALM',
      title: 'Harmonic Flow State',
      description: 'The golden ratio of calmness and active building. Moves your cognition from panic into relaxed precision.',
      energyVal: 65,
      accent: 'text-[#a2a7ff]',
      border: 'border-[#a2a7ff]/30',
      glow: 'shadow-[0_0_24px_rgba(162,167,255,0.15)]',
      bg: 'bg-[#a2a7ff]/10',
    },
    {
      hz: '216 Hz',
      beat: '40.0 Hz',
      state: 'Gamma',
      tag: '04 // HIGH VELOCITY',
      title: 'Hyper-Focus Sprint',
      description: 'Synchronous Gamma wave stimulation for hackathon speed runs, fast pull request commits, and live demos.',
      energyVal: 90,
      accent: 'text-[#ffe990]',
      border: 'border-[#ffe990]/30',
      glow: 'shadow-[0_0_24px_rgba(255,233,144,0.15)]',
      bg: 'bg-[#ffe990]/10',
    },
  ];

  const handleSelectFrequency = (idx: number) => {
    setActiveHarmonicPreset(idx);
    setEnergy(harmonicFrequencies[idx].energyVal);
    if (!isPlayingSound) {
      setIsPlayingSound(true);
    }
  };

  const chapters = [
    {
      index: '01',
      letter: 'A',
      title: 'A digital citadel for student engineering',
      subtitle: 'Why TechVerse?',
      description:
        'College tech clubs shouldn’t rely on scattered spreadsheets or generic social feeds. TechVerse provides a cohesive, single-pane ecosystem for BST Tech Club students to verify achievements, log sprint PRs, and connect.',
      metric: '120+ Active Club Engineers',
      accentColor: 'text-[#acffce]',
      borderColor: 'border-[#acffce]',
    },
    {
      index: '02',
      letter: 'B',
      title: 'The Hacktoberfest 2026 resonance sprint',
      subtitle: 'Week 1 Challenge',
      description:
        'Submit screenshots of four approved open-source pull requests. Every verified submission automatically mints a permanent digital sticker badge and elevates your ranking on the club leaderboard.',
      metric: '48+ Merged PRs Verified',
      accentColor: 'text-[#89eefa]',
      borderColor: 'border-[#89eefa]',
    },
    {
      index: '03',
      letter: 'C',
      title: 'Verified proof vault & trophy showcase',
      subtitle: 'Honors & Podiums',
      description:
        'From SIH grand finalist seals to ETHIndia runner-up honors and AWS cloud certifications: each achievement is permanently authenticated with proof documentation and viewable in high-definition lightboxes.',
      metric: '32 National Podiums',
      accentColor: 'text-[#a2a7ff]',
      borderColor: 'border-[#a2a7ff]',
    },
    {
      index: '04',
      letter: 'D',
      title: 'Collective frequency & the idea board',
      subtitle: 'Harmonic Collaboration',
      description:
        'Post autonomous rover blueprints, edge AI camera prototypes, or smart campus exchange proposals. Upvote groundbreaking student ideas and assemble hackathon squads in the live community channel.',
      metric: '19 Sparks & Prototypes',
      accentColor: 'text-[#ffe990]',
      borderColor: 'border-[#ffe990]',
    },
  ];

  const voiceDispatches = [
    {
      id: 0,
      author: 'Aishik Roy',
      role: 'Club Lead & Core Architect',
      title: 'Hacktoberfest 2026 Sprint Directives',
      duration: '0:38',
      date: 'Today, 09:30 AM',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      waveform: [35, 60, 45, 90, 80, 50, 75, 95, 40, 70, 85, 60, 40, 65, 80, 45, 90, 65, 40, 55, 30],
      transcript:
        '“Welcome to the Week 1 open-source sprint. Remember to focus on quality repository contributions—verify that issues are tagged #hacktoberfest before opening your pull request. Upload your proof screenshot immediately to the TechVerse vault.”',
    },
    {
      id: 1,
      author: 'Priya Sharma',
      role: 'SIH Finalist & Hardware Lead',
      title: 'Smart India Hackathon Hardware Scrutiny',
      duration: '0:42',
      date: 'Yesterday, 17:15 PM',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      waveform: [20, 45, 75, 60, 85, 95, 70, 55, 80, 60, 40, 70, 90, 85, 60, 75, 50, 40, 60, 45, 25],
      transcript:
        '“Our Smart India Hackathon IoT sensor telemetry model is running with 99.4% precision. If anyone is in Lab 402 this evening, we are calibrating the edge microcontroller for the internal review.”',
    },
    {
      id: 2,
      author: 'Rohan Verma',
      role: 'Full Stack & Open Source Lead',
      title: 'Kubernetes Docs & React 19 PR Merged',
      duration: '0:29',
      date: '2 days ago',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      waveform: [30, 50, 40, 70, 60, 80, 95, 85, 70, 90, 65, 45, 75, 85, 60, 50, 70, 40, 60, 35, 20],
      transcript:
        '“Just verified 4 pull requests merged into upstream open-source repositories! The TechVerse sticker minting system automatically credited the badges to the leaderboard.”',
    },
  ];

  const upcomingSessions = [
    {
      id: 'sprint-1',
      date: 'Oct 12, 2026',
      time: '18:00 — 19:30 IST',
      category: 'LIVE SPRINT',
      title: 'Open Source Git & PR Mastery Workshop',
      speaker: 'Aishik Roy // BST Tech Hub & Online',
      seats: '34 / 50 Confirmed',
      badge: 'Hacktoberfest',
    },
    {
      id: 'sprint-2',
      date: 'Oct 18, 2026',
      time: '14:00 — 17:00 IST',
      category: 'COMPETITION',
      title: 'SIH Internal Scrutiny & Prototype Demo',
      speaker: 'Priya Sharma // Seminar Hall 4',
      seats: '18 / 25 Confirmed',
      badge: 'National SIH',
    },
    {
      id: 'sprint-3',
      date: 'Oct 25, 2026',
      time: '20:00 — 08:00 IST',
      category: 'HACKATHON',
      title: '24-Hour Autonomous Systems Overnight Sprint',
      speaker: 'BST Core Council // Lab 402',
      seats: '42 / 60 Confirmed',
      badge: 'Hardware & AI',
    },
  ];

  const faqs = [
    {
      q: 'How does TechVerse authenticate Hacktoberfest PR badges?',
      a: 'Students submit direct links and unedited screenshots of approved GitHub or GitLab pull requests. TechVerse administrators review the submission and cryptographic timestamps, minting an immutable sticker badge directly to the student’s profile and updating the live leaderboard.',
    },
    {
      q: 'What is the Byotōne-inspired philosophy behind TechVerse?',
      a: 'We believe student engineering should be calming, focused, and free from noise. Instead of cluttered, slow college portals, TechVerse uses acoustic harmonic principles, deep dark stone palettes (#131418), organic WebGL fluid spatial geometry, and instant responsiveness to move students from academic overwhelm into steady flow.',
    },
    {
      q: 'Can 1st and 2nd year students participate and add achievements?',
      a: 'Absolutely. TechVerse is open to all students across all engineering years. First-year students can add coding milestones, hackathon participation certificates, and open-source contributions. Every entry counts toward your club reputation.',
    },
    {
      q: 'How does the student Idea Board foster team formation?',
      a: 'Any member can post technical blueprints, hardware designs, or software project ideas. Other students can vote with likes, leave feedback in the community channel, and assemble multidisciplinary hackathon teams directly in real time.',
    },
  ];

  const handleToggleVoicePlay = (idx: number) => {
    if (activeVoiceDispatch === idx && isPlayingVoice) {
      setIsPlayingVoice(false);
    } else {
      setActiveVoiceDispatch(idx);
      setIsPlayingVoice(true);
    }
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      // Stop
      setIsRecording(false);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      setRecordedNotes((prev) => [
        `Voice Memo #${prev.length + 1} (${recordingSeconds}s) — Transmitted to BST Club Leads`,
        ...prev,
      ]);
      setRecordingSeconds(0);
    } else {
      // Start recording simulator
      setIsRecording(true);
      setRecordingSeconds(0);
      recordIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, []);

  const handleToggleRsvp = (id: string) => {
    setRsvpList((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="relative min-h-screen bg-[#131418] text-white/65 selection:bg-[#acffce]/25 selection:text-[#acffce] overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: HERO VIEWPORT WITH BYOTONE FLUID 3D MESH & DOM */}
      {/* ------------------------------------------------------------- */}
      <section className="relative w-full h-[90vh] min-h-[660px] max-h-[940px] flex flex-col justify-between overflow-hidden border-b border-white/10">
        {/* 3D WebGL Fluid Canvas with Byotone Mask */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, #000 70%, rgba(0,0,0,0) 100%)',
            maskImage: 'linear-gradient(to bottom, #000 70%, rgba(0,0,0,0) 100%)',
          }}
        >
          <ByotoneWebglShape
            energy={energy}
            isPlayingSound={isPlayingSound}
            geometryType={geometryType}
          />
        </div>

        {/* Ambient Radial Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_38%,rgba(172,255,206,0.06),transparent_70%)] pointer-events-none" />

        {/* Top Floating Coordinates */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-white/40">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#acffce] animate-pulse" />
            <span className="text-white/70">TechVerse // BST Tech Club</span>
          </div>

          {/* 3D Geometry Mode Selector (Byotone style switcher) */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-[#191a1e]/90 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] text-white/35 px-2">GEOMETRY:</span>
            {(['knot', 'sphere', 'crystal'] as ByotoneGeometry[]).map((geo) => (
              <button
                key={geo}
                onClick={() => setGeometryType(geo)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider transition-all uppercase cursor-pointer ${
                  geometryType === geo
                    ? 'bg-[#acffce] text-[#131418] font-bold shadow-[0_0_8px_#acffce]'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {geo === 'knot' ? 'Torus Knot' : geo === 'sphere' ? 'Somatic Sphere' : 'Crystal Core'}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span>Harmonic State</span>
            <span className="text-white/20">•</span>
            <span className="c-accent">Hacktoberfest '26</span>
          </div>
        </div>

        {/* Hero Center Text & Byotone Title Structure */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center my-auto space-y-6">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/15 bg-[#191a1e]/85 backdrop-blur-md text-[11px] font-mono tracking-wider text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-[#acffce]" />
            <span className="text-white font-medium">ALPHA SPRINT ACTIVE</span>
            <span className="text-white/25">•</span>
            <span className="c-accent font-semibold">4/4 PR GOAL</span>
            <span className="text-white/25">•</span>
            <span className="text-white/50">120+ STUDENTS ONLINE</span>
          </div>

          {/* Byotone Staggered Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight text-white leading-[1.08]">
            <span>Your tech journey is uncalibrated.</span>
            <br />
            <span className="c-accent">It’s time to tune your frequency.</span>
          </h1>

          <p className="text-sm sm:text-base text-white/65 max-w-xl mx-auto font-normal leading-relaxed">
            The official student engineering citadel of BST Tech Club. Track Hacktoberfest badges, immortalize hackathon achievements, spark ideas, and lead the student rankings.
          </p>

          {/* Action Buttons in Byotone button-orbit style */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <button
              onClick={onGetStarted}
              className="button-orbit is-primary flex items-center gap-2 group w-full sm:w-auto"
            >
              <span>Enter Student Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreDemo}
              className="button-orbit flex items-center gap-2 w-full sm:w-auto"
            >
              <span>Explore as Guest Member</span>
            </button>
          </div>
        </div>

        {/* Hero Bottom Bar: Byotone Sound Player & Terminal */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Terminal Command Chip */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#191a1e]/90 border border-white/10 text-xs font-mono text-white/60 backdrop-blur-md max-w-md w-full sm:w-auto justify-between">
            <div className="flex items-center gap-2 truncate">
              <Terminal className="w-3.5 h-3.5 text-[#acffce] shrink-0" />
              <span className="text-white/40">$</span>
              <span className="text-white/80 truncate text-[11px]">{gitCommand}</span>
            </div>
            <button
              onClick={handleCopyCommand}
              className="p-1 hover:text-[#acffce] transition-colors shrink-0 ml-2 cursor-pointer"
              title="Copy git clone"
              aria-label="Copy clone command"
            >
              {copiedCmd ? (
                <Check className="w-3.5 h-3.5 text-[#acffce]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Byotone Sound Player (Interactive Harmonic Oscillator) */}
          <ByotoneSoundPlayer
            energy={energy}
            onEnergyChange={setEnergy}
            isPlaying={isPlayingSound}
            onTogglePlay={setIsPlayingSound}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1.5: THE FOUR PILLARS (OPEN SOURCE • ICPC • ROBOTICS • HACKATHONS) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <TechTracksSection onJoinTrack={() => onGetStarted()} />
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: SOMATIC HARMONIC FREQUENCIES & SOUND LAB */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <span className="c-accent font-mono text-xs uppercase tracking-widest flex items-center gap-2">
              <Radio className="w-3.5 h-3.5" />
              <span>Resonance Architecture • Sound Bath & Focus</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
              Calibrated soundscapes for code
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/50 max-w-md leading-relaxed">
            Inspired by Byotōne’s live frequency research. Click any harmonic channel below to synthesize binaural sub-tones and adjust the 3D sculpture’s vibration in real time.
          </p>
        </div>

        {/* 4 Harmonic Frequencies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {harmonicFrequencies.map((hf, idx) => {
            const isSelected = activeHarmonicPreset === idx;
            return (
              <div
                key={hf.state}
                onClick={() => handleSelectFrequency(idx)}
                className={`p-6 sm:p-7 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? `bg-[#191a1e] ${hf.border} ${hf.glow} -translate-y-1.5`
                    : 'bg-[#16171b]/80 border-white/10 hover:border-white/20 hover:bg-[#191a1e]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-white/40">{hf.tag}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${hf.bg} ${hf.accent}`}>
                      {hf.state}
                    </span>
                  </div>

                  <div>
                    <p className={`text-2xl font-mono font-bold tracking-tight ${hf.accent}`}>
                      {hf.hz}
                    </p>
                    <p className="text-xs font-mono text-white/40">
                      Binaural Pulse: {hf.beat}
                    </p>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    {hf.title}
                  </h3>

                  <p className="text-xs text-white/60 leading-relaxed">
                    {hf.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className={hf.accent}>
                    {isSelected && isPlayingSound ? '• Resonating Now' : 'Select Channel'}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? hf.bg : 'bg-white/5'}`}>
                    <Volume2 className={`w-3.5 h-3.5 ${isSelected ? hf.accent : 'text-white/40'}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: BYOTONE CHAPTERS (EDITORIAL NUMBERED SECTIONS) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <span className="c-accent font-mono text-xs uppercase tracking-widest">
              Chapters • 01 / 04
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
              A regulator for student technology
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/50 max-w-md leading-relaxed">
            Crafted like a high-end product, not a generic college portal. Built with precision for students who build, ship, and compete.
          </p>
        </div>

        {/* Chapters Cards Layout (Byotone Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {chapters.map((chap, idx) => {
            const isSelected = activeChapter === idx;
            return (
              <div
                key={chap.index}
                onClick={() => setActiveChapter(idx)}
                className={`p-6 sm:p-7 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-[#191a1e] border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.5)] -translate-y-1'
                    : 'bg-[#16171b]/80 border-white/10 hover:border-white/20 hover:bg-[#191a1e]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-white/40">
                      {chap.letter} // {chap.index}
                    </span>
                    <span className={`${chap.accentColor} font-semibold uppercase tracking-wider`}>
                      {chap.subtitle}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    {chap.title}
                  </h3>

                  <p className="text-xs text-white/60 leading-relaxed">
                    {chap.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                  <span className={`text-[11px] font-mono ${chap.accentColor}`}>
                    {chap.metric}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: BYOTONE VOICE DISPATCH & AUDIO MEMO LAB */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-[#191a1e] border border-white/10 p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#a2a7ff]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Introduction to Somatic Voice Notes */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#a2a7ff]">
                <Mic className="w-4 h-4" />
                <span>Byotōne Somatic Feature</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                Voice dispatches over sterile forms.
              </h2>

              <p className="text-xs sm:text-sm text-white/65 leading-relaxed">
                Byotōne reimagines traditional text contacts with spatial voice notes. In TechVerse, students listen to authentic weekly council voice briefings, or record an audio dispatch directly to the leads.
              </p>

              {/* Record Voice Note Box */}
              <div className="p-5 rounded-2xl bg-[#131418] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-white/60">
                    Student Audio Dispatch
                  </span>
                  {isRecording && (
                    <span className="flex items-center gap-1.5 text-xs font-mono text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      REC 0:0{recordingSeconds}s
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleToggleRecord}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-rose-500 text-white shadow-[0_0_18px_rgba(244,63,94,0.5)]'
                        : 'bg-[#a2a7ff] text-[#131418] hover:bg-[#b8bcff] shadow-[0_0_18px_rgba(162,167,255,0.25)]'
                    }`}
                    title={isRecording ? 'Stop Recording' : 'Start Recording Voice Note'}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <div className="text-xs text-white/60">
                    <p className="font-semibold text-white">
                      {isRecording ? 'Capturing mic frequency...' : 'Leave a Voice Dispatch'}
                    </p>
                    <p className="text-[11px] text-white/40">
                      {isRecording ? 'Click to finalize and send' : 'Transmit queries, ideas, or feedback to council'}
                    </p>
                  </div>
                </div>

                {recordedNotes.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    {recordedNotes.map((note, nIdx) => (
                      <div key={nIdx} className="text-[11px] font-mono text-[#acffce] flex items-center gap-2">
                        <Check className="w-3 h-3 shrink-0" />
                        <span className="truncate">{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Audio Player Cards of Club Council */}
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-white/40 pb-2">
                Recent Club Dispatches (Listen Live)
              </div>

              {voiceDispatches.map((dispatch) => {
                const isSelected = activeVoiceDispatch === dispatch.id;
                const isCurrentPlaying = isSelected && isPlayingVoice;

                return (
                  <div
                    key={dispatch.id}
                    className={`p-5 rounded-2xl transition-all duration-300 border ${
                      isSelected
                        ? 'bg-[#16171b] border-[#a2a7ff]/40 shadow-xl'
                        : 'bg-[#131418]/80 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Avatar and Author */}
                      <div className="flex items-center gap-3">
                        <img
                          src={dispatch.avatar}
                          alt={dispatch.author}
                          className="w-10 h-10 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-mono">
                              {dispatch.author}
                            </span>
                            <span className="text-[10px] font-mono text-[#a2a7ff] px-1.5 py-0.5 rounded bg-[#a2a7ff]/10">
                              {dispatch.role}
                            </span>
                          </div>
                          <p className="text-xs text-white/70">{dispatch.title}</p>
                        </div>
                      </div>

                      {/* Play / Pause Button */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-white/40 hidden sm:inline">
                          {dispatch.duration}
                        </span>
                        <button
                          onClick={() => handleToggleVoicePlay(dispatch.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            isCurrentPlaying
                              ? 'bg-[#acffce] text-[#131418] shadow-[0_0_12px_#acffce]'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {isCurrentPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Waveform Bar Visualizer */}
                    <div className="flex items-end gap-1 h-8 mt-4 pt-2 border-t border-white/5">
                      {dispatch.waveform.map((height, wIdx) => (
                        <div
                          key={wIdx}
                          style={{ height: `${height}%` }}
                          className={`flex-1 rounded-full transition-all duration-200 ${
                            isCurrentPlaying
                              ? 'bg-[#acffce] opacity-90 animate-pulse'
                              : 'bg-white/20 hover:bg-white/40'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Transcript toggle */}
                    <div className="mt-3 text-[11px] font-mono text-white/50 italic bg-[#131418] p-2.5 rounded-lg border border-white/5">
                      {dispatch.transcript}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 5: HACKTOBERFEST 2026 BADGE FOCUS (BYOTONE SPOTLIGHT) */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-[#191a1e] border border-white/10 p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#acffce]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#acffce]">
                <GitPullRequest className="w-4 h-4" />
                <span>Hacktoberfest 2026 Sprint Active</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                Submit four merged pull requests.
                <br />
                <span className="text-white/60">Claim the verified club hero badge.</span>
              </h2>

              <p className="text-xs sm:text-sm text-white/65 leading-relaxed max-w-xl">
                Open source contributions reflect genuine software ability. Fork our club repositories or any participating open-source repo, get your PRs merged, and upload your proof directly to the TechVerse vault.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onGetStarted}
                  className="button-orbit is-primary flex items-center gap-2"
                >
                  <span>Submit PR Badge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onExploreDemo}
                  className="button-orbit flex items-center gap-2"
                >
                  <span>Inspect Leaderboard Standings</span>
                </button>
              </div>
            </div>

            {/* Right Badge Preview in Byotone Minimal Aesthetic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-[#131418] border border-white/15 p-6 flex flex-col items-center justify-between text-center shadow-2xl relative group">
                <div className="w-full flex justify-between font-mono text-[10px] text-white/40 uppercase">
                  <span>BST-HF-26</span>
                  <span className="c-accent">VERIFIED</span>
                </div>

                <div className="my-auto space-y-3">
                  <div className="w-20 h-20 mx-auto rounded-full bg-[#191a1e] border border-[#acffce]/40 flex items-center justify-center text-[#acffce] shadow-[0_0_24px_rgba(172,255,206,0.15)] group-hover:scale-105 transition-transform">
                    <GitPullRequest className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Hacktoberfest 2026
                  </p>
                  <p className="text-xs text-[#acffce] font-mono">Open Source Contributor</p>
                </div>

                <div className="w-full pt-3 border-t border-white/10 text-[10px] font-mono text-white/40">
                  <span>Cryptographic Attestation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 6: UPCOMING LIVE SPRINTS & SOMATIC SESSIONS */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <span className="c-accent font-mono text-xs uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Live Schedule • Semester Autumn 2026</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
              Sprints & somatic workshops
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/50 max-w-md leading-relaxed">
            Reserve your physical or virtual terminal for upcoming club sessions. Synchronized with the TechVerse calendar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingSessions.map((session) => {
            const hasRsvp = rsvpList[session.id] || false;
            return (
              <div
                key={session.id}
                className="p-6 rounded-2xl bg-[#191a1e] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#89eefa] px-2 py-0.5 rounded-full bg-[#89eefa]/10 border border-[#89eefa]/20 uppercase">
                      {session.category}
                    </span>
                    <span className="text-white/40">{session.badge}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    {session.title}
                  </h3>

                  <div className="space-y-1.5 text-xs font-mono text-white/60">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#acffce]" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#acffce]" />
                      <span>{session.time}</span>
                    </div>
                    <p className="text-white/40 pt-1">{session.speaker}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-white/40">
                    {session.seats}
                  </span>
                  <button
                    onClick={() => handleToggleRsvp(session.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      hasRsvp
                        ? 'bg-[#acffce] text-[#131418] font-bold shadow-[0_0_10px_#acffce]'
                        : 'border border-white/20 text-white hover:border-[#acffce] hover:text-[#acffce]'
                    }`}
                  >
                    {hasRsvp ? '✓ Terminal RSVP’d' : 'Reserve Spot'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 7: CLUB METRICS FOOTPRINT */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-y border-white/10 py-12">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-mono font-bold text-white">48+</p>
            <p className="text-xs font-mono uppercase text-white/40 tracking-wider">
              PRs Verified
            </p>
          </div>
          <div className="space-y-1 border-l border-white/10">
            <p className="text-3xl sm:text-4xl font-mono font-bold text-[#acffce]">32</p>
            <p className="text-xs font-mono uppercase text-white/40 tracking-wider">
              Trophies & Podiums
            </p>
          </div>
          <div className="space-y-1 border-l border-white/10">
            <p className="text-3xl sm:text-4xl font-mono font-bold text-[#89eefa]">19</p>
            <p className="text-xs font-mono uppercase text-white/40 tracking-wider">
              Disruptive Ideas
            </p>
          </div>
          <div className="space-y-1 border-l border-white/10">
            <p className="text-3xl sm:text-4xl font-mono font-bold text-[#a2a7ff]">120+</p>
            <p className="text-xs font-mono uppercase text-white/40 tracking-wider">
              Active Members
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 8: FAQ & SCIENTIFIC MANIFESTO */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10">
        <div className="text-center space-y-3">
          <span className="c-accent font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Clarity & Principles</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Frequently understood
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto">
            Everything you need to know about the BST TechVerse portal and verified sprint workflows.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, fIdx) => {
            const isOpen = activeFaq === fIdx;
            return (
              <div
                key={fIdx}
                className="rounded-2xl bg-[#191a1e] border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : fIdx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-semibold text-white text-sm sm:text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-white/50 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-[#acffce]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-white/60 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FOOTER (MATCHING BYOTONE CREDITS & MINIMAL STYLING) */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-white/10 bg-[#101114] py-12 text-xs text-white/40 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#acffce] shadow-[0_0_8px_#acffce]" />
                <span className="text-white font-bold tracking-widest text-base">TECHVERSE</span>
                <span className="text-white/20">•</span>
                <span className="text-white/60">BST TECH CLUB PLATFORM</span>
              </div>
              <p className="text-[11px] text-white/40 max-w-sm">
                Engineered for college builders. Acoustic somatic design system inspired by Byotōne.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-white/60 text-xs">
              <button
                onClick={onGetStarted}
                className="hover:text-[#acffce] transition-colors cursor-pointer"
              >
                Student Login
              </button>
              <button
                onClick={onExploreDemo}
                className="hover:text-[#acffce] transition-colors cursor-pointer"
              >
                Leaderboard
              </button>
              <a
                href="mailto:contact@bst.edu"
                className="hover:text-[#acffce] transition-colors"
              >
                contact@bst.edu
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>
              <span>Coordinates: BST Innovation Lab 402 // IST +05:30</span>
            </div>
            <div>
              <span>© 2026 TechVerse • All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
