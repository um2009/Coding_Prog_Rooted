// Database operations for all tables
import { supabase } from './supabase-client.tsx';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ===== USER OPERATIONS =====

// Get profile by user ID
export async function getProfileById(userId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
}

// Get multiple profiles by user IDs
export async function getProfilesByIds(userIds: string[]): Promise<any[]> {
  if (userIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);
  
  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  
  return data || [];
}

// DEPRECATED: We now use Supabase Auth (auth.users) instead of a custom users table
// The functions below are kept for reference but should not be used

export async function createUser(id: string, email: string, name: string): Promise<any | null> {
  console.warn('⚠️ createUser is deprecated - use Supabase Auth instead');
  return null;
}

export async function getUserById(id: string): Promise<any | null> {
  console.warn('⚠️ getUserById is deprecated - use Supabase Auth instead');
  return null;
}

export async function getUserByEmail(email: string): Promise<any | null> {
  console.warn('⚠️ getUserByEmail is deprecated - use Supabase Auth instead');
  return null;
}

// ===== BUSINESS OPERATIONS =====

export async function getAllBusinesses(): Promise<any[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }
  return data || [];
}

export async function getBusinessById(id: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching business:', error);
    return null;
  }
  return data;
}

export async function getBusinessesWithStats(): Promise<any[]> {
  const businesses = await getAllBusinesses();
  
  // Enhance each business with deals info and rating/review count
  const today = new Date().toISOString().split('T')[0];
  
  for (const business of businesses) {
    // Check if has active deals (not expired)
    const { data: deals } = await supabase
      .from('deals')
      .select('*')
      .eq('business_id', business.id)
      .gte('expiration_date', today);
    
    business.has_deal = (deals && deals.length > 0);
    
    // Get review count and rating
    const reviews = await getReviewsByBusinessId(business.id);
    business.review_count = reviews.length;
    
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      business.rating = Number(avgRating.toFixed(1));
    } else {
      business.rating = 0;
    }
  }
  
  return businesses;
}

export async function getBusinessWithStats(id: string): Promise<any | null> {
  const business = await getBusinessById(id);
  if (!business) return null;
  
  const today = new Date().toISOString().split('T')[0];
  
  // Get active deals (not expired)
  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('business_id', id)
    .gte('expiration_date', today);
  
  business.has_deal = (deals && deals.length > 0);
  
  // Get review count and rating
  const reviews = await getReviewsByBusinessId(id);
  business.review_count = reviews.length;
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    business.rating = Number(avgRating.toFixed(1));
  } else {
    business.rating = 0;
  }
  
  return business;
}

// ===== REVIEW OPERATIONS =====

export async function getReviewsByBusinessId(businessId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  return data || [];
}

export async function getReviewsByUserId(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user reviews:', error);
    return [];
  }
  return data || [];
}

export async function createReview(
  businessId: string,
  userId: string,
  rating: number,
  comment: string,
  shouldUpdateBusinessRating = true
): Promise<any | null> {
  // Note: We no longer fetch user info from a users table since we're using auth.users
  // The user_name should be passed from the server endpoint that has access to the auth user

  console.log('🔨 DB: Creating review with data:', { 
    businessId, 
    userId, 
    rating, 
    commentLength: comment?.length || 0 
  });

  const review = {
    business_id: businessId,
    user_id: userId,
    rating,
    comment
  };

  console.log('🔨 DB: Inserting review into database...');

  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();
  
  if (error) {
    console.error('❌ DB: Error creating review:', error);
    console.error('❌ DB: Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return null;
  }

  console.log('✅ DB: Review created successfully with ID:', data.id);

  // Don't update business rating/count here since we calculate it dynamically
  
  return data;
}

// ===== BOOKMARK OPERATIONS =====
// NOTE: Bookmark operations use service role key to bypass RLS
// Authorization is handled at the API endpoint level

export async function getBookmarksByUserId(userId: string): Promise<string[]> {
  console.log(`📖 DB: Fetching bookmarks for user ${userId}`);
  
  // Use service role client (bypasses RLS)
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await serviceClient
    .from('bookmarks')
    .select('business_id')
    .eq('user_id', userId);
  
  if (error) {
    console.error('❌ DB: Error fetching bookmarks:', error);
    console.error('   Error details:', { message: error.message, code: error.code, details: error.details });
    return [];
  }
  
  const bookmarkIds = (data || []).map(b => b.business_id);
  console.log(`✅ DB: Found ${bookmarkIds.length} bookmarks for user ${userId}`);
  return bookmarkIds;
}

export async function addBookmark(userId: string, businessId: string): Promise<boolean> {
  console.log(`➕ DB: Adding bookmark - User: ${userId}, Business: ${businessId}`);
  
  // Use service role client (bypasses RLS)
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  
  const { error } = await serviceClient
    .from('bookmarks')
    .insert({
      user_id: userId,
      business_id: businessId
    });
  
  if (error) {
    console.error('❌ DB: Error adding bookmark:', error);
    console.error('   Error details:', { message: error.message, code: error.code, details: error.details });
    return false;
  }
  console.log(`✅ DB: Bookmark added successfully`);
  return true;
}

export async function removeBookmark(userId: string, businessId: string): Promise<boolean> {
  console.log(`➖ DB: Removing bookmark - User: ${userId}, Business: ${businessId}`);
  
  // Use service role client (bypasses RLS)
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  
  const { error } = await serviceClient
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('business_id', businessId);
  
  if (error) {
    console.error('❌ DB: Error removing bookmark:', error);
    console.error('   Error details:', { message: error.message, code: error.code, details: error.details });
    return false;
  }
  console.log(`✅ DB: Bookmark removed successfully`);
  return true;
}

export async function setUserBookmarks(userId: string, businessIds: string[]): Promise<boolean> {
  try {
    console.log(`🔄 DB: Setting ${businessIds.length} bookmarks for user ${userId}`);
    
    // Use service role client (bypasses RLS)
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Delete all existing bookmarks for this user
    console.log(`  🗑️ Deleting existing bookmarks...`);
    const { error: deleteError } = await serviceClient
      .from('bookmarks')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('❌ DB: Error deleting old bookmarks:', deleteError);
      console.error('   Error details:', { message: deleteError.message, code: deleteError.code, details: deleteError.details });
      return false;
    }
    console.log(`  ✅ Deleted existing bookmarks`);
    
    // Insert new bookmarks if any
    if (businessIds.length > 0) {
      console.log(`  ➕ Inserting ${businessIds.length} new bookmarks...`);
      const bookmarks = businessIds.map(businessId => ({
        user_id: userId,
        business_id: businessId
      }));
      
      const { error: insertError } = await serviceClient
        .from('bookmarks')
        .insert(bookmarks);
      
      if (insertError) {
        console.error('❌ DB: Error inserting new bookmarks:', insertError);
        console.error('   Error details:', { message: insertError.message, code: insertError.code, details: insertError.details });
        return false;
      }
      console.log(`  ✅ Inserted ${businessIds.length} new bookmarks`);
    }
    
    console.log(`✅ DB: Successfully set ${businessIds.length} bookmarks for user ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ DB: Error in setUserBookmarks:', error);
    return false;
  }
}

// ===== DEAL OPERATIONS =====

export async function getAllActiveDeals(): Promise<any[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, businesses(*)')
    .gte('expiration_date', new Date().toISOString().split('T')[0]) // Get deals that haven't expired
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching deals:', error);
    return [];
  }
  return data || [];
}

export async function getActiveDealsForBusiness(businessId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('business_id', businessId)
    .gte('expiration_date', new Date().toISOString().split('T')[0]) // Get deals that haven't expired
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching deals for business:', error);
    return [];
  }
  return data || [];
}

export async function createDeal(
  businessId: string,
  title: string,
  description: string,
  discountPercentage?: number,
  discountAmount?: number,
  code?: string,
  expiresAt?: string
): Promise<any | null> {
  const deal = {
    id: generateId('deal'),
    business_id: businessId,
    title,
    description,
    discount_percentage: discountPercentage,
    discount_amount: discountAmount,
    code,
    expires_at: expiresAt,
    is_active: true
  };

  const { data, error } = await supabase
    .from('deals')
    .insert(deal)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating deal:', error);
    return null;
  }
  
  // Update business has_deal flag
  await supabase
    .from('businesses')
    .update({ has_deal: true })
    .eq('id', businessId);
  
  return data;
}