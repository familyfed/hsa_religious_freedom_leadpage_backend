#!/usr/bin/env node

/**
 * Create the campaign petition in Supabase
 * This script ensures the petition exists for the API to work
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCampaignPetition() {
  try {
    console.log('🔍 Checking if campaign petition exists...');
    
    // Check if petition already exists
    const { data: existingPetition, error: checkError } = await supabase
      .from('petitions')
      .select('id, slug, title')
      .eq('slug', 'campaign')
      .single();

    if (existingPetition) {
      console.log('✅ Campaign petition already exists:', existingPetition.title);
      return existingPetition;
    }

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    console.log('📝 Creating campaign petition...');
    
    // Create the petition
    const { data: petition, error: createError } = await supabase
      .from('petitions')
      .insert({
        slug: 'campaign',
        title: 'Faith Under Siege: Stand for Religious Freedom in Korea',
        intro_md: 'On July 18, 2025, authorities raided homes and churches without charges. Add your name to demand due process and dignity for people of faith.',
        goal_count: 10000,
        is_public: true,
        created_by: null // Service role can create without user reference
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    console.log('✅ Campaign petition created successfully:', petition.title);
    return petition;

  } catch (error) {
    console.error('❌ Error creating campaign petition:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

async function testPetitionStats() {
  try {
    console.log('🧪 Testing petition stats...');
    
    const { data: stats, error } = await supabase
      .from('petition_stats')
      .select('*')
      .eq('slug', 'campaign')
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Petition stats working:', stats);
    return stats;

  } catch (error) {
    console.error('❌ Error testing petition stats:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Setting up campaign petition...\n');
  
  await createCampaignPetition();
  console.log('');
  await testPetitionStats();
  
  console.log('\n🎉 Campaign petition setup complete!');
  console.log('The API should now work correctly.');
}

main();
