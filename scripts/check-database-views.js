const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function checkDatabaseViews() {
  try {
    console.log('🔍 Checking what views exist in your Supabase database...\n');

    // Query to get all views in the public schema
    const { data: views, error: viewsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            viewname,
            definition
          FROM pg_views 
          WHERE schemaname = 'public' 
          AND viewname LIKE '%petition_stats%'
          ORDER BY viewname;
        `
      });

    if (viewsError) {
      console.error('❌ Error querying views:', viewsError);
      return;
    }

    console.log('📊 Found petition_stats related views:');
    console.log('=====================================');
    
    if (views && views.length > 0) {
      views.forEach(view => {
        console.log(`\n🔹 View: ${view.viewname}`);
        console.log(`   Schema: ${view.schemaname}`);
        console.log(`   Definition: ${view.definition.substring(0, 200)}...`);
      });
    } else {
      console.log('❌ No petition_stats views found');
    }

    // Also check for materialized views
    console.log('\n🔍 Checking for materialized views...');
    const { data: matViews, error: matViewsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            matviewname,
            definition
          FROM pg_matviews 
          WHERE schemaname = 'public' 
          AND matviewname LIKE '%petition_stats%'
          ORDER BY matviewname;
        `
      });

    if (matViewsError) {
      console.error('❌ Error querying materialized views:', matViewsError);
    } else if (matViews && matViews.length > 0) {
      console.log('\n📊 Found petition_stats materialized views:');
      console.log('==========================================');
      matViews.forEach(view => {
        console.log(`\n🔹 Materialized View: ${view.matviewname}`);
        console.log(`   Schema: ${view.schemaname}`);
        console.log(`   Definition: ${view.definition.substring(0, 200)}...`);
      });
    } else {
      console.log('❌ No petition_stats materialized views found');
    }

    // Test querying both if they exist
    console.log('\n🧪 Testing data access...');
    
    // Test regular view
    try {
      const { data: regularStats, error: regularError } = await supabase
        .from('petition_stats')
        .select('*')
        .limit(5);
      
      if (regularError) {
        console.log('❌ petition_stats view error:', regularError.message);
      } else {
        console.log('✅ petition_stats view working:', regularStats?.length || 0, 'records');
      }
    } catch (e) {
      console.log('❌ petition_stats view not accessible:', e.message);
    }

    // Test materialized view
    try {
      const { data: matStats, error: matError } = await supabase
        .from('petition_stats_materialized')
        .select('*')
        .limit(5);
      
      if (matError) {
        console.log('❌ petition_stats_materialized error:', matError.message);
      } else {
        console.log('✅ petition_stats_materialized working:', matStats?.length || 0, 'records');
      }
    } catch (e) {
      console.log('❌ petition_stats_materialized not accessible:', e.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabaseViews();
