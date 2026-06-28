// Migration: Add 'active' column to deals table
import { createClient } from 'jsr:@supabase/supabase-js@2';

export async function migrateAddActiveTodeals() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔄 Starting migration: Add active column to deals table...');

    // Add active column if it doesn't exist
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          -- Check if active column exists
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'deals' 
            AND column_name = 'active'
          ) THEN
            -- Add active column with default value true
            ALTER TABLE deals ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;
            RAISE NOTICE 'Added active column to deals table';
          ELSE
            RAISE NOTICE 'Active column already exists in deals table';
          END IF;
        END $$;
      `
    });

    if (alterError) {
      console.error('❌ Error adding active column:', alterError);
      
      // Try alternative approach using direct SQL
      console.log('🔄 Trying alternative approach with raw SQL...');
      
      const { error: directError } = await supabase
        .from('deals')
        .select('active')
        .limit(1);
      
      if (directError && directError.message.includes('active')) {
        console.log('📝 Column does not exist. Manual SQL needed.');
        console.log('\n⚠️ Please run this SQL in Supabase SQL Editor:');
        console.log('-------------------------------------------');
        console.log('ALTER TABLE deals ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL;');
        console.log('-------------------------------------------\n');
      } else {
        console.log('✅ Active column already exists');
      }
      
      return false;
    }

    console.log('✅ Migration completed successfully');
    return true;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n⚠️ Please run this SQL manually in Supabase SQL Editor:');
    console.log('-------------------------------------------');
    console.log('ALTER TABLE deals ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL;');
    console.log('-------------------------------------------\n');
    return false;
  }
}
