export interface Petition {
  id: string;
  slug: string;
  title: string;
  intro_md?: string;
  goal_count: number;
  is_public: boolean;
  created_by?: string;
  created_at: string;
}

export interface Signature {
  id: string;
  petition_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  country: string;
  city: string;
  state?: string;
  postal_code?: string; // Added postal code field
  language: string; // NEW: Language field for form submission
  consent_news: boolean;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  confirm_token?: string;
  ip_hash: string;
  ua_hash: string;
  created_at: string;
  confirmed_at?: string;
}

export interface EmailLog {
  id: string;
  to_email: string;
  template: string;
  meta?: Record<string, any>;
  sent_at: string;
  success: boolean;
  error?: string;
}

export interface PetitionStats {
  id: string;
  slug: string;
  title: string;
  confirmed_count: number;
  pending_count: number;
  total_count: number;
}

export interface PetitionStatsEnhanced {
  id: string;
  slug: string;
  title: string;
  confirmed_count: number;
  pending_count: number;
  total_count: number;
  last_updated: string;
}

export interface SignPetitionRequest {
  first_name: string;
  last_name: string;
  email: string; // Now required
  phone?: string; // Optional
  country: string;
  city: string;
  state?: string;
  postal_code?: string; // Added postal code field
  consent_news?: boolean;
  language: string; // NEW: Language field for form submission
  turnstileToken: string;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface ConfirmTokenResponse {
  success: boolean;
  redirectTo: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}
