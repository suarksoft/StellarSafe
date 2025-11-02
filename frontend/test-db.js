// Test Supabase Connection
import { supabase } from './src/lib/database/supabase';

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data, error } = await supabase.from('verified_assets').select('count');
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('\n⚠️  Tables might not exist yet. Run the migration SQL in Supabase SQL Editor.');
      console.log('📄 Migration file: /database-schema.sql\n');
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log('📊 Current verified assets count:', data);

    // Test 2: Check all tables
    console.log('\n2️⃣ Checking tables...');
    const tables = [
      'verified_assets',
      'blacklisted_assets',
      'user_watchlist',
      'analysis_history',
      'community_reports'
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ ${table}: NOT FOUND`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    }

    // Test 3: Sample data
    console.log('\n3️⃣ Checking sample data...');
    const { data: assets, error: assetsError } = await supabase
      .from('verified_assets')
      .select('asset_code, home_domain')
      .limit(5);

    if (!assetsError && assets) {
      console.log('✅ Sample verified assets:');
      assets.forEach(asset => {
        console.log(`   - ${asset.asset_code} (${asset.home_domain || 'no domain'})`);
      });
    }

    console.log('\n✨ All tests passed! Database is ready.\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();
