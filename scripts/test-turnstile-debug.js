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

async function testTurnstileVerification() {
  try {
    console.log('🔍 Testing Turnstile verification...\n');

    // Test 1: Check environment variables
    console.log('📋 Environment Check:');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'undefined');
    console.log('   TURNSTILE_SECRET_KEY:', process.env.TURNSTILE_SECRET_KEY ? '✅ Set' : '❌ Missing');
    console.log('   NEXT_PUBLIC_TURNSTILE_SITE_KEY:', process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? '✅ Set' : '❌ Missing');
    console.log('   Config turnstile secret:', config.security.turnstile.secretKey ? '✅ Set' : '❌ Missing');
    console.log('   Config turnstile site key:', config.security.turnstile.siteKey ? '✅ Set' : '❌ Missing');

    // Test 2: Test with a real Turnstile token (if available)
    console.log('\n🧪 Testing Turnstile verification with test token...');
    
    const testToken = 'test_token_123';
    const testIp = '127.0.0.1';
    
    // Import the security service
    const { SecurityService } = require('../dist/services/security');
    const securityService = new SecurityService();
    
    console.log('   Testing with test token:', testToken);
    console.log('   Test IP:', testIp);
    
    const isValid = await securityService.verifyTurnstileToken(testToken, testIp);
    console.log('   Result:', isValid ? '✅ Valid' : '❌ Invalid');

    // Test 3: Test with a fake token
    console.log('\n🧪 Testing Turnstile verification with fake token...');
    
    const fakeToken = 'fake_token_123';
    console.log('   Testing with fake token:', fakeToken);
    
    const isFakeValid = await securityService.verifyTurnstileToken(fakeToken, testIp);
    console.log('   Result:', isFakeValid ? '✅ Valid' : '❌ Invalid');

    // Test 4: Test the actual API endpoint
    console.log('\n🌐 Testing actual API endpoint...');
    
    const testPayload = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      country: 'US',
      city: 'Test City',
      consent_news: false,
      turnstileToken: 'test_token_123'
    };

    try {
      const response = await fetch('https://staging.api.petition.motherofpeace.com/api/petitions/petition-for-the-mother-of-peace/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      const result = await response.json();
      console.log('   API Response Status:', response.status);
      console.log('   API Response:', JSON.stringify(result, null, 2));
      
      if (result.ok) {
        console.log('   ✅ API call successful');
      } else {
        console.log('   ❌ API call failed:', result.error);
      }
    } catch (error) {
      console.log('   ❌ API call error:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testTurnstileVerification();
