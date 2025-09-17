#!/usr/bin/env node

/**
 * Debug Turnstile domain configuration issue
 * Test with different remote IP scenarios to understand the problem
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

// Latest fresh token from frontend team logs
const freshToken = '0.FavJe2B91hPoHpOIqhUFP5hkPDKkrYLm-A_a4ULUeeWDjOYDvQ4Vyj-8MO6uH7HXl1yDppSHbRXV96JLu3XKZjJD1w_dO6NTbyeuUeX2s1KzCr1ItENyVesb5XOIIfx7_IhEebVdziNgVXsg6OLUE2pkdxF8ZvMcckz4NZ8jOW6DbDRyNQeETmhOdO4P-U705guFMVCwOZcBOJlcq9LzPyZvPtwcM2swGIw8v3aLtUObfCWPbGR6EaPE_uDQ9NNJ7BY4DSgFU5bIR4UqcB-rKvh4KBaDCFUv0n4lnYAUCAfzfJdWwsqHW1vUjiLxvxHoHWFOX_InBeM1N0f3a9qCTy0f_mYa85D6iKrioBhoY5vqQCGM6jDBubjd2CQCKUZ462DYK01R9-ZKN3T_shACDJjEO8EL_3NnNZB4cenYVwCOasiiWLEnYsMLvrP8hHUmRnnRcYang9iBh2UhAU6wxSpJH31Yr1ynazPezmk2m_iL-FbYM7S4Vm2mgKcv5mZNl2pODlFSbAo6KxBlQDa7Z86h8cM73C2ZPgdzJBnZfL05fbUu5KI4stT6Jv1f8rCfAUFPHfQFt7torVw4mWc3pzX7qxjrxzDp2cx1df1sT9YCoRUrqqGcEM34M8os_ypZYBHrTTpkoivYiVsUaCkMTE-QrF4T_Q4ysFEzPIG5aNg2VjGXnQL_U9BFF9OHOG4CHjqsqpDRUXH7SG5GW5hZAH39NHKnmvDkNGEc2Ja0K8ZLlKeMcJvL6tVfSXOwUNtapzzvIUP9w11xImrQO4rgmvywn-n9aYPBvoBSvySARIqu0-2Kmpk_3DzLXaAruM28KJEcW2nY84O-NEmpSmZGnkt10-YRFeeOIJ5Y9WQ1brE3U5UCPPuYgoOJ3wRPm8BpeI4TIpaoHE265OG-FKlR4_BGOeMPvyqtNrcvblrQaTms7ITlmTNIHndOtEvxUznb2OLgcImw0C8saZl2slTABzOlJ5rpp_iCUOLU67HZ7ZU.5GDcWhUc8f9mVKbbKZyFeg.504812d097d586015e5abadbdf24ecf962bc0aac2e4337a7e17606360bddf32e';

console.log('🔍 DEBUGGING TURNSTILE DOMAIN ISSUE\n');
console.log('=' .repeat(50));

async function testWithDifferentRemoteIPs() {
  console.log('\n🧪 Testing with different remote IP scenarios:');
  
  const testCases = [
    { name: 'No remote IP', remoteip: undefined },
    { name: 'Localhost IP', remoteip: '127.0.0.1' },
    { name: 'Staging backend domain', remoteip: 'staging.api.petition.motherofpeace.com' },
    { name: 'Staging frontend domain', remoteip: 'staging.petition.motherofpeace.com' },
    { name: 'Production frontend domain', remoteip: 'petition.motherofpeace.com' },
    { name: 'Vercel IP range', remoteip: '76.76.19.0' },
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    
    try {
      const body = new URLSearchParams({
        secret: config.secretKey,
        response: freshToken,
      });
      
      if (testCase.remoteip) {
        body.append('remoteip', testCase.remoteip);
      }

      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
      });

      const result = await response.json();
      console.log(`  Status: ${response.status}`);
      console.log(`  Success: ${result.success}`);
      
      if (result.success) {
        console.log(`  ✅ Hostname: ${result.hostname}`);
        console.log(`  ✅ Challenge: ${result.challenge_ts}`);
      } else {
        console.log(`  ❌ Error codes: ${result['error-codes']?.join(', ') || 'None'}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
}

async function testBackendVerificationProcess() {
  console.log('\n🔍 Testing backend verification process:');
  
  // Test what the backend is actually doing
  const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test-domain-debug@example.com',
    country: 'US',
    city: 'Test City',
    state: 'CA',
    consent_news: true,
    turnstileToken: freshToken
  };

  try {
    console.log('\n📤 Sending request to backend...');
    const response = await fetch(`${config.stagingUrl}/api/petitions/petition-for-the-mother-of-peace/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '127.0.0.1', // Simulate real IP
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log(`  Status: ${response.status}`);
    console.log(`  Response:`, JSON.stringify(result, null, 2));
    
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
  console.log('\n📊 BACKEND CONFIGURATION ANALYSIS:');
  console.log(`Site Key: ${config.siteKey}`);
  console.log(`Secret Key Length: ${config.secretKey ? config.secretKey.length : 'NOT SET'}`);
  console.log(`Secret Key Preview: ${config.secretKey ? config.secretKey.substring(0, 8) + '...' : 'NOT SET'}`);
  
  console.log('\n🔍 POSSIBLE ISSUES:');
  console.log('1. Secret key mismatch between dashboard and environment');
  console.log('2. Domain configuration issue in Turnstile dashboard');
  console.log('3. Backend using wrong remote IP in verification');
  console.log('4. Turnstile site key mismatch');
  console.log('5. Rate limiting or other Cloudflare restrictions');
  
  console.log('\n💡 DEBUGGING STEPS:');
  console.log('1. Verify secret key matches between dashboard and environment');
  console.log('2. Check if domain is configured correctly in dashboard');
  console.log('3. Test with different remote IP scenarios');
  console.log('4. Check backend logs for Turnstile verification attempts');
  console.log('5. Verify site key matches between frontend and backend');
}

async function main() {
  await testWithDifferentRemoteIPs();
  await testBackendVerificationProcess();
  await checkBackendConfiguration();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Check if secret key matches between dashboard and environment');
  console.log('2. Verify domain configuration in Turnstile dashboard');
  console.log('3. Check backend logs for detailed error information');
  console.log('4. Test with different remote IP scenarios');
  console.log('');
  console.log('The frontend is working perfectly - let\'s find the backend issue!');
}

main().catch(console.error);
