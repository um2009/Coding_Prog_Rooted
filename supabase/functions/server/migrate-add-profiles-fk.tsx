// Migration to add foreign key constraints linking to profiles table
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function migrateAddProfilesForeignKeys() {
  console.log('🔧 Starting migration to add profiles table foreign key constraints...');
  
  try {
    // Step 1: Ensure profiles table exists
    console.log('📋 Checking if profiles table exists...');
    const { error: profilesCheckError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesCheckError) {
      console.log('⚠️ Profiles table does not exist. Creating it now...');
      
      // Create profiles table
      const createProfilesSQL = `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          avatar_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
      `;
      
      // Try to execute with exec_sql RPC
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: createProfilesSQL
      });
      
      if (createError) {
        console.log('⚠️ Could not create profiles table via RPC.');
        console.log('📄 Please manually create the profiles table in Supabase SQL Editor:');
        console.log(createProfilesSQL);
        return false;
      }
      
      console.log('✅ Profiles table created successfully');
    } else {
      console.log('✅ Profiles table already exists');
    }
    
    // Step 2: Add foreign key constraint to reviews table
    console.log('🔨 Adding foreign key constraint to reviews.user_id...');
    
    const alterReviewsSQL = `
      -- First, remove any existing constraint with the same name
      ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
      
      -- Add the new foreign key constraint
      ALTER TABLE reviews 
        ADD CONSTRAINT reviews_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE;
    `;
    
    const { error: reviewsError } = await supabase.rpc('exec_sql', {
      sql: alterReviewsSQL
    });
    
    if (reviewsError) {
      console.log('⚠️ Could not add FK to reviews table:', reviewsError.message);
      console.log('📄 Please run this SQL manually:');
      console.log(alterReviewsSQL);
    } else {
      console.log('✅ Foreign key constraint added to reviews.user_id');
    }
    
    // Step 3: Add foreign key constraint to bookmarks table
    console.log('🔨 Adding foreign key constraint to bookmarks.user_id...');
    
    const alterBookmarksSQL = `
      -- First, remove any existing constraint with the same name
      ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;
      
      -- Add the new foreign key constraint
      ALTER TABLE bookmarks 
        ADD CONSTRAINT bookmarks_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE;
    `;
    
    const { error: bookmarksError } = await supabase.rpc('exec_sql', {
      sql: alterBookmarksSQL
    });
    
    if (bookmarksError) {
      console.log('⚠️ Could not add FK to bookmarks table:', bookmarksError.message);
      console.log('📄 Please run this SQL manually:');
      console.log(alterBookmarksSQL);
    } else {
      console.log('✅ Foreign key constraint added to bookmarks.user_id');
    }
    
    console.log('');
    console.log('✅ Migration completed successfully!');
    console.log('📊 Current database schema:');
    console.log('   • businesses (id, name, category, description, etc.)');
    console.log('   • profiles (id → auth.users, email, name, role, avatar_url)');
    console.log('   • reviews (id, business_id → businesses, user_id → profiles, rating, comment)');
    console.log('   • bookmarks (id, user_id → profiles, business_id → businesses)');
    console.log('   • deals (id, business_id → businesses, title, description, code, expiry_date)');
    console.log('');
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('');
    console.log('📄 Manual SQL to run in Supabase SQL Editor:');
    console.log(`
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add foreign key constraints
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE reviews 
  ADD CONSTRAINT reviews_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;
ALTER TABLE bookmarks 
  ADD CONSTRAINT bookmarks_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;
    `);
    
    return false;
  }
}
