// Data service for businesses, reviews, bookmarks, and deals
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { authService } from './authService';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-1cfc035a`;

// Create ONLY ONE Supabase client for the entire application
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      persistSession: false, // We handle auth separately
      autoRefreshToken: false
    }
  }
);

console.log('DataService initialized with single Supabase client');
console.log('   Direct Data API: https://${projectId}.supabase.co');
console.log('Project ID:', projectId);

export interface Business {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  website?: string;
  image_url: string;
  district?: string;
  description?: string;
  avg_price?: number;
  hours?: string;
  map_coordinate?: { x: number; y: number };
  average_rating?: number;
  review_count?: number;
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
  user_name: string;
  user_avatar?: string;
}

export interface Deal {
  id: string;
  business_id: string;
  title: string;
  description: string;
  discount_text?: string;
  code?: string;
  expiration_date?: string; // Try with underscore first
  expirationdate?: string; // Fallback without underscore
}

// Helper to make authenticated fetch requests directly to PostgREST
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = authService.getAccessToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': publicAnonKey,
    'Authorization': `Bearer ${token}`,
    'Prefer': 'return=representation',
    ...options.headers
  };

  const response = await fetch(`https://${projectId}.supabase.co/rest/v1/${url}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Request failed: ${error}`);
  }

  return response.json();
}

export const dataService = {
  // ===== BUSINESSES =====
  
  async getBusinesses(): Promise<Business[]> {
    try {
      console.log('Fetching businesses directly from Supabase Data API...');
      
      // Fetch businesses using the single client
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .order('name');

      if (businessError) {
        console.error('Supabase error:', businessError);
        throw new Error(`Failed to fetch businesses: ${businessError.message}`);
      }

      // Fetch all reviews to calculate live ratings and counts
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('business_id, rating');

      if (reviewsError) {
        console.error('Warning: Failed to fetch reviews for rating calculation:', reviewsError);
        return businesses as Business[];
      }

      // Fetch all active deals to determine which businesses have deals
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('*');

      if (dealsError) {
        console.error('Warning: Failed to fetch deals:', dealsError);
      }

      console.log(`Fetched ${deals?.length || 0} total deals from database`);

      // Calculate rating and review count for each business
      const reviewsByBusiness = new Map<string, number[]>();
      reviews?.forEach(review => {
        const ratings = reviewsByBusiness.get(review.business_id) || [];
        ratings.push(review.rating);
        reviewsByBusiness.set(review.business_id, ratings);
      });

      // Create a set of business IDs that have active, non-expired deals
      const businessesWithActiveDeals = new Set<string>();
      const now = new Date();
      console.log(`Processing ${deals?.length || 0} deals to find active ones...`);
      deals?.forEach(deal => {
        // Use the correct field name from the database: expirationdate
        const dateValue = deal.expirationdate || deal.expiration_date;
        const expiryDate = dateValue ? new Date(dateValue) : null;
        
        console.log(`Deal "${deal.title}" for business ${deal.business_id}:`);
        console.log(`   - Expiry date (raw): ${dateValue}`);
        console.log(`   - Parsed date: ${expiryDate}`);
        console.log(`   - Is future date: ${expiryDate && expiryDate > now}`);
        console.log(`   - Now: ${now.toISOString()}`);
        
        // Only count as active if the deal hasn't expired
        if (expiryDate && expiryDate > now) {
          businessesWithActiveDeals.add(deal.business_id);
          console.log(`   Added to active deals set`);
        } else {
          console.log(`   Deal expired or invalid date`);
        }
      });

      // Enrich businesses with calculated ratings and has_deal flag
      const enrichedBusinesses = businesses?.map(business => {
        const ratings = reviewsByBusiness.get(business.id) || [];
        const review_count = ratings.length;
        const rating = review_count > 0 
          ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / review_count) * 10) / 10
          : business.rating;

        return {
          ...business,
          rating,
          review_count,
          has_deal: businessesWithActiveDeals.has(business.id)
        };
      }) || [];

      console.log(`Bars Loaded ${enrichedBusinesses.length} businesses with live ratings`);
      console.log(`${businessesWithActiveDeals.size} businesses have active deals`);
      return enrichedBusinesses as Business[];
    } catch (error) {
      console.error('Error fetching businesses:', error);
      throw error;
    }
  },

  async getBusiness(id: string): Promise<Business | null> {
    try {
      console.log('Fetching business', id);
      
      const { data: business, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch business: ${error.message}`);
      }

      // Fetch reviews for this business to calculate live rating
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', id);

      if (!reviewsError && reviews && reviews.length > 0) {
        const ratings = reviews.map(r => r.rating);
        const review_count = ratings.length;
        const rating = Math.round((ratings.reduce((sum, r) => sum + r, 0) / review_count) * 10) / 10;
        
        return {
          ...business,
          rating,
          review_count
        } as Business;
      }

      return business as Business;
    } catch (error) {
      console.error('Error fetching business:', error);
      return null;
    }
  },

  // ===== REVIEWS =====

  async getReviews(businessId?: string, userId?: string): Promise<Review[]> {
    try {
      console.log('Fetching reviews...');
      
      let query = supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_user_id_fkey (
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (businessId) {
        query = query.eq('business_id', businessId);
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch reviews: ${error.message}`);
      }

      // Transform data to match Review interface
      const reviews = (data || []).map(review => ({
        ...review,
        user_name: review.profiles?.name || 'Anonymous',
        user_avatar: review.profiles?.avatar_url
      }));

      console.log(`Loaded ${reviews.length} reviews`);
      return reviews as Review[];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  async addReview(businessId: string, rating: number, comment: string): Promise<Review | null> {
    try {
      await authService.waitForSessionRestore();
      
      if (!authService.isAuthenticated()) {
        throw new Error('You must be logged in to add a review');
      }
      
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('User not found');
      }
      
      console.log('Adding review...', { businessId, rating });
      
      // Use direct fetch with auth token to avoid creating new client
      const data = await authenticatedFetch('reviews?select=*,profiles!reviews_user_id_fkey(name,avatar_url)', {
        method: 'POST',
        body: JSON.stringify({
          business_id: businessId,
          user_id: user.id,
          rating,
          comment,
          verified: false,
          created_at: new Date().toISOString()
        })
      });

      console.log('Review added successfully');
      
      const reviewData = Array.isArray(data) ? data[0] : data;
      const review: Review = {
        ...reviewData,
        user_name: reviewData.profiles?.name || user.email || 'Anonymous',
        user_avatar: reviewData.profiles?.avatar_url
      };
      
      return review;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  // ===== BOOKMARKS =====

  async getBookmarks(): Promise<string[]> {
    try {
      await authService.waitForSessionRestore();
      
      const isAuth = authService.isAuthenticated();
      const user = authService.getCurrentUser();
      
      if (!isAuth || !user) {
        console.log('Warning: Not authenticated - returning empty bookmarks');
        return [];
      }

      console.log('Fetching bookmarks...');
      
      // Use direct fetch with auth token
      const data = await authenticatedFetch(`bookmarks?user_id=eq.${user.id}&select=business_id`);
      
      const bookmarks = (data || []).map((b: any) => b.business_id);
      console.log(`Fetched ${bookmarks.length} bookmarks`);
      return bookmarks;
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  },

  async saveBookmarks(bookmarks: string[]): Promise<void> {
    try {
      await authService.waitForSessionRestore();
      
      const isAuth = authService.isAuthenticated();
      const user = authService.getCurrentUser();
      
      if (!isAuth || !user) {
        console.error('Cannot save bookmarks - not authenticated');
        throw new Error('You must be logged in to save bookmarks');
      }

      console.log(`Saving ${bookmarks.length} bookmarks...`);
      
      // Delete all existing bookmarks for this user
      await authenticatedFetch(`bookmarks?user_id=eq.${user.id}`, {
        method: 'DELETE'
      });

      // Insert new bookmarks (if any)
      if (bookmarks.length > 0) {
        const bookmarkRecords = bookmarks.map(business_id => ({
          user_id: user.id,
          business_id,
          created_at: new Date().toISOString()
        }));

        await authenticatedFetch('bookmarks', {
          method: 'POST',
          body: JSON.stringify(bookmarkRecords)
        });
      }

      console.log('Bookmarks saved successfully');
    } catch (error) {
      console.error('Error saving bookmarks:', error);
      throw error;
    }
  },

  async toggleBookmark(businessId: string): Promise<boolean> {
    try {
      await authService.waitForSessionRestore();
      
      const user = authService.getCurrentUser();
      
      if (!authService.isAuthenticated() || !user) {
        console.warn('Warning: Cannot toggle bookmark - not authenticated');
        throw new Error('You must be logged in to bookmark businesses');
      }

      console.log(`Toggling bookmark for business: ${businessId}`);
      
      // Check if bookmark exists
      const existingBookmarks = await authenticatedFetch(
        `bookmarks?user_id=eq.${user.id}&business_id=eq.${businessId}&select=id`
      );

      if (existingBookmarks && existingBookmarks.length > 0) {
        // Bookmark exists, delete it
        await authenticatedFetch(
          `bookmarks?user_id=eq.${user.id}&business_id=eq.${businessId}`,
          { method: 'DELETE' }
        );

        console.log(`Bookmark removed`);
        return false;
      } else {
        // Bookmark doesn't exist, create it
        await authenticatedFetch('bookmarks', {
          method: 'POST',
          body: JSON.stringify({
            user_id: user.id,
            business_id: businessId,
            created_at: new Date().toISOString()
          })
        });

        console.log(`Bookmark added`);
        return true;
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  },

  // ===== DEALS =====

  async getDeals(businessId?: string): Promise<Deal[]> {
    try {
      console.log('Fetching deals...');
      
      let query = supabase
        .from('deals')
        .select('*');

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch deals: ${error.message}`);
      }

      // Filter out expired deals on the client side
      const now = new Date();
      const activeDeals = (data || []).filter(deal => {
        // Use the correct field name: expirationdate
        const dateValue = deal.expirationdate || deal.expiration_date;
        if (!dateValue) return false;
        
        const expiryDate = new Date(dateValue);
        return expiryDate > now;
      });

      console.log(`Loaded ${activeDeals.length} active deals (${data?.length || 0} total)`);
      return activeDeals as Deal[];
    } catch (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
  },

  async addDeal(businessId: string, dealData: Omit<Deal, 'id' | 'business_id'>): Promise<Deal | null> {
    try {
      await authService.waitForSessionRestore();
      
      if (!authService.isAuthenticated()) {
        throw new Error('You must be logged in to add a deal');
      }

      console.log('Adding deal...');

      const data = await authenticatedFetch('deals', {
        method: 'POST',
        body: JSON.stringify({
          business_id: businessId,
          ...dealData,
          created_at: new Date().toISOString()
        })
      });

      console.log('Deal added successfully');
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.error('Error adding deal:', error);
      throw error;
    }
  },

  async updateDeal(dealId: string, dealData: Partial<Deal>): Promise<void> {
    try {
      await authService.waitForSessionRestore();
      
      if (!authService.isAuthenticated()) {
        throw new Error('You must be logged in to update a deal');
      }

      console.log('Updating deal...');

      await authenticatedFetch(`deals?id=eq.${dealId}`, {
        method: 'PATCH',
        body: JSON.stringify(dealData)
      });

      console.log('Deal updated successfully');
    } catch (error) {
      console.error('Error updating deal:', error);
      throw error;
    }
  },

  async deleteDeal(dealId: string): Promise<void> {
    try {
      await authService.waitForSessionRestore();
      
      if (!authService.isAuthenticated()) {
        throw new Error('You must be logged in to delete a deal');
      }

      console.log('Deleting deal...');

      await authenticatedFetch(`deals?id=eq.${dealId}`, {
        method: 'DELETE'
      });

      console.log('Deal deleted successfully');
    } catch (error) {
      console.error('Error deleting deal:', error);
      throw error;
    }
  },

  // ===== USER BUSINESSES =====

  async getUserBusinesses(): Promise<Business[]> {
    try {
      await authService.waitForSessionRestore();

      const user = authService.getCurrentUser();

      if (!authService.isAuthenticated() || !user) {
        console.log('Not authenticated - returning empty businesses');
        return [];
      }

      // Use the Supabase JS client instead of raw authenticatedFetch here.
      // authenticatedFetch builds a bare PostgREST URL and relies on CORS
      // preflights succeeding, which can silently fail when the owner_id
      // column filter triggers an unexpected server response. The Supabase
      // client handles auth headers, retries, and error parsing internally.
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id);

      if (error) {
        console.error('Error fetching user businesses:', error.message);
        return [];
      }

      return (data ?? []) as Business[];
    } catch (error) {
      console.error('Error fetching user businesses:', error);
      return [];
    }
  },

  async addBusiness(businessData: Omit<Business, 'id' | 'rating' | 'review_count' | 'has_deal'>): Promise<Business | null> {
    try {
      await authService.waitForSessionRestore();
      
      if (!authService.isAuthenticated()) {
        throw new Error('You must be logged in to add a business');
      }

      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not found');
      }

      console.log('Adding business...');

      const data = await authenticatedFetch('businesses', {
        method: 'POST',
        body: JSON.stringify({
          ...businessData,
          owner_id: user.id,
          created_at: new Date().toISOString()
        })
      });

      console.log('Business added successfully');
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.error('Error adding business:', error);
      throw error;
    }
  },

  async updateBusiness(businessId: string, businessData: Partial<Business>): Promise<void> {
    try {
      await authService.waitForSessionRestore();
      
      if (!authService.isAuthenticated()) {
        throw new Error('You must be logged in to update a business');
      }

      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not found');
      }

      console.log('Updating business...');

      // Ensure user owns this business
      await authenticatedFetch(`businesses?id=eq.${businessId}&owner_id=eq.${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(businessData)
      });

      console.log('Business updated successfully');
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    }
  },

  async deleteBusiness(businessId: string): Promise<void> {
    try {
      await authService.waitForSessionRestore();
      
      if (!authService.isAuthenticated()) {
        throw new Error('You must be logged in to delete a business');
      }

      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not found');
      }

      console.log('Deleting business...');

      // Ensure user owns this business
      await authenticatedFetch(`businesses?id=eq.${businessId}&owner_id=eq.${user.id}`, {
        method: 'DELETE'
      });

      console.log('Business deleted successfully');
    } catch (error) {
      console.error('Error deleting business:', error);
      throw error;
    }
  }
};
