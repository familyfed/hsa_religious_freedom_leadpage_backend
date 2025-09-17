#!/usr/bin/env node

/**
 * Test Turnstile verification with a fresh token
 * This script tests the complete flow from frontend token to backend verification
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const config = {
  siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  secretKey: process.env.TURNSTILE_SECRET_KEY,
  stagingUrl: 'https://staging.api.petition.motherofpeace.com',
  productionUrl: 'https://api.petition.motherofpeace.com'
};

console.log('🧪 FRESH TURNSTILE TOKEN TESTING\n');
console.log('=' .repeat(50));

async function testTurnstileWithFreshToken() {
  console.log('\n📋 Test Instructions:');
  console.log('1. Go to your frontend at: https://staging.petition.motherofpeace.com');
  console.log('2. Open browser developer tools (F12)');
  console.log('3. Go to Console tab');
  console.log('4. Run this command to get a fresh token:');
  console.log('   window.turnstile.getResponse()');
  console.log('5. Copy the token and paste it below when prompted');
  console.log('');
  
  // For now, let's test with a known working scenario
  console.log('\n🔍 Testing with test token (should be bypassed):');
  
  const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test-fresh@example.com', // Use a different email to avoid duplicate
    country: 'US',
    city: 'Test City',
    state: 'CA',
    consent_news: true,
    turnstileToken: 'test_token_123'
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
    console.log(`  Status: ${response.status}`);
    console.log(`  Response:`, JSON.stringify(result, null, 2));
    
    if (result.ok) {
      console.log('  ✅ Test token bypass working correctly');
    } else if (result.error === 'email address already signed this petition') {
      console.log('  ✅ Test token bypass working (duplicate email expected)');
    } else {
      console.log('  ❌ Test token bypass not working');
    }
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

async function testTurnstileVerificationDirectly() {
  console.log('\n🔐 Testing Turnstile verification directly with Cloudflare:');
  
  if (!config.secretKey) {
    console.log('❌ Cannot test - Secret key not configured');
    return;
  }

  // Test with a dummy token to see the error response
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: config.secretKey,
        response: 'dummy_token_for_testing',
        remoteip: '127.0.0.1',
      }),
    });

    const result = await response.json();
    console.log(`  Status: ${response.status}`);
    console.log(`  Response:`, JSON.stringify(result, null, 2));
    
    if (result['error-codes']) {
      console.log('\n  Error Analysis:');
      result['error-codes'].forEach(code => {
        switch (code) {
          case 'invalid-input-secret':
            console.log('    ❌ Secret key is invalid - Check TURNSTILE_SECRET_KEY');
            break;
          case 'invalid-input-response':
            console.log('    ✅ Expected error for dummy token');
            break;
          case 'timeout-or-duplicate':
            console.log('    ✅ Expected error for dummy token');
            break;
          default:
            console.log(`    ❓ Unknown error: ${code}`);
        }
      });
    }
    
  } catch (error) {
    console.log(`  ❌ Network error: ${error.message}`);
  }
}

async function testBackendHealth() {
  console.log('\n🌐 Testing backend health:');
  
  try {
    const response = await fetch(`${config.stagingUrl}/health`);
    const result = await response.json();
    console.log(`  Staging: ${response.status} - ${result.ok ? '✅' : '❌'}`);
    
    if (result.ok) {
      console.log(`    Environment: ${result.environment}`);
      console.log(`    CORS Origins: ${result.corsOrigins?.length || 0} configured`);
    }
    
  } catch (error) {
    console.log(`  ❌ Staging error: ${error.message}`);
  }
  
  try {
    const response = await fetch(`${config.productionUrl}/health`);
    const result = await response.json();
    console.log(`  Production: ${response.status} - ${result.ok ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log(`  ❌ Production error: ${error.message}`);
  }
}

async function main() {
  await testBackendHealth();
  await testTurnstileVerificationDirectly();
  await testTurnstileWithFreshToken();
  
  console.log('\n💡 Next Steps:');
  console.log('1. Get a fresh token from the frontend');
  console.log('2. Test with that token using this script');
  console.log('3. Check if the issue is token reuse or configuration');
  console.log('');
  console.log('To test with a fresh token, modify this script and add:');
  console.log('const freshToken = "YOUR_FRESH_TOKEN_HERE";');
  console.log('Then test with that token instead of test_token_123');
}

main().catch(console.error);
