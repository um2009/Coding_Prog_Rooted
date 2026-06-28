// Database Types matching Supabase SQL schema

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  website?: string;
  image_url: string;
  district: string;
  description: string;
  avg_price: number;
  hours: string;
  map_coordinate?: any;
  created_at?: string;
}

export interface Review {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  comment: string;
  verified: boolean;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  business_id: string;
  created_at: string;
}

export interface Deal {
  id: string;
  business_id: string;
  title: string;
  description: string;
  discount_percentage?: number;
  code?: string;
  expiry_date: string;
  active: boolean;
  created_at: string;
}

// Extended types with joined data
export interface BusinessWithStats extends Business {
  rating: number;
  review_count: number;
  has_deal: boolean;
}

export interface ReviewWithUser extends Review {
  user_name: string;
  user_avatar?: string;
}