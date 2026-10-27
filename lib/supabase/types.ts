export type UserTier = 'free' | 'pro' | 'agency';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface OnboardingData {
  id: string;
  user_id: string;
  role: string;
  source: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  monthly_credits: number;
  purchased_credits: number;
  tier: UserTier;
  updated_at: string;
  created_at: string;
}

export interface BrandKitHexCodes {
  primary: string;
  secondary: string;
  accent?: string;
  background?: string;
}

export interface BrandKit {
  id: string;
  user_id: string;
  client_name: string;
  hex_codes: BrandKitHexCodes;
  primary_font: string;
  created_at: string;
}

export type RenderStatus = 'pending' | 'rendering' | 'success' | 'failed';

export interface RenderItem {
  id: string;
  user_id: string;
  prompt: string;
  video_url: string | null;
  status: RenderStatus;
  metadata?: Record<string, unknown>;
  created_at: string;
}
