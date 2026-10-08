import React, { useState } from 'react';
import {
  GitPullRequest,
  Terminal,
  Cpu,
  Trophy,
  ExternalLink,
  Users,
  Code2,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Flame,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type TrackCategory = 'all' | 'open_source' | 'cp' | 'robotics' | 'hackathon';

interface TechTracksSectionProps {
  onJoinTrack?: (track: string) => void;
  selectedTrack?: TrackCategory;
}

export const TechTracksSection: React.FC<TechTracksSectionProps> = ({
  onJoinTrack,
  selectedTrack = 'all',
}) => {
  const [activeFilter, setActiveFilter] = useState<TrackCategory>(selectedTrack);
  const [expandedTrack, setExpandedTrack] = useState<string | null>('open_source');

  const tracks = [
    {
      id: 'open_source',
      title: 'Open Source & Git Engineering',
      tag: 'PILLAR 01 // UPSTREAM',
      icon: GitPullRequest,
      badge: 'Hacktoberfest 2026 Active',
      lead: 'Aishik Roy & Rohan Verma',
      metrics: '48+ Merged PRs // 14 Club Repos',
      accentColor: 'text-[#acffce]',
      borderColor: 'border-[#acffce]/40',
      bgColor: 'bg-[#acffce]/10',
      summary:
        'Contribute to production-grade software worldwide. From documentation fixes to core distributed systems modules, we guide students through Git branching, rebasing, and open-source contribution etiquette.',
      highlights: [
        'Hacktoberfest 2026 PR Verification & Sticker Minting',
        'Fork & Contribute to BST Club Repositories',
        'Upstream PRs in React, Kubernetes, Vite & Linux Foundation',
        'Code Reviews by Senior Club Engineers',
      ],
      activeProjects: [
        { name: 'techverse-core', lang: 'TypeScript', stars: '142', desc: 'The student platform infrastructure repository' },
        { name: 'autonomous-nav-ros', lang: 'C++', stars: '89', desc: 'Autonomous waypoint planner for campus rovers' },
        { name: 'algo-vault', lang: 'Rust / Python', stars: '210', desc: 'Curated problem solutions and algorithmic proofs' },
      ],
    },
    {
      id: 'cp',
      title: 'ICPC & Competitive Programming',
      tag: 'PILLAR 02 // ALGORITHMS',
      icon: Terminal,
      badge: 'ICPC Regionals Qualifier',
      lead: 'Rohan Verma & Sneha Das',
      metrics: '1840 Peak Rating // 350+ Solved',
      accentColor: 'text-[#89eefa]',
      borderColor: 'border-[#89eefa]/40',
      bgColor: 'bg-[#89eefa]/10',
      summary:
        'Master data structures and asymptotic time complexities. We conduct weekly virtual algorithmic bouts on Codeforces, train teams for ICPC regional rounds, and prepare members for FAANG online assessments.',
      highlights: [
        'Weekly Saturday Virtual Contests on Codeforces & AtCoder',
        'Dynamic Programming & Graph Theory Deep Dives',
        'Mock ICPC 5-Hour 3-Member Team Rounds',
        'Editorial breakdowns with interactive tests',
      ],
      activeProjects: [
        { name: 'BST Contest Ladder', lang: 'Codeforces API', stars: '1840 Rank', desc: 'Live rating tracker of all enrolled BST students' },
        { name: 'Competitive Template Library', lang: 'C++20 / PBDS', stars: '4.9 Stars', desc: 'Fast I/O and segment tree template snippets' },
        { name: 'Euler Math Problem Set', lang: 'Python', stars: '95 Solved', desc: 'Number theory and combinatorics problem archive' },
      ],
    },
    {
      id: 'robotics',
      title: 'Robotics, IoT & Embedded Systems',
      tag: 'PILLAR 03 // HARDWARE',
      icon: Cpu,
      badge: 'Lab 402 Active',
      lead: 'Aishik Roy & Vikram Sengupta',
      metrics: '6 Autonomous Drones // 12 Microcontroller Nodes',
      accentColor: 'text-[#ffd166]',
      borderColor: 'border-[#ffd166]/40',
      bgColor: 'bg-[#ffd166]/10',
      summary:
        'Bridge the physical and digital domains. We build autonomous quadcopters, ESP32 telemetry arrays, and ROS2 ground rovers with computer vision sensor fusion.',
      highlights: [
        'ROS2 Humble & Gazebo Simulation Frameworks',
        'PCB Design in KiCad & Fabrication Sprints',
        'ESP32 & STM32 Sensor Network Mesh Nodes',
        'FPV Drone Assembly and Field Flight Days',
      ],
      activeProjects: [
        { name: 'Rover-X Mars Prototype', lang: 'ROS2 / Python', stars: 'Working Prototype', desc: '6-wheel rocker-bogie chassis with stereo vision' },
        { name: 'Campus Weather LoRa Node', lang: 'C++ / ESP32', stars: 'Live Telemetry', desc: 'Solar-powered ambient weather monitoring network' },
        { name: 'Computer Vision Line Follower', lang: 'OpenCV / C++', stars: 'National Finalist', desc: 'High-speed track navigation robot with camera' },
      ],
    },
    {
      id: 'hackathon',
      title: 'Hackathons & System Prototyping',
      tag: 'PILLAR 04 // SPRINT',
      icon: Trophy,
      badge: 'SIH Finalist Podiums',
      lead: 'Priya Sharma & Aishik Roy',
      metrics: '32 National Podiums // 12 Wins',
      accentColor: 'text-[#a2a7ff]',
      borderColor: 'border-[#a2a7ff]/40',
      bgColor: 'bg-[#a2a7ff]/10',
      summary:
        'Transform raw ideas into working MVPs in 24 to 36 hours. From Smart India Hackathon grand finals to Web3 hackathons, we assemble full-stack teams, draft pitch presentations, and sprint to the podium.',
      highlights: [
        'Smart India Hackathon (SIH) Internal Scrutiny Rounds',
        'Full-Stack Rapid Prototyping (React + Vite + Python/Node)',
        'Investor & Jury Pitch Deck Coaching Sessions',
        'Permanent Trophy & Certificate Verification Vault',
      ],
      activeProjects: [
        { name: 'SIH 2026 Telemetry Portal', lang: 'Hardware + Cloud', stars: 'Grand Finalist', desc: 'Smart disaster evacuation route planner for civic bodies' },
        { name: 'ETHIndia Decentralized Proof', lang: 'Solidity / React', stars: 'Top 10 Track', desc: 'Zero-knowledge academic credential verification system' },
        { name: 'HackBST 2026 Internal', lang: '36-Hour Hackathon', stars: '45 Teams', desc: 'Annual flagship BST Tech Club campus hackathon' },
      ],
    },
  ];

  const filteredTracks =
    activeFilter === 'all' ? tracks : tracks.filter((t) => t.id === activeFilter);

  return (
    <div className="space-y-10">
      {/* Pillar Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-xs text-[#ffd166] uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>Core Club Domains</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Four Pillars of Student Engineering
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#19171d] border border-white/10 text-xs font-mono uppercase">
          {[
            { id: 'all', label: 'All Tracks', color: 'bg-[#ffd166] text-[#131215]' },
            { id: 'open_source', label: 'Open Source', color: 'bg-[#acffce] text-[#131215]' },
            { id: 'cp', label: 'ICPC / CP', color: 'bg-[#89eefa] text-[#131215]' },
            { id: 'robotics', label: 'Robotics', color: 'bg-[#ffd166] text-[#131215]' },
            { id: 'hackathon', label: 'Hackathons', color: 'bg-[#a2a7ff] text-[#131215]' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? `${tab.color} font-bold shadow-md`
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tracks Grid with Framer Motion AnimatePresence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTracks.map((track) => {
            const Icon = track.icon;
            const isExpanded = expandedTrack === track.id;

            return (
              <motion.div
                layout
                key={track.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`rounded-3xl bg-[#19171d] border transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between space-y-6 ${
                  isExpanded ? `${track.borderColor} shadow-2xl` : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-white/40">{track.tag}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${track.bgColor} ${track.accentColor}`}>
                      {track.badge}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${track.bgColor} border border-white/10 flex items-center justify-center shrink-0`}>
                      <Icon className={`w-6 h-6 ${track.accentColor}`} />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                        {track.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-mono text-white/50 mt-1">
                        <span>Leads: {track.lead}</span>
                        <span>•</span>
                        <span className={track.accentColor}>{track.metrics}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                    {track.summary}
                  </p>

                  {/* Key Highlights */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      What Students Do in This Track:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {track.highlights.map((h, hIdx) => (
                        <div
                          key={hIdx}
                          className="flex items-center gap-2 text-xs font-mono text-white/70 p-2 rounded-xl bg-[#131215] border border-white/5"
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${track.accentColor}`} />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Projects Mini Table */}
                  <div className="space-y-2 pt-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      Featured Active Projects / Sprints:
                    </span>
                    <div className="space-y-2">
                      {track.activeProjects.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-3 rounded-xl bg-[#131215] border border-white/5 flex items-center justify-between gap-3 text-xs font-mono"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{p.name}</span>
                              <span className="text-[10px] text-white/40 px-1.5 py-0.2 rounded bg-white/5">
                                {p.lang}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50 mt-0.5">{p.desc}</p>
                          </div>
                          <span className={`text-[11px] font-semibold shrink-0 ${track.accentColor}`}>
                            {p.stars}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedTrack(isExpanded ? null : track.id)}
                    className="text-xs font-mono text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    {isExpanded ? 'Collapse Track' : 'Focus Track'}
                  </button>

                  {onJoinTrack && (
                    <button
                      onClick={() => onJoinTrack(track.id)}
                      className="button-orbit is-primary !py-1.5 !px-4 !text-xs flex items-center gap-1.5"
                    >
                      <span>Register for {track.title.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
