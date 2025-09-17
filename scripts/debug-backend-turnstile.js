#!/usr/bin/env node

/**
 * Debug backend Turnstile configuration and test with fresh token
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

console.log('🔍 BACKEND TURNSTILE DEBUGGING\n');
console.log('=' .repeat(50));

async function checkBackendConfiguration() {
  console.log('\n📊 BACKEND CONFIGURATION:');
  console.log(`Site Key: ${config.siteKey}`);
  console.log(`Secret Key Length: ${config.secretKey ? config.secretKey.length : 'NOT SET'}`);
  console.log(`Secret Key Preview: ${config.secretKey ? config.secretKey.substring(0, 8) + '...' : 'NOT SET'}`);
  console.log(`Staging URL: ${config.stagingUrl}`);
  
  // Check if secret key looks correct
  if (config.secretKey && config.secretKey.length === 35) {
    console.log('✅ Secret key length looks correct (35 characters)');
  } else {
    console.log('❌ Secret key length is incorrect or missing');
  }
  
  // Check if site key looks correct
  if (config.siteKey && config.siteKey.startsWith('0x4AAAAAAAB')) {
    console.log('✅ Site key format looks correct');
  } else {
    console.log('❌ Site key format looks incorrect');
  }
}

async function testBackendHealth() {
  console.log('\n🌐 BACKEND HEALTH CHECK:');
  
  try {
    const response = await fetch(`${config.stagingUrl}/health`);
    const result = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));
    
    if (result.ok) {
      console.log('✅ Backend is healthy');
    } else {
      console.log('❌ Backend health check failed');
    }
    
  } catch (error) {
    console.log(`❌ Backend health check error: ${error.message}`);
  }
}

async function testTurnstileWithCloudflare() {
  console.log('\n🔐 TESTING TURNSTILE WITH CLOUDFLARE:');
  
  if (!config.secretKey) {
    console.log('❌ Cannot test - Secret key not configured');
    return;
  }

  // Test with a dummy token to see what error we get
  const dummyToken = 'test_dummy_token_123';
  
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
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Turnstile verification working with Cloudflare');
    } else {
      console.log('❌ Turnstile verification failed with Cloudflare');
      if (result['error-codes']) {
        console.log('Error codes:', result['error-codes'].join(', '));
      }
    }
    
  } catch (error) {
    console.log(`❌ Cloudflare API error: ${error.message}`);
  }
}

async function testBackendWithDummyToken() {
  console.log('\n🧪 TESTING BACKEND WITH DUMMY TOKEN:');
  
  const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test-backend-debug@example.com',
    country: 'US',
    city: 'Test City',
    state: 'CA',
    consent_news: true,
    turnstileToken: 'test_dummy_token_123'
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
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.ok) {
      console.log('✅ Backend accepted dummy token (unexpected!)');
    } else {
      console.log('❌ Backend rejected dummy token (expected)');
      console.log(`Error: ${result.error}`);
    }
    
  } catch (error) {
    console.log(`❌ Backend API error: ${error.message}`);
  }
}

async function testBackendWithTestToken() {
  console.log('\n🧪 TESTING BACKEND WITH TEST TOKEN:');
  
  const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test-token-debug@example.com',
    country: 'US',
    city: 'Test City',
    state: 'CA',
    consent_news: true,
    turnstileToken: 'test_token_123' // This should be bypassed
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
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.ok) {
      console.log('✅ Backend accepted test token (expected - should be bypassed)');
    } else {
      console.log('❌ Backend rejected test token (unexpected - should be bypassed)');
      console.log(`Error: ${result.error}`);
    }
    
  } catch (error) {
    console.log(`❌ Backend API error: ${error.message}`);
  }
}

async function main() {
  await checkBackendConfiguration();
  await testBackendHealth();
  await testTurnstileWithCloudflare();
  await testBackendWithDummyToken();
  await testBackendWithTestToken();
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Get a fresh token from frontend');
  console.log('2. Test that token with Cloudflare API');
  console.log('3. Test that token with backend API');
  console.log('4. Check backend logs for detailed error information');
  console.log('');
  console.log('The frontend is working perfectly - let\'s find the backend issue!');
}

main().catch(console.error);
