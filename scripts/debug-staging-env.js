const { createClient } = require('@supabase/supabase-js');
const config = require('../dist/config').config;

async function debugStagingEnvironment() {
  try {
    console.log('🔍 Debugging staging environment...\n');

    // Test 1: Check if we can get environment info
    console.log('📋 Environment Information:');
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   Config nodeEnv:', config.nodeEnv);
    console.log('   TURNSTILE_SECRET_KEY:', process.env.TURNSTILE_SECRET_KEY ? 'Set' : 'Missing');
    console.log('   Config secret key:', config.security.turnstile.secretKey ? 'Set' : 'Missing');

    // Test 2: Test with a real Turnstile token format
    console.log('\n🧪 Testing with real Turnstile token format...');
    try {
      const response = await fetch('https://staging.api.petition.motherofpeace.com/api/petitions/petition-for-the-mother-of-peace/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: 'Test',
          last_name: 'User',
          email: 'test6@example.com',
          country: 'US',
          city: 'Test City',
          consent_news: false,
          turnstileToken: '0.abcdef123456789' // Real Turnstile token format
        })
      });

      const data = await response.json();
      console.log('   Response status:', response.status);
      console.log('   Response:', JSON.stringify(data, null, 2));
      
      // Check if we get detailed error messages
      if (data.error && data.error.includes('Token verification failed')) {
        console.log('✅ Turnstile fix is working - getting detailed error messages');
      } else if (data.error === 'Bot check failed') {
        console.log('❌ Turnstile fix still not working - generic error message');
      }
    } catch (error) {
      console.log('❌ Test error:', error.message);
    }

    // Test 3: Check if the test token bypass is working
    console.log('\n🧪 Testing test token bypass...');
    try {
      const response = await fetch('https://staging.api.petition.motherofpeace.com/api/petitions/petition-for-the-mother-of-peace/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: 'Test',
          last_name: 'User',
          email: 'test7@example.com',
          country: 'US',
          city: 'Test City',
          consent_news: false,
          turnstileToken: 'test_token_123'
        })
      });

      const data = await response.json();
      console.log('   Response status:', response.status);
      console.log('   Response:', JSON.stringify(data, null, 2));
      
      if (data.ok) {
        console.log('✅ Test token bypass working');
      } else if (data.error === 'Bot check failed') {
        console.log('❌ Test token bypass not working - still getting bot check failed');
      } else {
        console.log('ℹ️  Other error:', data.error);
      }
    } catch (error) {
      console.log('❌ Test error:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugStagingEnvironment();
