import { Group } from './database'

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  course_name: string | null;
  enrollment_year: number | null;
  completion_year: number | null;
  role: string | null;
  rank: string | null;
  badges_count: number | null;
  school_id: string | null;
  group_id: string | null;
  total_score: number;
  created_at: string;
  groups?: Group | Group[]; // Nested group data
  achievements?: Array<{ name: string; date: string; id?: string; icon?: string }>;
  theme_config?: { palette?: string; custom_bg_url?: string };
  custom_bg_url?: string;
};

export type ActiveUser = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  last_seen: string;
};

export type NetworkMember = Profile & {
  status?: 'online' | 'offline';
};
