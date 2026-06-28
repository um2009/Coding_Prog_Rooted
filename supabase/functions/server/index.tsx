import { Hono } from 'npm:hono@4.7.11';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as db from './db-operations.tsx';
import { seedSimple } from './seed-simple.tsx';
import { supabase as supabaseClient } from './supabase-client.tsx';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Enable CORS and logging
app.use('*', cors());
app.use('*', logger(console.log));

// Supabase Auth client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

console.log('🔧 Supabase Configuration:');
console.log('   URL:', supabaseUrl);
console.log('   Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');
console.log('   Service Key exists:', !!supabaseServiceKey);
console.log('   Expected Project ID: bzvneqfbtcextniqzgvh');

// CRITICAL: Extract project ID from Supabase URL and verify it matches
const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
const actualProjectId = urlMatch ? urlMatch[1] : 'UNKNOWN';
console.log('   Actual Project ID from URL:', actualProjectId);

if (actualProjectId !== 'bzvneqfbtcextniqzgvh') {
  console.error('');
  console.error('❌❌❌ CRITICAL CONFIGURATION ERROR ❌❌❌');
  console.error('The server is using a DIFFERENT Supabase project than the frontend!');
  console.error('Frontend expects: bzvneqfbtcextniqzgvh');
  console.error('Server is using: ' + actualProjectId);
  console.error('');
  console.error('This means:');
  console.error('- Tokens issued during sign-in will be for project: ' + actualProjectId);
  console.error('- But frontend will try to validate against: bzvneqfbtcextniqzgvh');
  console.error('- All auth operations will fail with "Invalid JWT"');
  console.error('');
  console.error('FIX: Update environment variables to use the correct Supabase project');
  console.error('');
} else {
  console.log('✅ Project ID matches! Frontend and backend are using the same Supabase project');
}

// Use the singleton Supabase client
const supabase = supabaseClient;

// Auto-seed database on startup if empty
console.log('🔍 Checking if database needs seeding...');
supabase.from('businesses').select('id', { count: 'exact', head: true }).then(async ({ count, error }) => {
  if (error) {
    console.log('⚠️ Could not check businesses table - seeding may be needed');
    console.log('💡 You can manually seed at: POST /make-server-1cfc035a/admin/seed');
    return;
  }
  
  if (count === 0) {
    console.log('📦 Database is empty, running auto-seed...');
    try {
      await seedSimple();
      console.log('✅ Auto-seed completed successfully');
    } catch (seedError) {
      console.error('❌ Auto-seed failed:', seedError);
      console.log('💡 You can manually seed at: POST /make-server-1cfc035a/admin/seed');
    }
  } else {
    console.log(`✅ Database has ${count} businesses - no seeding needed`);
  }
}).catch((err) => {
  console.error('⚠️ Database check error:', err);
});

// Helper function to get user from auth token
async function getUserFromAuth(authHeader: string | null): Promise<{ id: string; email: string; user_metadata?: any } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No valid Authorization header found');
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  console.log('🔑 Validating token:', token.substring(0, 20) + '...' + token.substring(token.length - 20));
  console.log('🔑 Token length:', token.length);
  
  // Try to decode the JWT to see what's inside (without verification)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('🔍 JWT payload:', JSON.stringify(payload, null, 2));
      console.log('🔍 JWT issuer:', payload.iss);
      console.log('🔍 JWT role:', payload.role);
      console.log('🔍 JWT sub (user id):', payload.sub);
      console.log('🔍 JWT exp:', payload.exp, '(', new Date(payload.exp * 1000).toISOString(), ')');
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.error('❌ Token is EXPIRED! Expired at:', new Date(payload.exp * 1000).toISOString());
        console.error('❌ Current time:', new Date().toISOString());
        return null;
      }
    }
  } catch (e) {
    console.error('❌ Could not decode JWT:', e);
  }
  
  try {
    // CRITICAL: Use service role key to validate JWT tokens
    // The anon key cannot validate JWTs that were issued by the auth system
    const supabaseAuth = createClient(
      supabaseUrl,
      supabaseServiceKey // ✅ Use service role key to validate tokens
    );
    
    console.log('🔍 Attempting to validate JWT with Supabase...');
    console.log('🔍 Using Supabase URL:', supabaseUrl);
    console.log('🔍 Using Service Role Key (first 20):', supabaseServiceKey.substring(0, 20) + '...');
    
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    
    if (error) {
      console.error('❌ Token validation error:', error.message);
      console.error('❌ Error code:', error.status);
      console.error('❌ Error name:', error.name);
      console.error('❌ Full error:', JSON.stringify(error, null, 2));
      
      // Check if this is an "Invalid JWT" error specifically
      if (error.message?.includes('Invalid JWT') || error.message?.includes('invalid') || error.message?.includes('JWT')) {
        console.error('💡 JWT is being rejected by Supabase Auth');
        console.error('💡 This usually means:');
        console.error('   1. Token was issued by a different Supabase project');
        console.error('   2. Token signature does not match JWT secret');
        console.error('   3. Token format is malformed');
      }
      
      return null;
    }
    
    if (!user) {
      console.error('❌ No user found for token');
      return null;
    }
    
    console.log('✅ Token validated successfully for user:', user.email, 'ID:', user.id);
    
    // Check if user has a profile in the profiles table
    const profile = await db.getProfileById(user.id);
    if (!profile) {
      console.warn('⚠️ User has no profile in profiles table! Creating one...');
      // Try to create profile automatically
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Failed to create profile:', insertError);
        console.error('❌ User cannot use authenticated features until profile is created');
        // Return null to indicate auth failure due to missing profile
        return null;
      } else {
        console.log('✅ Profile created successfully for user:', user.email);
      }
    } else {
      console.log('✅ User profile found:', profile.email);
    }
    
    return {
      id: user.id,
      email: user.email || 'unknown',
      user_metadata: user.user_metadata
    };
  } catch (error: any) {
    console.error('❌ getUserFromAuth error:', error.message || error);
    console.error('❌ Full exception:', error);
    return null;
  }
}

// ===== HEALTH CHECK =====
app.get('/make-server-1cfc035a/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== DIAGNOSTIC ENDPOINT =====
app.get('/make-server-1cfc035a/diagnostic', (c) => {
  return c.json({
    server: {
      supabaseUrl: supabaseUrl,
      projectId: actualProjectId,
      expectedProjectId: 'bzvneqfbtcextniqzgvh',
      projectIdMatches: actualProjectId === 'bzvneqfbtcextniqzgvh',
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
      anonKeyPreview: supabaseAnonKey.substring(0, 30) + '...',
    },
    frontend: {
      expectedProjectId: 'bzvneqfbtcextniqzgvh',
      expectedUrl: 'https://bzvneqfbtcextniqzgvh.supabase.co'
    },
    diagnosis: actualProjectId !== 'bzvneqfbtcextniqzgvh' 
      ? '❌ MISMATCH DETECTED: Server and frontend are using different Supabase projects!'
      : '✅ Server and frontend are using the same Supabase project'
  });
});

// ===== AUTHENTICATION ENDPOINTS =====

app.post('/make-server-1cfc035a/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    // Create auth user with name in user_metadata
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since no email server configured
      user_metadata: { name }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    console.log('✅ User signed up:', email);
    
    return c.json({ 
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata.name,
        avatar_url: authData.user.user_metadata.avatar_url
      },
      message: 'Signup successful' 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Signup failed', details: String(error) }, 500);
  }
});

app.post('/make-server-1cfc035a/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log('🔐 SIGNIN REQUEST');
    console.log('   Email:', email);
    console.log('   Supabase URL:', supabaseUrl);
    console.log('   Using Anon Key (first 30):', supabaseAnonKey.substring(0, 30) + '...');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Auth signin error:', error);
      return c.json({ error: error.message }, 401);
    }

    if (!data.session || !data.session.access_token) {
      console.error('❌ No session or access token in response');
      return c.json({ error: 'No session created' }, 500);
    }

    console.log('✅ User signed in:', email);
    console.log('✅ Access token received (first 50 chars):', data.session.access_token.substring(0, 50) + '...');
    console.log('✅ Access token length:', data.session.access_token.length);
    
    // Decode the JWT header to check algorithm
    try {
      const tokenParts = data.session.access_token.split('.');
      if (tokenParts.length === 3) {
        const header = JSON.parse(atob(tokenParts[0]));
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('🔍 JWT Header:', JSON.stringify(header, null, 2));
        console.log('🔍 JWT Payload (issuer):', payload.iss);
        console.log('🔍 JWT Payload (subject/user):', payload.sub);
        console.log('🔍 JWT Payload (role):', payload.role);
      }
    } catch (e) {
      console.warn('⚠️ Could not decode JWT for inspection:', e);
    }

    return c.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
        avatar_url: data.user.user_metadata?.avatar_url
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ error: 'Signin failed', details: String(error) }, 500);
  }
});

app.post('/make-server-1cfc035a/auth/signout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'No authorization header' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Signout error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ User signed out');
    return c.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    return c.json({ error: 'Signout failed' }, 500);
  }
});

app.get('/make-server-1cfc035a/auth/session', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromAuth(authHeader);
    
    if (!user) {
      return c.json({ session: null, user: null });
    }
    
    return c.json({
      session: { access_token: authHeader?.replace('Bearer ', '') },
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return c.json({ session: null, user: null });
  }
});

// ===== USER PROFILE ENDPOINTS =====

app.get('/make-server-1cfc035a/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const user = await db.getUserById(id);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

// ===== BUSINESS ENDPOINTS =====

app.get('/make-server-1cfc035a/businesses', async (c) => {
  try {
    console.log('📋 Fetching all businesses with stats...');
    const businesses = await db.getBusinessesWithStats();
    console.log(`✅ Found ${businesses.length} businesses`);
    return c.json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return c.json({ error: 'Failed to fetch businesses', details: String(error) }, 500);
  }
});

app.get('/make-server-1cfc035a/businesses/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const business = await db.getBusinessWithStats(id);
    
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    return c.json(business);
  } catch (error) {
    console.error('Error fetching business:', error);
    return c.json({ error: 'Failed to fetch business' }, 500);
  }
});

// ===== REVIEW ENDPOINTS =====

app.get('/make-server-1cfc035a/reviews', async (c) => {
  try {
    const businessId = c.req.query('businessId');
    const userId = c.req.query('userId');
    
    let reviews = [];
    
    if (businessId) {
      reviews = await db.getReviewsByBusinessId(businessId);
    } else if (userId) {
      reviews = await db.getReviewsByUserId(userId);
    } else {
      return c.json({ error: 'businessId or userId required' }, 400);
    }
    
    // Enrich reviews with user info from profiles table (NOT auth.users)
    const userIds = [...new Set(reviews.map(r => r.user_id))];
    const profiles = await db.getProfilesByIds(userIds);
    
    // Create a map for quick lookup
    const profileMap = new Map(profiles.map(p => [p.id, p]));
    
    const enrichedReviews = reviews.map(review => {
      const profile = profileMap.get(review.user_id);
      return {
        ...review,
        user_name: profile?.name || profile?.email || 'Anonymous',
        user_avatar: profile?.avatar_url
      };
    });
    
    return c.json(enrichedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

app.post('/make-server-1cfc035a/reviews', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromAuth(authHeader);
    
    if (!user) {
      console.error('❌ Review creation failed: No authenticated user');
      return c.json({ error: 'Unauthorized - You must be logged in to submit a review' }, 401);
    }

    console.log('✅ Authenticated user for review:', user.id, user.email);

    const { businessId, rating, comment } = await c.req.json();
    
    if (!businessId || !rating || rating < 1 || rating > 5) {
      console.error('❌ Review creation failed: Invalid data', { businessId, rating });
      return c.json({ error: 'Invalid review data - Rating must be between 1 and 5' }, 400);
    }

    console.log('📝 Creating review:', { businessId, userId: user.id, rating, commentLength: comment?.length || 0 });

    const review = await db.createReview(businessId, user.id, rating, comment, true);
    
    if (!review) {
      console.error('❌ Review creation returned null from database operation');
      return c.json({ error: 'Failed to create review - Database operation failed' }, 500);
    }

    console.log(`✅ Review created successfully for business ${businessId} by user ${user.id}`);
    
    return c.json({
      ...review,
      user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
      user_avatar: user.user_metadata?.avatar_url
    });
  } catch (error) {
    console.error('❌ Error creating review:', error);
    // Log the full error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return c.json({ 
      error: 'Failed to create review', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// ===== BOOKMARK ENDPOINTS =====

app.get('/make-server-1cfc035a/bookmarks', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromAuth(authHeader);
    
    if (!user) {
      console.log('⚠️ Bookmarks GET: No authenticated user');
      return c.json({ bookmarks: [] });
    }

    console.log(`🔍 Fetching bookmarks for user: ${user.id} (${user.email})`);
    const bookmarks = await db.getBookmarksByUserId(user.id);
    console.log(`✅ Found ${bookmarks.length} bookmarks for user ${user.email}`);
    return c.json({ bookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return c.json({ error: 'Failed to fetch bookmarks' }, 500);
  }
});

app.post('/make-server-1cfc035a/bookmarks', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('📥 POST /bookmarks - Auth header:', authHeader?.substring(0, 50) + '...');
    
    const user = await getUserFromAuth(authHeader);
    
    if (!user) {
      console.log('⚠️ Bookmarks POST: No authenticated user - returning 401');
      return c.json({ error: 'Unauthorized', details: 'Failed to authenticate user from token' }, 401);
    }

    const { bookmarks } = await c.req.json();
    
    if (!Array.isArray(bookmarks)) {
      console.log('⚠️ Bookmarks POST: Invalid data type (not an array)');
      return c.json({ error: 'Bookmarks must be an array' }, 400);
    }

    console.log(`🔄 Saving ${bookmarks.length} bookmarks for user: ${user.id} (${user.email})`);
    const success = await db.setUserBookmarks(user.id, bookmarks);
    
    if (!success) {
      console.error('❌ Failed to save bookmarks to database');
      return c.json({ error: 'Failed to save bookmarks', details: 'Database operation failed' }, 500);
    }

    console.log(`✅ Successfully saved ${bookmarks.length} bookmarks for user ${user.email}`);
    return c.json({ success: true, bookmarks });
  } catch (error) {
    console.error('❌ Error saving bookmarks - Exception caught:', error);
    console.error('   Error type:', error?.constructor?.name);
    console.error('   Error message:', error?.message);
    console.error('   Error stack:', error?.stack);
    return c.json({ error: 'Failed to save bookmarks', details: String(error) }, 500);
  }
});

app.post('/make-server-1cfc035a/bookmarks/toggle', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromAuth(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { businessId } = await c.req.json();
    
    const currentBookmarks = await db.getBookmarksByUserId(user.id);
    const isBookmarked = currentBookmarks.includes(businessId);
    
    let success;
    if (isBookmarked) {
      success = await db.removeBookmark(user.id, businessId);
    } else {
      success = await db.addBookmark(user.id, businessId);
    }
    
    if (!success) {
      return c.json({ error: 'Failed to toggle bookmark' }, 500);
    }

    console.log(`✅ Toggled bookmark for business ${businessId} by user ${user.id}`);
    return c.json({ success: true, bookmarked: !isBookmarked });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return c.json({ error: 'Failed to toggle bookmark' }, 500);
  }
});

// ===== DEAL ENDPOINTS =====

app.get('/make-server-1cfc035a/deals', async (c) => {
  try {
    const businessId = c.req.query('businessId');
    
    if (businessId) {
      const deals = await db.getActiveDealsForBusiness(businessId);
      return c.json(deals);
    } else {
      const deals = await db.getAllActiveDeals();
      return c.json(deals);
    }
  } catch (error) {
    console.error('Error fetching deals:', error);
    return c.json({ error: 'Failed to fetch deals' }, 500);
  }
});

// ===== ADMIN ENDPOINTS =====

// ===== IMAGE UPLOAD ENDPOINT =====

app.post('/make-server-1cfc035a/upload-image', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromAuth(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized - You must be logged in to upload images' }, 401);
    }

    console.log('📸 Image upload request from user:', user.id);

    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Check file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_SIZE) {
      return c.json({ error: 'File too large. Maximum size is 5MB' }, 400);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPG, PNG, and WebP are allowed' }, 400);
    }

    console.log('📁 File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Create bucket if it doesn't exist
    const bucketName = 'make-1cfc035a-business-images';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('📦 Creating storage bucket:', bucketName);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make bucket public so images can be accessed
        fileSizeLimit: MAX_SIZE
      });
      
      if (createError) {
        console.error('❌ Failed to create bucket:', createError);
        return c.json({ error: 'Failed to create storage bucket' }, 500);
      }
      console.log('✅ Bucket created successfully');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().substring(0, 8);
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${timestamp}-${randomId}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    console.log('⬆️ Uploading file to storage:', fileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return c.json({ error: 'Failed to upload file', details: uploadError.message }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log('✅ Image uploaded successfully:', publicUrl);

    return c.json({ 
      success: true, 
      url: publicUrl,
      fileName: fileName
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    return c.json({ 
      error: 'Failed to upload image', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// ===== ADMIN ENDPOINTS =====

app.post('/make-server-1cfc035a/admin/seed', async (c) => {
  try {
    console.log('🌱 Seeding database...');
    
    // First check if tables exist
    console.log('Checking if tables exist...');
    const { data: businessCheck, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .limit(1);
      
    if (businessError) {
      console.error('❌ businesses table check failed:', businessError);
      return c.json({ 
        error: 'Tables do not exist', 
        details: 'Please create the database schema first. The businesses table is missing or inaccessible.',
        hint: 'Run the DATABASE_SCHEMA.sql in Supabase SQL Editor.'
      }, 500);
    }
    
    console.log('✅ Tables exist, proceeding with seed...');
    const result = await seedSimple();
    
    return c.json({
      success: true,
      message: 'Database seeded successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Seed error:', error);
    
    // Provide detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('Error message:', errorMessage);
    console.error('Error stack:', errorStack);
    
    return c.json({ 
      error: 'Failed to seed database', 
      details: errorMessage,
      stack: errorStack,
      hint: 'Check the error details above. Make sure all database tables are created with the correct schema.'
    }, 500);
  }
});

app.post('/make-server-1cfc035a/admin/seed-all', async (c) => {
  try {
    console.log('🌱 Starting database seeding...');
    
    const result = await seedSimple();
    
    return c.json({ 
      success: true, 
      message: 'Database seeded successfully',
      result 
    });
  } catch (error: any) {
    console.error('❌ Seeding error:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Seeding failed',
      details: error.toString(),
      stack: error.stack
    }, 500);
  }
});

// ===== SCHEMA DETECTION ENDPOINT =====
app.get('/make-server-1cfc035a/schema', async (c) => {
  try {
    console.log('🔍 Detecting database schema...');
    
    const tables = ['profiles', 'businesses', 'reviews', 'bookmarks', 'deals'];
    const schema: any = {};
    
    for (const table of tables) {
      try {
        // First check if table exists by counting rows
        const { count, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          schema[table] = {
            exists: false,
            error: countError.message
          };
          continue;
        }
        
        // Table exists, now get one row to see columns
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!error && data !== null) {
          schema[table] = {
            exists: true,
            columns: data.length > 0 ? Object.keys(data[0]) : [],
            rowCount: count || 0
          };
        } else {
          schema[table] = {
            exists: true,
            columns: [],
            rowCount: count || 0
          };
        }
      } catch (err) {
        schema[table] = {
          exists: false,
          error: String(err)
        };
      }
    }
    
    console.log('✅ Schema detected:', schema);
    return c.json({ success: true, schema });
  } catch (error: any) {
    console.error('❌ Schema detection error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ===== INTERACTION TRACKING ENDPOINTS =====

// Record a business page view — increments view_count column on businesses table
app.post('/make-server-1cfc035a/interactions', async (c) => {
  try {
    const { businessId } = await c.req.json();
    if (!businessId) return c.json({ error: 'businessId required' }, 400);

    const { data: biz } = await supabase
      .from('businesses')
      .select('view_count')
      .eq('id', businessId)
      .single();

    const { error } = await supabase
      .from('businesses')
      .update({ view_count: (biz?.view_count ?? 0) + 1 })
      .eq('id', businessId);

    if (error) {
      console.error('Error incrementing view_count:', error);
      return c.json({ error: 'Failed to record view' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error recording interaction:', error);
    return c.json({ error: 'Failed to record interaction' }, 500);
  }
});

// Get view_count for a business (auth required — owner only)
app.get('/make-server-1cfc035a/interactions/:businessId', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromAuth(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const businessId = c.req.param('businessId');

    const { data: business, error } = await supabase
      .from('businesses')
      .select('owner_id, view_count')
      .eq('id', businessId)
      .single();

    if (error || !business) return c.json({ error: 'Business not found' }, 404);
    if (business.owner_id !== user.id) return c.json({ error: 'Forbidden' }, 403);

    return c.json({ view_count: business.view_count ?? 0 });
  } catch (error) {
    console.error('Error fetching view count:', error);
    return c.json({ error: 'Failed to fetch view count' }, 500);
  }
});

Deno.serve(app.fetch);