import {
  Profile,
  Sticker,
  Achievement,
  Idea,
  IdeaLike,
  ChatMessage,
} from '../types';
import { signInWithGoogle, firebaseSignOut } from './firebase';

// Storage Buckets
export type StorageBucket = 'profile_images' | 'sticker_images' | 'achievement_images';

const STORAGE_KEYS = {
  PROFILES: 'techverse_profiles_v1',
  STICKERS: 'techverse_stickers_v1',
  ACHIEVEMENTS: 'techverse_achievements_v1',
  IDEAS: 'techverse_ideas_v1',
  IDEA_LIKES: 'techverse_idea_likes_v1',
  CHAT_MESSAGES: 'techverse_chat_messages_v1',
  STORAGE_FILES: 'techverse_storage_files_v1',
  CURRENT_USER_ID: 'techverse_current_user_id_v1',
};

// Seed profiles
const SEED_PROFILES: Profile[] = [
  {
    id: 'usr_admin',
    full_name: 'TechVerse Admin',
    email: 'admin@techverse.bst.edu',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin&backgroundColor=06b6d4',
    bio: 'BST Tech Club Executive Board & Systems Administrator.',
    roll_number: 'BST-2023-001',
    year: '4th Year (Senior)',
    role: 'admin',
    github_username: 'bst-techverse-admin',
    is_active: true,
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'usr_aishik',
    full_name: 'Aishik Roy',
    email: 'aishik.roy1234@gmail.com',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aishik&backgroundColor=a855f7',
    bio: 'BST Tech Club Lead | Open Source Evangelist | Building TechVerse & Autonomous Systems.',
    roll_number: 'BST-2024-042',
    year: '3rd Year',
    role: 'admin',
    github_username: 'aishikroy',
    is_active: true,
    created_at: '2026-08-15T00:00:00.000Z',
    updated_at: '2026-10-05T00:00:00.000Z',
  },
  {
    id: 'usr_sneha',
    full_name: 'Sneha Patel',
    email: 'sneha.patel@bst.edu',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sneha&backgroundColor=3b82f6',
    bio: 'AI/ML Enthusiast | Hackathon Finalist | PyTorch & Cloud Native.',
    roll_number: 'BST-2024-089',
    year: '3rd Year',
    role: 'student',
    github_username: 'snehapatel-tech',
    is_active: true,
    created_at: '2026-08-20T00:00:00.000Z',
    updated_at: '2026-10-06T00:00:00.000Z',
  },
  {
    id: 'usr_rohan',
    full_name: 'Rohan Sharma',
    email: 'rohan.sharma@bst.edu',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rohan&backgroundColor=10b981',
    bio: 'Fullstack Dev & Web3 Explorer | BST Tech Club Core Member.',
    roll_number: 'BST-2025-112',
    year: '2nd Year',
    role: 'student',
    github_username: 'rohansharmadev',
    is_active: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-10-04T00:00:00.000Z',
  },
  {
    id: 'usr_priya',
    full_name: 'Priya Nair',
    email: 'priya.nair@bst.edu',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Priya&backgroundColor=f59e0b',
    bio: 'Cybersecurity Analyst & Systems Architect | Hacktoberfest 2026 Sprinter.',
    roll_number: 'BST-2024-019',
    year: '3rd Year',
    role: 'student',
    github_username: 'priyanair-sec',
    is_active: true,
    created_at: '2026-09-10T00:00:00.000Z',
    updated_at: '2026-10-07T00:00:00.000Z',
  },
];

// SVG generator helper for verified badges/stickers
function createSvgBadgeUrl(text: string, subtext: string, color: string, iconType: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
      <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" />
        <stop offset="100%" stop-color="#8B5CF6" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="${color}" flood-opacity="0.35"/>
      </filter>
    </defs>
    <rect width="400" height="400" rx="36" fill="url(#bg)"/>
    <rect x="8" y="8" width="384" height="384" rx="28" fill="none" stroke="url(#glow)" stroke-width="2" stroke-opacity="0.4"/>
    <circle cx="200" cy="180" r="100" fill="#0B132B" stroke="${color}" stroke-width="3" filter="url(#shadow)"/>
    <circle cx="200" cy="180" r="88" fill="none" stroke="#38BDF8" stroke-width="1" stroke-dasharray="6,6" opacity="0.6"/>
    <polygon points="200,115 255,148 255,212 200,245 145,212 145,148" fill="none" stroke="${color}" stroke-width="2.5"/>
    <text x="200" y="188" font-family="system-ui, sans-serif" font-weight="800" font-size="34" fill="${color}" text-anchor="middle">${iconType}</text>
    <text x="200" y="320" font-family="system-ui, sans-serif" font-weight="700" font-size="20" fill="#F8FAFC" text-anchor="middle">${text}</text>
    <text x="200" y="348" font-family="system-ui, sans-serif" font-weight="500" font-size="13" fill="#94A3B8" text-anchor="middle">${subtext}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Seed stickers
const SEED_STICKERS: Sticker[] = [
  {
    id: 'stk_1',
    user_id: 'usr_aishik',
    user_name: 'Aishik Roy',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aishik&backgroundColor=a855f7',
    event_name: 'Hacktoberfest 2026',
    sticker_name: 'Verified Open Source Hero',
    event_date: '2026-10-04',
    category: 'hacktoberfest',
    image_url: createSvgBadgeUrl('HACKTOBERFEST 2026', 'BST Tech Club Contributor', '#06B6D4', 'HF26'),
    created_at: '2026-10-04T12:00:00.000Z',
  },
  {
    id: 'stk_2',
    user_id: 'usr_aishik',
    user_name: 'Aishik Roy',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aishik&backgroundColor=a855f7',
    event_name: 'Smart India Hackathon',
    sticker_name: 'SIH Finalist Seal',
    event_date: '2026-09-18',
    category: 'hackathon',
    image_url: createSvgBadgeUrl('SIH FINALIST', 'Ministry of Education', '#F59E0B', 'SIH'),
    created_at: '2026-09-19T08:00:00.000Z',
  },
  {
    id: 'stk_3',
    user_id: 'usr_sneha',
    user_name: 'Sneha Patel',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sneha&backgroundColor=3b82f6',
    event_name: 'Hacktoberfest 2026',
    sticker_name: 'Autumn Code Sprinter',
    event_date: '2026-10-05',
    category: 'hacktoberfest',
    image_url: createSvgBadgeUrl('HACKTOBERFEST', 'BST Squad Badge', '#A855F7', 'OCT'),
    created_at: '2026-10-05T14:30:00.000Z',
  },
  {
    id: 'stk_4',
    user_id: 'usr_sneha',
    user_name: 'Sneha Patel',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sneha&backgroundColor=3b82f6',
    event_name: 'Google Cloud Community Day',
    sticker_name: 'Kubernetes Pioneer',
    event_date: '2026-08-28',
    category: 'conference',
    image_url: createSvgBadgeUrl('GCP CLOUD DAY', 'K8s Cluster Master', '#3B82F6', 'K8S'),
    created_at: '2026-08-29T11:00:00.000Z',
  },
  {
    id: 'stk_5',
    user_id: 'usr_rohan',
    user_name: 'Rohan Sharma',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rohan&backgroundColor=10b981',
    event_name: 'Hacktoberfest 2026',
    sticker_name: 'First Pull Request Badge',
    event_date: '2026-10-02',
    category: 'hacktoberfest',
    image_url: createSvgBadgeUrl('HACKTOBER PR', '4/4 Repos Merged', '#10B981', 'PR#4'),
    created_at: '2026-10-02T16:00:00.000Z',
  },
  {
    id: 'stk_6',
    user_id: 'usr_priya',
    user_name: 'Priya Nair',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Priya&backgroundColor=f59e0b',
    event_name: 'DefCon Village Workshop',
    sticker_name: 'Security Shield Badge',
    event_date: '2026-09-08',
    category: 'workshop',
    image_url: createSvgBadgeUrl('DEFCON VILLAGE', 'Red Team Specialist', '#EF4444', 'SEC'),
    created_at: '2026-09-09T10:00:00.000Z',
  },
];

// Seed achievements
const SEED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_1',
    user_id: 'usr_aishik',
    user_name: 'Aishik Roy',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aishik&backgroundColor=a855f7',
    title: '1st Runner Up - ETHIndia Global Hackathon',
    description: 'Built an open-source decentralized zero-knowledge verification identity protocol for campus societies with real-time attestations.',
    category: 'Hackathon',
    organization: 'ETHIndia / Devfolio',
    achievement_date: '2026-09-15',
    image_url: createSvgBadgeUrl('ETHINDIA 2026', 'Runner Up Trophy Proof', '#06B6D4', '🏆'),
    proof_link: 'https://github.com/bst-techverse',
    created_at: '2026-09-16T10:00:00.000Z',
    updated_at: '2026-09-16T10:00:00.000Z',
  },
  {
    id: 'ach_2',
    user_id: 'usr_sneha',
    user_name: 'Sneha Patel',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sneha&backgroundColor=3b82f6',
    title: 'SIH 2026 Grand Finalist',
    description: 'Selected among top 30 teams nationally for developing an edge-computed disaster response vision model for NDRF.',
    category: 'Competition',
    organization: 'Ministry of Education & AICTE',
    achievement_date: '2026-08-30',
    image_url: createSvgBadgeUrl('SIH 2026', 'National Grand Finalist', '#F59E0B', '🥇'),
    proof_link: 'https://sih.gov.in',
    created_at: '2026-09-01T15:00:00.000Z',
    updated_at: '2026-09-01T15:00:00.000Z',
  },
  {
    id: 'ach_3',
    user_id: 'usr_rohan',
    user_name: 'Rohan Sharma',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rohan&backgroundColor=10b981',
    title: 'AWS Certified Solutions Architect Associate',
    description: 'Passed with 910/1000 score demonstrating deep mastery of cloud infrastructure and resilience architectures.',
    category: 'Certification',
    organization: 'Amazon Web Services',
    achievement_date: '2026-09-05',
    image_url: createSvgBadgeUrl('AWS CERTIFIED', 'Solutions Architect 2026', '#10B981', 'AWS'),
    proof_link: 'https://aws.amazon.com/verification',
    created_at: '2026-09-06T09:00:00.000Z',
    updated_at: '2026-09-06T09:00:00.000Z',
  },
];

// Seed ideas
const SEED_IDEAS: Idea[] = [
  {
    id: 'idea_1',
    user_id: 'usr_aishik',
    user_name: 'Aishik Roy',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aishik&backgroundColor=a855f7',
    title: 'Hacktoberfest BST Leaderboard & Automated Bot',
    description: 'A GitHub action webhook that automatically verifies pull requests to BST Tech Club repositories, awards digital badges, and syncs stickers straight into TechVerse!',
    category: 'Hackathon',
    likes_count: 14,
    created_at: '2026-10-01T11:00:00.000Z',
    updated_at: '2026-10-01T11:00:00.000Z',
  },
  {
    id: 'idea_2',
    user_id: 'usr_sneha',
    user_name: 'Sneha Patel',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sneha&backgroundColor=3b82f6',
    title: 'Campus Edge AI Attendance & Lab Security Camera System',
    description: 'Low-cost Raspberry Pi 5 + Hailo-8 AI accelerator module deployed in BST Tech Club lab for automated hardware inventory & member check-ins.',
    category: 'AI/ML',
    likes_count: 9,
    created_at: '2026-10-03T15:20:00.000Z',
    updated_at: '2026-10-03T15:20:00.000Z',
  },
  {
    id: 'idea_3',
    user_id: 'usr_rohan',
    user_name: 'Rohan Sharma',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rohan&backgroundColor=10b981',
    title: 'Peer-to-Peer Tech Book & Microcontroller Exchange',
    description: 'Smart campus exchange web app where club members can borrow Arduino kits, ESP32 boards, sensors, and textbooks using college student ID tokens.',
    category: 'Project',
    likes_count: 7,
    created_at: '2026-10-06T18:00:00.000Z',
    updated_at: '2026-10-06T18:00:00.000Z',
  },
];

// Seed chat messages
const SEED_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    user_id: 'usr_admin',
    user_name: 'TechVerse Admin',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin&backgroundColor=06b6d4',
    user_role: 'admin',
    message: 'Welcome all BST Tech Club members to TechVerse! Hacktoberfest 2026 badge tracking is officially live.',
    created_at: '2026-10-07T09:00:00.000Z',
  },
  {
    id: 'msg_2',
    user_id: 'usr_aishik',
    user_name: 'Aishik Roy',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aishik&backgroundColor=a855f7',
    user_role: 'admin',
    message: 'Hey everyone! Remember to submit your Hacktoberfest PR proof stickers and showcase your hackathon wins here. Let’s top the college tech rankings!',
    created_at: '2026-10-07T09:05:00.000Z',
  },
  {
    id: 'msg_3',
    user_id: 'usr_sneha',
    user_name: 'Sneha Patel',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sneha&backgroundColor=3b82f6',
    user_role: 'student',
    message: 'Just logged my second merged PR on the open-source repo! Adding my badge now.',
    created_at: '2026-10-07T09:12:00.000Z',
  },
  {
    id: 'msg_4',
    user_id: 'usr_rohan',
    user_name: 'Rohan Sharma',
    user_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rohan&backgroundColor=10b981',
    user_role: 'student',
    message: 'The 3D interactive visuals on the portal look insane! Congrats team.',
    created_at: '2026-10-07T09:20:00.000Z',
  },
];

// Database Engine with Row-Level-Security (RLS) and Reactive Bus
class BoltDatabaseService {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<() => void>> = new Map();

  constructor() {
    this.initDatabase();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('techverse_realtime_bus');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type) {
          this.notify(event.data.type);
        }
      };
    }
  }

  private initDatabase() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(SEED_PROFILES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STICKERS)) {
      localStorage.setItem(STORAGE_KEYS.STICKERS, JSON.stringify(SEED_STICKERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(SEED_ACHIEVEMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.IDEAS)) {
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(SEED_IDEAS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.IDEA_LIKES)) {
      localStorage.setItem(STORAGE_KEYS.IDEA_LIKES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(SEED_CHAT_MESSAGES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      // Default initial signed in user is Aishik Roy (Core Lead)
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'usr_aishik');
    }
  }

  // Reactive Subscriptions
  public subscribe(event: string, callback: () => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private notify(event: string) {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Listener notification error:', err);
      }
    });
    // Global change listener
    this.listeners.get('*')?.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Global notification error:', err);
      }
    });
  }

  private emit(event: string) {
    this.notify(event);
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: event });
    }
  }

  // --- AUTHENTICATION & PROFILES ---
  public getCurrentUser(): Profile | null {
    if (typeof window === 'undefined') return null;
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) return null;
    const profiles = this.getProfiles();
    return profiles.find((p) => p.id === currentId && p.is_active) || null;
  }

  public getProfiles(): Profile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      return data ? JSON.parse(data) : [];
    } catch {
      return SEED_PROFILES;
    }
  }

  public getProfileById(id: string): Profile | null {
    const profiles = this.getProfiles();
    return profiles.find((p) => p.id === id) || null;
  }

  public login(email: string, _password?: string): { success: boolean; user?: Profile; error?: string } {
    const profiles = this.getProfiles();
    const cleanEmail = email.trim().toLowerCase();
    const profile = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (!profile) {
      return { success: false, error: 'No account found with this email address.' };
    }
    if (!profile.is_active) {
      return { success: false, error: 'This account has been disabled by TechVerse admin.' };
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, profile.id);
    this.emit('auth');
    return { success: true, user: profile };
  }

  public async loginWithGoogle(): Promise<{ success: boolean; user?: Profile; error?: string }> {
    try {
      const { user } = await signInWithGoogle();
      const profiles = this.getProfiles();
      const index = profiles.findIndex((p) => p.id === user.id || p.email.toLowerCase() === user.email.toLowerCase());
      if (index !== -1) {
        profiles[index] = { ...profiles[index], ...user };
      } else {
        profiles.push(user);
      }
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
      this.emit('auth');
      this.emit('profiles');
      return { success: true, user };
    } catch (err) {
      console.error('Firebase Google login error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Google authentication failed',
      };
    }
  }

  public signup(full_name: string, email: string, _password?: string): { success: boolean; user?: Profile; error?: string } {
    const profiles = this.getProfiles();
    const cleanEmail = email.trim().toLowerCase();

    if (profiles.some((p) => p.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const avatarSeed = encodeURIComponent(full_name.trim());
    const newProfile: Profile = {
      id: newId,
      full_name: full_name.trim(),
      email: cleanEmail,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}&backgroundColor=06b6d4`,
      bio: 'BST Tech Club Member | Exploring software & open-source technologies.',
      roll_number: `BST-2026-${Math.floor(100 + Math.random() * 900)}`,
      year: '1st Year',
      role: 'student',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    profiles.push(newProfile);
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newProfile.id);
    this.emit('auth');
    this.emit('profiles');
    return { success: true, user: newProfile };
  }

  public logout(): void {
    try {
      firebaseSignOut().catch((e) => console.warn('Firebase signout warning:', e));
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    this.emit('auth');
  }

  public switchUser(userId: string): boolean {
    const profile = this.getProfileById(userId);
    if (profile && profile.is_active) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, profile.id);
      this.emit('auth');
      return true;
    }
    return false;
  }

  public updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, 'full_name' | 'bio' | 'roll_number' | 'year' | 'avatar_url' | 'github_username'>>
  ): { success: boolean; profile?: Profile; error?: string } {
    const current = this.getCurrentUser();
    if (!current) return { success: false, error: 'Unauthorized.' };

    // RLS: User can update their own profile; Admin can update any
    if (current.id !== userId && current.role !== 'admin') {
      return { success: false, error: 'Permission denied: Cannot edit another student profile.' };
    }

    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.id === userId);
    if (index === -1) return { success: false, error: 'Profile not found.' };

    const updated: Profile = {
      ...profiles[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    profiles[index] = updated;
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    // Also cascade update name and avatar in stickers, achievements, and ideas
    if (updates.full_name || updates.avatar_url) {
      this.cascadeProfileUpdate(userId, updated.full_name, updated.avatar_url);
    }

    this.emit('profiles');
    this.emit('auth');
    return { success: true, profile: updated };
  }

  public adminToggleUserStatus(targetUserId: string): boolean {
    const current = this.getCurrentUser();
    if (!current || current.role !== 'admin') return false;

    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.id === targetUserId);
    if (index === -1) return false;

    profiles[index].is_active = !profiles[index].is_active;
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    this.emit('profiles');
    return true;
  }

  private cascadeProfileUpdate(userId: string, newName: string, newAvatar: string) {
    // Stickers
    const stickers = this.getStickers().map((s) =>
      s.user_id === userId ? { ...s, user_name: newName, user_avatar: newAvatar } : s
    );
    localStorage.setItem(STORAGE_KEYS.STICKERS, JSON.stringify(stickers));

    // Achievements
    const achievements = this.getAchievements().map((a) =>
      a.user_id === userId ? { ...a, user_name: newName, user_avatar: newAvatar } : a
    );
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));

    // Ideas
    const ideas = this.getIdeas().map((i) =>
      i.user_id === userId ? { ...i, user_name: newName, user_avatar: newAvatar } : i
    );
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
  }

  // --- STORAGE BUCKETS (profile_images, sticker_images, achievement_images) ---
  public async uploadImage(
    bucket: StorageBucket,
    file: File
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    // Validate File Types: JPG, JPEG, PNG, WEBP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        success: false,
        error: 'Invalid file format. Supported formats: JPG, JPEG, PNG, WEBP.',
      };
    }

    // Validate File Size: Max 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size exceeds limit (Max 5MB). Please optimize or choose a smaller image.',
      };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const fileId = `${bucket}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        this.storeFileMetadata(fileId, bucket, dataUrl);
        resolve({ success: true, url: dataUrl });
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read image file.' });
      };
      reader.readAsDataURL(file);
    });
  }

  private storeFileMetadata(fileId: string, bucket: StorageBucket, dataUrl: string) {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORAGE_FILES) || '{}');
      existing[fileId] = { bucket, created_at: new Date().toISOString(), length: dataUrl.length };
      localStorage.setItem(STORAGE_KEYS.STORAGE_FILES, JSON.stringify(existing));
    } catch {
      // Storage files registry cache
    }
  }

  public deleteStorageImage(imageUrl: string): void {
    // When an achievement or sticker is deleted, remove image from storage if tracked
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORAGE_FILES) || '{}');
      for (const [key] of Object.entries(existing)) {
        if (imageUrl.includes(key)) {
          delete existing[key];
        }
      }
      localStorage.setItem(STORAGE_KEYS.STORAGE_FILES, JSON.stringify(existing));
    } catch {
      // noop
    }
  }

  // --- STICKERS TRACKER ---
  public getStickers(): Sticker[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STICKERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return SEED_STICKERS;
    }
  }

  public getStickersByUser(userId: string): Sticker[] {
    return this.getStickers().filter((s) => s.user_id === userId);
  }

  public addSticker(params: {
    event_name: string;
    sticker_name: string;
    event_date: string;
    image_url: string;
    category?: Sticker['category'];
  }): { success: boolean; sticker?: Sticker; error?: string } {
    const current = this.getCurrentUser();
    if (!current) return { success: false, error: 'Please sign in to add a sticker.' };

    // MANDATORY IMAGE CHECK:
    if (!params.image_url || params.image_url.trim() === '') {
      return { success: false, error: 'A sticker screenshot or photo is MANDATORY.' };
    }
    if (!params.event_name.trim() || !params.sticker_name.trim()) {
      return { success: false, error: 'Event name and sticker name are required.' };
    }

    const stickers = this.getStickers();
    const newSticker: Sticker = {
      id: `stk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: current.id,
      user_name: current.full_name,
      user_avatar: current.avatar_url,
      event_name: params.event_name.trim(),
      sticker_name: params.sticker_name.trim(),
      event_date: params.event_date || new Date().toISOString().split('T')[0],
      image_url: params.image_url,
      category: params.category || (params.event_name.toLowerCase().includes('hacktoberfest') ? 'hacktoberfest' : 'other'),
      created_at: new Date().toISOString(),
    };

    stickers.unshift(newSticker);
    localStorage.setItem(STORAGE_KEYS.STICKERS, JSON.stringify(stickers));
    this.emit('stickers');
    this.emit('leaderboard');
    return { success: true, sticker: newSticker };
  }

  public deleteSticker(stickerId: string): { success: boolean; error?: string } {
    const current = this.getCurrentUser();
    if (!current) return { success: false, error: 'Unauthorized.' };

    const stickers = this.getStickers();
    const sticker = stickers.find((s) => s.id === stickerId);
    if (!sticker) return { success: false, error: 'Sticker not found.' };

    // RLS: User can delete own sticker, Admin can delete any
    if (sticker.user_id !== current.id && current.role !== 'admin') {
      return { success: false, error: 'Permission denied: Cannot delete another student sticker.' };
    }

    // Clean up image from storage
    if (sticker.image_url) {
      this.deleteStorageImage(sticker.image_url);
    }

    const remaining = stickers.filter((s) => s.id !== stickerId);
    localStorage.setItem(STORAGE_KEYS.STICKERS, JSON.stringify(remaining));
    this.emit('stickers');
    this.emit('leaderboard');
    return { success: true };
  }

  // --- ACHIEVEMENTS SYSTEM ---
  public getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return SEED_ACHIEVEMENTS;
    }
  }

  public getAchievementsByUser(userId: string): Achievement[] {
    return this.getAchievements().filter((a) => a.user_id === userId);
  }

  public addAchievement(params: {
    title: string;
    description: string;
    category: Achievement['category'];
    organization: string;
    achievement_date: string;
    image_url: string;
    proof_link?: string;
  }): { success: boolean; achievement?: Achievement; error?: string } {
    const current = this.getCurrentUser();
    if (!current) return { success: false, error: 'Please sign in to add an achievement.' };

    // MANDATORY IMAGE CHECK:
    if (!params.image_url || params.image_url.trim() === '') {
      return { success: false, error: 'Achievement proof or certificate image is MANDATORY.' };
    }
    if (!params.title.trim() || !params.organization.trim()) {
      return { success: false, error: 'Title and Organization are required.' };
    }

    const achievements = this.getAchievements();
    const newAchievement: Achievement = {
      id: `ach_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: current.id,
      user_name: current.full_name,
      user_avatar: current.avatar_url,
      title: params.title.trim(),
      description: params.description.trim(),
      category: params.category,
      organization: params.organization.trim(),
      achievement_date: params.achievement_date || new Date().toISOString().split('T')[0],
      image_url: params.image_url,
      proof_link: params.proof_link?.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    achievements.unshift(newAchievement);
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    this.emit('achievements');
    return { success: true, achievement: newAchievement };
  }

  public updateAchievement(
    achievementId: string,
    params: Partial<Omit<Achievement, 'id' | 'user_id' | 'created_at'>>
  ): { success: boolean; achievement?: Achievement; error?: string } {
    const current = this.getCurrentUser();
    if (!current) return { success: false, error: 'Unauthorized.' };

    const achievements = this.getAchievements();
    const index = achievements.findIndex((a) => a.id === achievementId);
    if (index === -1) return { success: false, error: 'Achievement not found.' };

    if (achievements[index].user_id !== current.id && current.role !== 'admin') {
      return { success: false, error: 'Permission denied: Cannot edit another student achievement.' };
    }

    const updated: Achievement = {
      ...achievements[index],
      ...params,
      updated_at: new Date().toISOString(),
    };

    achievements[index] = updated;
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    this.emit('achievements');
    return { success: true, achievement: updated };
  }

  public deleteAchievement(achievementId: string): { success: boolean; error?: string } {
    const current = this.getCurrentUser();
    if (!current) return { success: false, error: 'Unauthorized.' };

    const achievements = this.getAchievements();
    const target = achievements.find((a) => a.id === achievementId);
    if (!target) return { success: false, error: 'Achievement not found.' };

    if (target.user_id !== current.id && current.role !== 'admin') {
      return { success: false, error: 'Permission denied: Cannot delete another student achievement.' };
    }

    if (target.image_url) {
      this.deleteStorageImage(target.image_url);
    }

    const remaining = achievements.filter((a) => a.id !== achievementId);
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(remaining));
    this.emit('achievements');
    return { success: true };
  }

  // --- IDEA BOARD ---
  public getIdeas(): Idea[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IDEAS);
      return data ? JSON.parse(data) : [];
    } catch {
      return SEED_IDEAS;
    }
  }

  public getIdeaLikes(): IdeaLike[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IDEA_LIKES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public hasUserLikedIdea(ideaId: string, userId: string): boolean {
    const likes = this.getIdeaLikes();
    return likes.some((l) => l.idea_id === ideaId && l.user_id === userId);
  }

  public addIdea(params: {
    title: string;
    description: string;
    category: Idea['category'];
  }): { success: boolean; idea?: Idea; error?: string } {
    const current = this.getCurrentUser();
    if (!current) return { success: false, error: 'Please sign in to post an idea.' };

    if (!params.title.trim() || !params.description.trim()) {
      return { success: false, error: 'Title and description are required.' };
    }

    const ideas = this.getIdeas();
    const newIdea: Idea = {
      id: `idea_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: current.id,
      user_name: current.full_name,
      user_avatar: current.avatar_url,
      title: params.title.trim(),
      description: params.description.trim(),
      category: params.category,
      likes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    ideas.unshift(newIdea);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    this.emit('ideas');
    return { success: true, idea: newIdea };
  }

  public toggleLikeIdea(ideaId: string): { success: boolean; liked: boolean; count: number; error?: string } {
    const current = this.getCurrentUser();
    if (!current) return { success: false, liked: false, count: 0, error: 'Please sign in to like ideas.' };

    const ideas = this.getIdeas();
    const ideaIndex = ideas.findIndex((i) => i.id === ideaId);
    if (ideaIndex === -1) return { success: false, liked: false, count: 0, error: 'Idea not found.' };

    const likes = this.getIdeaLikes();
    const existingIndex = likes.findIndex((l) => l.idea_id === ideaId && l.user_id === current.id);

    let liked = false;
    if (existingIndex > -1) {
      // Unlike
      likes.splice(existingIndex, 1);
      ideas[ideaIndex].likes_count = Math.max(0, ideas[ideaIndex].likes_count - 1);
      liked = false;
    } else {
      // Like (prevents duplicate likes)
      likes.push({
        id: `like_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        idea_id: ideaId,
        user_id: current.id,
        created_at: new Date().toISOString(),
      });
      ideas[ideaIndex].likes_count += 1;
      liked = true;
    }

    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    localStorage.setItem(STORAGE_KEYS.IDEA_LIKES, JSON.stringify(likes));
    this.emit('ideas');
    return { success: true, liked, count: ideas[ideaIndex].likes_count };
  }

  public deleteIdea(ideaId: string): { success: boolean; error?: string } {
    const current = this.getCurrentUser();
    if (!current) return { success: false, error: 'Unauthorized.' };

    const ideas = this.getIdeas();
    const idea = ideas.find((i) => i.id === ideaId);
    if (!idea) return { success: false, error: 'Idea not found.' };

    if (idea.user_id !== current.id && current.role !== 'admin') {
      return { success: false, error: 'Permission denied: Cannot delete another student idea.' };
    }

    const remaining = ideas.filter((i) => i.id !== ideaId);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(remaining));

    // Remove orphaned likes
    const likes = this.getIdeaLikes().filter((l) => l.idea_id !== ideaId);
    localStorage.setItem(STORAGE_KEYS.IDEA_LIKES, JSON.stringify(likes));

    this.emit('ideas');
    return { success: true };
  }

  // --- REALTIME COMMUNITY CHAT ---
  public getChatMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return SEED_CHAT_MESSAGES;
    }
  }

  public sendChatMessage(message: string): { success: boolean; chatMessage?: ChatMessage; error?: string } {
    const current = this.getCurrentUser();
    if (!current) return { success: false, error: 'Please sign in to send messages.' };

    const trimmed = message.trim();
    if (!trimmed) return { success: false, error: 'Message cannot be empty.' };

    const messages = this.getChatMessages();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: current.id,
      user_name: current.full_name,
      user_avatar: current.avatar_url,
      user_role: current.role,
      message: trimmed,
      created_at: new Date().toISOString(),
    };

    messages.push(newMsg);
    // Keep max 200 recent messages for lightweight high performance
    const pruned = messages.slice(-200);
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(pruned));
    this.emit('chat');
    return { success: true, chatMessage: newMsg };
  }

  public deleteChatMessage(messageId: string): { success: boolean; error?: string } {
    const current = this.getCurrentUser();
    if (!current) return { success: false, error: 'Unauthorized.' };

    const messages = this.getChatMessages();
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return { success: false, error: 'Message not found.' };

    // Admin or author can delete
    if (msg.user_id !== current.id && current.role !== 'admin') {
      return { success: false, error: 'Permission denied: Only admin or the author can delete messages.' };
    }

    const remaining = messages.filter((m) => m.id !== messageId);
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(remaining));
    this.emit('chat');
    return { success: true };
  }

  // --- LEADERBOARD & STATS ---
  public getLeaderboard(): Array<{
    rank: number;
    user: Profile;
    sticker_count: number;
    hacktoberfest_count: number;
    recent_stickers: Sticker[];
  }> {
    const profiles = this.getProfiles().filter((p) => p.is_active);
    const stickers = this.getStickers();

    const counts = profiles.map((user) => {
      const userStickers = stickers.filter((s) => s.user_id === user.id);
      const hfCount = userStickers.filter((s) => s.category === 'hacktoberfest').length;
      return {
        user,
        sticker_count: userStickers.length,
        hacktoberfest_count: hfCount,
        recent_stickers: userStickers.slice(0, 3),
      };
    });

    counts.sort((a, b) => {
      if (b.sticker_count !== a.sticker_count) {
        return b.sticker_count - a.sticker_count;
      }
      return b.hacktoberfest_count - a.hacktoberfest_count;
    });

    return counts.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));
  }

  // --- STATS FOR USER & ADMIN ---
  public getUserStats(userId: string) {
    const stickers = this.getStickers().filter((s) => s.user_id === userId);
    const achievements = this.getAchievements().filter((a) => a.user_id === userId);
    const ideas = this.getIdeas().filter((i) => i.user_id === userId);
    const totalLikes = ideas.reduce((sum, item) => sum + item.likes_count, 0);

    // Calculate unique events attended
    const events = new Set<string>();
    stickers.forEach((s) => events.add(s.event_name.toLowerCase()));
    achievements.forEach((a) => events.add(a.organization.toLowerCase()));

    return {
      achievementsCount: achievements.length,
      stickersCount: stickers.length,
      hacktoberfestCount: stickers.filter((s) => s.category === 'hacktoberfest').length,
      eventsAttendedCount: events.size,
      ideasCount: ideas.length,
      likesCount: totalLikes,
    };
  }

  public getAdminAnalytics() {
    const profiles = this.getProfiles();
    const stickers = this.getStickers();
    const achievements = this.getAchievements();
    const ideas = this.getIdeas();
    const messages = this.getChatMessages();

    return {
      totalMembers: profiles.length,
      activeMembers: profiles.filter((p) => p.is_active).length,
      totalStickers: stickers.length,
      hacktoberfestBadges: stickers.filter((s) => s.category === 'hacktoberfest').length,
      totalAchievements: achievements.length,
      totalIdeas: ideas.length,
      totalChatMessages: messages.length,
      mostActiveStudents: this.getLeaderboard().slice(0, 5),
      popularIdeas: [...ideas].sort((a, b) => b.likes_count - a.likes_count).slice(0, 5),
    };
  }
}

export const db = new BoltDatabaseService();
