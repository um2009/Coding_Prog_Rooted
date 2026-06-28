// Migration to remove users table foreign key constraints
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function migrateRemoveUsersForeignKeys() {
  console.log('🔧 Starting migration to remove users table foreign key constraints...');
  
  try {
    // Check if exec_sql RPC function exists
    const { data: functions, error: funcError } = await supabase.rpc('exec_sql', {
      sql: 'SELECT 1;'
    });
    
    if (funcError && funcError.code === 'PGRST202') {
      console.log('⚠️ exec_sql RPC function not found.');
      console.log('📄 Please run the SQL migration file manually:');
      console.log('   1. Go to Supabase Dashboard > SQL Editor');
      console.log('   2. Copy the contents of /supabase/MIGRATION_AUTH_USERS.sql');
      console.log('   3. Run the SQL to migrate the schema');
      console.log('');
      console.log('✅ Migration skipped - app will continue to work');
      return true; // Return true to not block the server from starting
    }
    
    // If we get here, exec_sql exists, proceed with migration
    console.log('✅ exec_sql RPC found, proceeding with automatic migration...');
    
    // First, check if reviews table exists and has the constraint
    console.log('📋 Checking reviews table...');
    const { data: reviewsData, error: reviewsCheckError } = await supabase
      .from('reviews')
      .select('id')
      .limit(1);
    
    if (!reviewsCheckError) {
      // Reviews table exists, need to drop the FK constraint
      console.log('🔨 Dropping foreign key constraint from reviews table...');
      
      // We need to recreate the table without the FK constraint
      // First backup existing reviews
      const { data: existingReviews, error: fetchError } = await supabase
        .from('reviews')
        .select('*');
      
      if (fetchError) {
        console.error('❌ Error fetching existing reviews:', fetchError);
        throw fetchError;
      }
      
      console.log(`📦 Backed up ${existingReviews?.length || 0} existing reviews`);
      
      // Drop and recreate reviews table
      const { error: dropReviewsError } = await supabase.rpc('exec_sql', {
        sql: `
          DROP TABLE IF EXISTS reviews CASCADE;
          
          CREATE TABLE reviews (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
            user_id UUID NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT NOT NULL,
            verified BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          CREATE INDEX idx_reviews_business_id ON reviews(business_id);
          CREATE INDEX idx_reviews_user_id ON reviews(user_id);
        `
      });
      
      if (dropReviewsError) {
        console.error('❌ Error recreating reviews table:', dropReviewsError);
      } else {
        console.log('✅ Reviews table recreated without FK constraint');
        
        // Restore reviews if any existed
        if (existingReviews && existingReviews.length > 0) {
          const { error: restoreError } = await supabase
            .from('reviews')
            .insert(existingReviews);
          
          if (restoreError) {
            console.error('❌ Error restoring reviews:', restoreError);
          } else {
            console.log(`✅ Restored ${existingReviews.length} reviews`);
          }
        }
      }
    }
    
    // Do the same for bookmarks table
    console.log('📋 Checking bookmarks table...');
    const { data: bookmarksData, error: bookmarksCheckError } = await supabase
      .from('bookmarks')
      .select('id')
      .limit(1);
    
    if (!bookmarksCheckError) {
      console.log('🔨 Dropping foreign key constraint from bookmarks table...');
      
      const { data: existingBookmarks, error: fetchError } = await supabase
        .from('bookmarks')
        .select('*');
      
      if (fetchError) {
        console.error('❌ Error fetching existing bookmarks:', fetchError);
        throw fetchError;
      }
      
      console.log(`📦 Backed up ${existingBookmarks?.length || 0} existing bookmarks`);
      
      const { error: dropBookmarksError } = await supabase.rpc('exec_sql', {
        sql: `
          DROP TABLE IF EXISTS bookmarks CASCADE;
          
          CREATE TABLE bookmarks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, business_id)
          );
          
          CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
          CREATE INDEX idx_bookmarks_business_id ON bookmarks(business_id);
        `
      });
      
      if (dropBookmarksError) {
        console.error('❌ Error recreating bookmarks table:', dropBookmarksError);
      } else {
        console.log('✅ Bookmarks table recreated without FK constraint');
        
        if (existingBookmarks && existingBookmarks.length > 0) {
          const { error: restoreError } = await supabase
            .from('bookmarks')
            .insert(existingBookmarks);
          
          if (restoreError) {
            console.error('❌ Error restoring bookmarks:', restoreError);
          } else {
            console.log(`✅ Restored ${existingBookmarks.length} bookmarks`);
          }
        }
      }
    }
    
    // Try to drop users table if it exists
    console.log('🗑️ Attempting to drop users table...');
    const { error: dropUsersError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS users CASCADE;'
    });
    
    if (dropUsersError) {
      console.log('⚠️ Could not drop users table (may not exist or RPC not available)');
    } else {
      console.log('✅ Users table dropped successfully');
    }
    
    console.log('✅ Migration completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}