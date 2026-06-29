// database types match the supabase sql  schema

/** The profile info for anyone signed up on the app. */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

/** All the core details for a local spot listed on the platform. */
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

/** A user's rating and feedback left on a specific business page. */
export interface Review {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  comment: string;
  verified: boolean;
  created_at: string;
}

/** Keeps track of which users saved which businesses to their favorites. */
export interface Bookmark {
  id: string;
  user_id: string;
  business_id: string;
  created_at: string;
}

/** A special promo, discount, or coupon code offered by a business. */
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

/** A business profile bundled with its calculated review stats and deal status for the UI. */
export interface BusinessWithStats extends Business {
  rating: number;
  review_count: number;
  has_deal: boolean;
}

/** A review combined with the author's name and avatar so you don't have to do a second lookup. */
export interface ReviewWithUser extends Review {
  user_name: string;
  user_avatar?: string;
}
