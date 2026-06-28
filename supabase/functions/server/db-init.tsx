// Database initialization - creates tables if they don't exist
import { supabase } from './supabase-client.tsx';

export async function initializeDatabaseTables() {
  console.log('🔧 Checking database tables...');

  try {
    // Create tables using raw SQL
    const createTablesSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Businesses table
      CREATE TABLE IF NOT EXISTS businesses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        district TEXT NOT NULL,
        description TEXT NOT NULL,
        price_range TEXT NOT NULL,
        hours TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        website TEXT,
        image_url TEXT NOT NULL,
        map_coordinate JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Reviews table
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        verified BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Bookmarks table
      CREATE TABLE IF NOT EXISTS bookmarks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, business_id)
      );

      -- Deals table
      CREATE TABLE IF NOT EXISTS deals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        discount_percentage INTEGER,
        code TEXT,
        expiry_date TIMESTAMPTZ NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create indexes if they don't exist
      CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_business_id ON bookmarks(business_id);
      CREATE INDEX IF NOT EXISTS idx_deals_business_id ON deals(business_id);
      CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(active);
      CREATE INDEX IF NOT EXISTS idx_deals_expiry_date ON deals(expiry_date);
    `;

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
    
    if (error) {
      // If RPC doesn't exist, try direct table creation
      console.log('⚠️ Could not use RPC, tables may need manual creation');
      console.log('Please run DATABASE_SCHEMA.sql in Supabase SQL Editor');
      return false;
    }

    console.log('✅ Database tables verified/created');
    return true;

  } catch (error) {
    console.error('❌ Error initializing tables:', error);
    return false;
  }
}

// Check if tables exist by trying to query them
export async function checkTablesExist(): Promise<boolean> {
  try {
    // Try to query each table
    const { error: usersError } = await supabase.from('users').select('id').limit(1);
    const { error: businessesError } = await supabase.from('businesses').select('id').limit(1);
    const { error: reviewsError } = await supabase.from('reviews').select('id').limit(1);
    const { error: bookmarksError } = await supabase.from('bookmarks').select('id').limit(1);
    const { error: dealsError } = await supabase.from('deals').select('id').limit(1);

    if (usersError || businessesError || reviewsError || bookmarksError || dealsError) {
      console.log('❌ One or more tables do not exist');
      return false;
    }

    console.log('✅ All tables exist');
    return true;
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    return false;
  }
}
