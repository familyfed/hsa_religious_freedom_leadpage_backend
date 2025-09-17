const { createClient } = require('@supabase/supabase-js');
const config = require('../dist/config').config;

async function testStagingDeployment() {
  try {
    console.log('🔍 Testing staging deployment status...\n');

    // Test 1: Check if the enhanced stats endpoint is working (this was deployed earlier)
    console.log('📊 Testing enhanced stats endpoint...');
    try {
      const response = await fetch('https://staging.api.petition.motherofpeace.com/api/petitions/petition-for-the-mother-of-peace/stats/enhanced');
      const data = await response.json();
      
      if (data.ok && data.data.last_updated) {
        console.log('✅ Enhanced stats endpoint working - deployment is live');
        console.log('   Last updated:', data.data.last_updated);
      } else {
        console.log('❌ Enhanced stats endpoint not working - deployment issue');
      }
    } catch (error) {
      console.log('❌ Enhanced stats endpoint error:', error.message);
    }

    // Test 2: Test Turnstile verification with test token
    console.log('\n🧪 Testing Turnstile verification...');
    try {
      const response = await fetch('https://staging.api.petition.motherofpeace.com/api/petitions/petition-for-the-mother-of-peace/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: 'Test',
          last_name: 'User',
          email: 'test4@example.com',
          country: 'US',
          city: 'Test City',
          consent_news: false,
          turnstileToken: 'test_token_123'
        })
      });

      const data = await response.json();
      console.log('   Response status:', response.status);
      console.log('   Response:', JSON.stringify(data, null, 2));
      
      if (data.error && data.error.includes('Token verification failed')) {
        console.log('✅ Turnstile fix is deployed - getting detailed error messages');
      } else if (data.error === 'Bot check failed') {
        console.log('❌ Turnstile fix NOT deployed - still getting generic error');
      } else if (data.ok) {
        console.log('✅ Turnstile verification working - test token accepted');
      }
    } catch (error) {
      console.log('❌ Turnstile test error:', error.message);
    }

    // Test 3: Check environment variables
    console.log('\n🔧 Environment check...');
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   TURNSTILE_SECRET_KEY:', process.env.TURNSTILE_SECRET_KEY ? 'Set' : 'Missing');
    console.log('   Config secret key:', config.security.turnstile.secretKey ? 'Set' : 'Missing');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testStagingDeployment();
