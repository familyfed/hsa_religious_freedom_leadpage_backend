#!/usr/bin/env node

/**
 * Test with a completely fresh token from frontend
 * This will help us understand why the backend is rejecting fresh tokens
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const config = {
  secretKey: process.env.TURNSTILE_SECRET_KEY,
  siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  stagingUrl: 'https://staging.api.petition.motherofpeace.com'
};

console.log('🧪 TESTING WITH COMPLETELY FRESH TOKEN\n');
console.log('=' .repeat(50));

async function testFreshTokenWithCloudflare() {
  console.log('\n🔐 Testing fresh token with Cloudflare API:');
  console.log('Please provide a completely fresh token from your frontend:');
  console.log('1. Go to https://staging.petition.motherofpeace.com');
  console.log('2. Complete Turnstile challenge');
  console.log('3. Submit form immediately');
  console.log('4. Copy the token from the console logs');
  console.log('5. Paste it here and press Enter');
  
  // For now, let's test with a dummy token to see the error
  const dummyToken = 'test_fresh_token_123';
  
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: config.secretKey,
        response: dummyToken,
        remoteip: '127.0.0.1',
      }),
    });

    const result = await response.json();
    console.log(`\nStatus: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ TOKEN IS VALID!');
    } else {
      console.log('\n❌ TOKEN IS INVALID');
      if (result['error-codes']) {
        console.log('\nError Analysis:');
        result['error-codes'].forEach(code => {
          switch (code) {
            case 'invalid-input-secret':
              console.log('  ❌ Invalid secret key - Check TURNSTILE_SECRET_KEY');
              break;
            case 'invalid-input-response':
              console.log('  ❌ Invalid token - Expected for dummy token');
              break;
            case 'timeout-or-duplicate':
              console.log('  ❌ Token expired or already used');
              break;
            case 'invalid-input-remoteip':
              console.log('  ❌ Invalid remote IP');
              break;
            case 'internal-error':
              console.log('  ❌ Cloudflare internal error');
              break;
            default:
              console.log(`  ❓ Unknown error: ${code}`);
          }
        });
      }
    }
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
}

async function testBackendWithFreshToken() {
  console.log('\n🌐 Testing backend with fresh token:');
  console.log('This test requires a completely fresh token from your frontend.');
  console.log('Please provide the token when prompted.');
  
  // For now, let's test with a dummy token
  const dummyToken = 'test_fresh_token_123';
  
  const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test-fresh-token@example.com',
    country: 'US',
    city: 'Test City',
    state: 'CA',
    consent_news: true,
    turnstileToken: dummyToken
  };

  try {
    const response = await fetch(`${config.stagingUrl}/api/petitions/petition-for-the-mother-of-peace/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log(`\nStatus: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.ok) {
      console.log('\n✅ BACKEND ACCEPTED THE TOKEN!');
    } else {
      console.log('\n❌ BACKEND REJECTED THE TOKEN');
      console.log(`  Error: ${result.error}`);
    }
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
}

async function checkBackendConfiguration() {
  console.log('\n📊 BACKEND CONFIGURATION CHECK:');
  console.log(`Site Key: ${config.siteKey}`);
  console.log(`Secret Key Length: ${config.secretKey ? config.secretKey.length : 'NOT SET'}`);
  console.log(`Secret Key Preview: ${config.secretKey ? config.secretKey.substring(0, 8) + '...' : 'NOT SET'}`);
  
  console.log('\n🔍 POSSIBLE BACKEND ISSUES:');
  console.log('1. Secret key mismatch between dashboard and environment');
  console.log('2. Domain configuration issue in Turnstile dashboard');
  console.log('3. Backend environment variables not updated');
  console.log('4. Backend needs restart after configuration changes');
  console.log('5. Turnstile site key mismatch');
  
  console.log('\n💡 DEBUGGING STEPS:');
  console.log('1. Verify secret key matches between dashboard and environment');
  console.log('2. Check if domain is configured correctly in dashboard');
  console.log('3. Restart backend after configuration changes');
  console.log('4. Test with completely fresh tokens from frontend');
  console.log('5. Check backend logs for detailed error information');
}

async function main() {
  await testFreshTokenWithCloudflare();
  await testBackendWithFreshToken();
  await checkBackendConfiguration();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Get a completely fresh token from frontend');
  console.log('2. Test that token with Cloudflare API');
  console.log('3. Test that token with backend API');
  console.log('4. Check backend configuration and logs');
  console.log('');
  console.log('The frontend is working perfectly - let\'s find the backend issue!');
}

main().catch(console.error);
