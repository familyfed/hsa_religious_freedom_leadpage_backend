const { DatabaseService } = require('../dist/database/supabase');

async function checkViews() {
  try {
    console.log('🔍 Checking petition stats views in your Supabase database...\n');

    const db = new DatabaseService();

    // Test regular petition_stats view
    console.log('📊 Testing petition_stats view...');
    try {
      const stats = await db.getPetitionStats('petition-for-the-mother-of-peace');
      if (stats) {
        console.log('✅ petition_stats view working:');
        console.log('   - ID:', stats.id);
        console.log('   - Slug:', stats.slug);
        console.log('   - Title:', stats.title);
        console.log('   - Confirmed Count:', stats.confirmed_count);
        console.log('   - Available fields:', Object.keys(stats));
      } else {
        console.log('❌ No data found in petition_stats view');
      }
    } catch (error) {
      console.log('❌ petition_stats view error:', error.message);
    }

    // Try to query petition_stats_materialized directly
    console.log('\n📊 Testing petition_stats_materialized...');
    try {
      // This would require a direct Supabase query since it's not in our service
      const { createClient } = require('@supabase/supabase-js');
      const config = require('../dist/config').config;
      
      const supabase = createClient(
        config.supabase.url,
        config.supabase.serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      const { data, error } = await supabase
        .from('petition_stats_materialized')
        .select('*')
        .eq('slug', 'petition-for-the-mother-of-peace')
        .single();

      if (error) {
        console.log('❌ petition_stats_materialized error:', error.message);
        console.log('   This suggests the materialized view does not exist or is not accessible');
      } else {
        console.log('✅ petition_stats_materialized working:');
        console.log('   - Data:', data);
        console.log('   - Available fields:', Object.keys(data));
      }
    } catch (error) {
      console.log('❌ petition_stats_materialized not accessible:', error.message);
    }

    // Let's also try to get all available tables/views
    console.log('\n🔍 Checking all available petition-related tables/views...');
    try {
      const { createClient } = require('@supabase/supabase-js');
      const config = require('../dist/config').config;
      
      const supabase = createClient(
        config.supabase.url,
        config.supabase.serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      // Query information_schema to see what exists
      const { data: tables, error: tablesError } = await supabase
        .rpc('exec_sql', {
          sql: `
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%petition%'
            ORDER BY table_name;
          `
        });

      if (tablesError) {
        console.log('❌ Error querying tables:', tablesError.message);
      } else if (tables && tables.length > 0) {
        console.log('📋 Found petition-related tables/views:');
        tables.forEach(table => {
          console.log(`   - ${table.table_name} (${table.table_type})`);
        });
      } else {
        console.log('❌ No petition-related tables found');
      }
    } catch (error) {
      console.log('❌ Error checking tables:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkViews();
