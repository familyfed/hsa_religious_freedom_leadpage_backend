#!/usr/bin/env node

/**
 * Test with a fresh token from frontend to debug the issue
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

console.log('🧪 TESTING WITH FRESH TOKEN FROM FRONTEND\n');
console.log('=' .repeat(50));

// Fresh token from frontend team logs (latest one)
const freshToken = '0.FavJe2B91hPoHpOIqhUFP5hkPDKkrYLm-A_a4ULUeeWDjOYDvQ4Vyj-8MO6uH7HXl1yDppSHbRXV96JLu3XKZjJD1w_dO6NTbyeuUeX2s1KzCr1ItENyVesb5XOIIfx7_IhEebVdziNgVXsg6OLUE2pkdxF8ZvMcckz4NZ8jOW6DbDRyNQeETmhOdO4P-U705guFMVCwOZcBOJlcq9LzPyZvPtwcM2swGIw8v3aLtUObfCWPbGR6EaPE_uDQ9NNJ7BY4DSgFU5bIR4UqcB-rKvh4KBaDCFUv0n4lnYAUCAfzfJdWwsqHW1vUjiLxvxHoHWFOX_InBeM1N0f3a9qCTy0f_mYa85D6iKrioBhoY5vqQCGM6jDBubjd2CQCKUZ462DYK01R9-ZKN3T_shACDJjEO8EL_3NnNZB4cenYVwCOasiiWLEnYsMLvrP8hHUmRnnRcYang9iBh2UhAU6wxSpJH31Yr1ynazPezmk2m_iL-FbYM7S4Vm2mgKcv5mZNl2pODlFSbAo6KxBlQDa7Z86h8cM73C2ZPgdzJBnZfL05fbUu5KI4stT6Jv1f8rCfAUFPHfQFt7torVw4mWc3pzX7qxjrxzDp2cx1df1sT9YCoRUrqqGcEM34M8os_ypZYBHrTTpkoivYiVsUaCkMTE-QrF4T_Q4ysFEzPIG5aNg2VjGXnQL_U9BFF9OHOG4CHjqsqpDRUXH7SG5GW5hZAH39NHKnmvDkNGEc2Ja0K8ZLlKeMcJvL6tVfSXOwUNtapzzvIUP9w11xImrQO4rgmvywn-n9aYPBvoBSvySARIqu0-2Kmpk_3DzLXaAruM28KJEcW2nY84O-NEmpSmZGnkt10-YRFeeOIJ5Y9WQ1brE3U5UCPPuYgoOJ3wRPm8BpeI4TIpaoHE265OG-FKlR4_BGOeMPvyqtNrcvblrQaTms7ITlmTNIHndOtEvxUznb2OLgcImw0C8saZl2slTABzOlJ5rpp_iCUOLU67HZ7ZU.5GDcWhUc8f9mVKbbKZyFeg.504812d097d586015e5abadbdf24ecf962bc0aac2e4337a7e17606360bddf32e';

async function testFreshTokenWithCloudflare() {
  console.log('\n🔐 Testing fresh token with Cloudflare API:');
  console.log(`Token: ${freshToken.substring(0, 50)}...`);
  
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
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ FRESH TOKEN IS VALID WITH CLOUDFLARE!');
      console.log(`  Hostname: ${result.hostname}`);
      console.log(`  Challenge: ${result.challenge_ts}`);
    } else {
      console.log('\n❌ FRESH TOKEN IS INVALID WITH CLOUDFLARE');
      if (result['error-codes']) {
        console.log('Error codes:', result['error-codes'].join(', '));
        
        // Analyze error codes
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
    console.log(`❌ Cloudflare API error: ${error.message}`);
  }
}

async function testFreshTokenWithBackend() {
  console.log('\n🌐 Testing fresh token with backend API:');
  
  const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test-fresh-token-debug@example.com',
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
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.ok) {
      console.log('\n✅ BACKEND ACCEPTED THE FRESH TOKEN!');
    } else {
      console.log('\n❌ BACKEND REJECTED THE FRESH TOKEN');
      console.log(`Error: ${result.error}`);
    }
    
  } catch (error) {
    console.log(`❌ Backend API error: ${error.message}`);
  }
}

async function checkSiteKeyMismatch() {
  console.log('\n🔍 CHECKING SITE KEY MISMATCH:');
  console.log(`Backend Site Key: ${config.siteKey}`);
  console.log(`Expected Site Key: 0x4AAAAAAABkMYinukE8nzY`);
  
  if (config.siteKey === '0x4AAAAAAABkMYinukE8nzY') {
    console.log('✅ Site keys match');
  } else {
    console.log('❌ Site keys do not match!');
    console.log('This could be the issue - frontend and backend using different site keys');
  }
}

async function main() {
  await checkSiteKeyMismatch();
  await testFreshTokenWithCloudflare();
  await testFreshTokenWithBackend();
  
  console.log('\n💡 ANALYSIS:');
  console.log('1. Check if site keys match between frontend and backend');
  console.log('2. Check if secret key is correct');
  console.log('3. Check if domains are configured correctly in Turnstile dashboard');
  console.log('4. Check backend logs for detailed error information');
  console.log('');
  console.log('The frontend is working perfectly - let\'s find the backend issue!');
}

main().catch(console.error);
