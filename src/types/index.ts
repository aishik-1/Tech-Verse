export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  roll_number: string;
  year: string;
  role: UserRole;
  github_username?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type StickerCategory = 'hacktoberfest' | 'hackathon' | 'conference' | 'workshop' | 'club' | 'other';

export interface Sticker {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  event_name: string;
  sticker_name: string;
  event_date: string;
  image_url: string;
  category: StickerCategory;
  created_at: string;
}

export type AchievementCategory =
  | 'Hackathon'
  | 'Competition'
  | 'Certification'
  | 'Workshop'
  | 'Open Source'
  | 'Project'
  | 'Club'
  | 'Other';

export interface Achievement {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  title: string;
  description: string;
  category: AchievementCategory;
  organization: string;
  achievement_date: string;
  image_url: string;
  proof_link?: string;
  created_at: string;
  updated_at: string;
}

export type IdeaCategory =
  | 'Hackathon'
  | 'Project'
  | 'Workshop'
  | 'Startup'
  | 'Event'
  | 'AI/ML'
  | 'Web'
  | 'App'
  | 'Robotics'
  | 'Other';

export interface Idea {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  title: string;
  description: string;
  category: IdeaCategory;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface IdeaLike {
  id: string;
  idea_id: string;
  user_id: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  user_role: UserRole;
  message: string;
  created_at: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
