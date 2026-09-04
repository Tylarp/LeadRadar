import type { Lead, Search } from '@/lib/types';

export interface Lead {
  id: string;
  search_id: string;
  user_id: string;
  business_name: string;
  website: string;
  phone: string;
  email: string;
  google_rating: number;
  review_count: number;
  website_quality_score: number;
  has_social: boolean;
  estimated_traffic: number;
  problems: string[];
  created_at: string;
}

export interface Search {
  id: string;
  user_id: string;
  niche: string;
  location: string;
  requested_count: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string;
  status: string;
  searches_used: number;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export type NewLead = Omit<Lead, 'id' | 'created_at' | 'user_id'>;
