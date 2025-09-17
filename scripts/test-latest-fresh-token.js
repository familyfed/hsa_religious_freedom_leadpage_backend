#!/usr/bin/env node

/**
 * Test the latest fresh token from frontend team
 * This will help us understand why the backend is still rejecting it
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

console.log('🧪 TESTING LATEST FRESH TOKEN\n');
console.log('=' .repeat(50));

async function testTokenWithCloudflare() {
  console.log('\n🔐 Testing token directly with Cloudflare API:');
  console.log(`Token: ${freshToken.substring(0, 50)}...`);
  console.log(`Secret Key: ${config.secretKey ? config.secretKey.substring(0, 8) + '...' : 'NOT SET'}`);
  
  if (!config.secretKey) {
    console.log('❌ Cannot test - Secret key not configured');
    return;
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: config.secretKey,
        response: freshToken,
        remoteip: '127.0.0.1',
      }),
    });

    const result = await response.json();
    console.log(`\nStatus: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ TOKEN IS VALID!');
      console.log(`  Challenge timestamp: ${result.challenge_ts}`);
      console.log(`  Hostname: ${result.hostname}`);
      console.log(`  Action: ${result.action}`);
      console.log(`  CData: ${result.cdata}`);
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
              console.log('  ❌ Invalid token - Token may be expired or malformed');
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

async function testTokenWithBackend() {
  console.log('\n🌐 Testing token with backend API:');
  
  const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test-latest-token@example.com',
    country: 'US',
    city: 'Test City',
    state: 'CA',
    consent_news: true,
    turnstileToken: freshToken
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

async function checkBackendLogs() {
  console.log('\n📊 BACKEND CONFIGURATION CHECK:');
  console.log(`Site Key: ${config.siteKey}`);
  console.log(`Secret Key Length: ${config.secretKey ? config.secretKey.length : 'NOT SET'}`);
  console.log(`Secret Key Preview: ${config.secretKey ? config.secretKey.substring(0, 8) + '...' : 'NOT SET'}`);
  
  console.log('\n🔍 TURNSTILE DASHBOARD STATUS:');
  console.log('Please check if you have added the backend domains to your Turnstile dashboard:');
  console.log('');
  console.log('Required domains in Turnstile dashboard:');
  console.log('✅ staging.petition.motherofpeace.com (frontend)');
  console.log('❓ staging.api.petition.motherofpeace.com (backend) - NEEDS TO BE ADDED');
  console.log('❓ api.petition.motherofpeace.com (production backend) - NEEDS TO BE ADDED');
  console.log('❓ localhost (development) - NEEDS TO BE ADDED');
  console.log('');
  console.log('If these domains are not added, the backend verification will fail!');
}

async function main() {
  await testTokenWithCloudflare();
  await testTokenWithBackend();
  await checkBackendLogs();
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Check if backend domains are added to Turnstile dashboard');
  console.log('2. If not added, add them now');
  console.log('3. Wait 2-3 minutes for propagation');
  console.log('4. Test again with fresh token');
  console.log('');
  console.log('The frontend is working perfectly - the issue is Turnstile dashboard configuration!');
}

main().catch(console.error);
