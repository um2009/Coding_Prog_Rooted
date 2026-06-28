// Migration to add owner_id to businesses table
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function migrateAddBusinessOwner() {
  console.log('🔧 Starting migration to add owner_id to businesses table...');
  
  try {
    // Check if businesses table exists
    console.log('📋 Checking if businesses table exists...');
    const { data: businessCheck, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .limit(1);
    
    if (businessError) {
      console.log('⚠️ Businesses table does not exist. Cannot add owner_id column.');
      return false;
    }
    
    console.log('✅ Businesses table exists');
    
    // Check if owner_id column already exists
    const { data: sample, error: sampleError } = await supabase
      .from('businesses')
      .select('*')
      .limit(1);
    
    if (sample && sample.length > 0 && 'owner_id' in sample[0]) {
      console.log('✅ owner_id column already exists in businesses table');
      return true;
    }
    
    console.log('🔨 Adding owner_id column to businesses table...');
    
    // Add owner_id column with foreign key constraint
    const alterBusinessesSQL = `
      -- Add owner_id column (nullable initially to allow existing data)
      ALTER TABLE businesses 
        ADD COLUMN IF NOT EXISTS owner_id UUID;
      
      -- Add foreign key constraint linking to profiles
      ALTER TABLE businesses 
        DROP CONSTRAINT IF EXISTS businesses_owner_id_fkey;
      
      ALTER TABLE businesses 
        ADD CONSTRAINT businesses_owner_id_fkey 
        FOREIGN KEY (owner_id) 
        REFERENCES profiles(id) 
        ON DELETE SET NULL;
      
      -- Create index for faster queries
      CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
    `;
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: alterBusinessesSQL
    });
    
    if (alterError) {
      console.log('⚠️ Could not add owner_id column via RPC:', alterError.message);
      console.log('📄 Please run this SQL manually in Supabase SQL Editor:');
      console.log(alterBusinessesSQL);
      return false;
    }
    
    console.log('✅ owner_id column added to businesses table');
    
    // Optionally: Assign existing businesses to a default owner
    // Get first profile to use as default owner
    const { data: firstProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single();
    
    if (firstProfile && !profileError) {
      console.log('🔄 Assigning existing businesses to first profile...');
      
      const updateSQL = `
        UPDATE businesses 
        SET owner_id = '${firstProfile.id}' 
        WHERE owner_id IS NULL;
      `;
      
      const { error: updateError } = await supabase.rpc('exec_sql', {
        sql: updateSQL
      });
      
      if (updateError) {
        console.log('⚠️ Could not update existing businesses with default owner');
      } else {
        console.log('✅ Existing businesses assigned to default owner');
      }
    }
    
    console.log('');
    console.log('✅ Migration completed successfully!');
    console.log('📊 Updated database schema:');
    console.log('   • businesses now have owner_id → profiles(id)');
    console.log('   • When a profile is deleted, businesses.owner_id is set to NULL');
    console.log('');
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('');
    console.log('📄 Manual SQL to run in Supabase SQL Editor:');
    console.log(`
-- Add owner_id column to businesses table
ALTER TABLE businesses 
  ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Add foreign key constraint
ALTER TABLE businesses 
  DROP CONSTRAINT IF EXISTS businesses_owner_id_fkey;

ALTER TABLE businesses 
  ADD CONSTRAINT businesses_owner_id_fkey 
  FOREIGN KEY (owner_id) 
  REFERENCES profiles(id) 
  ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
    `);
    
    return false;
  }
}
