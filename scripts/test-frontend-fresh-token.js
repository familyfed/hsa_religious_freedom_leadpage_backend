#!/usr/bin/env node

/**
 * Test the fresh token provided by the frontend team
 * This will help us understand why the backend is rejecting it
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

// Fresh token from frontend team logs
const freshToken = '0.3SF2J4Lp6FPkd5eh82Mb7uHXiRfiegCBmZqZDuE0BsZViywil8UsA4pqbegh5DDxXSV3medZug4C5ToATCoHVP9bX9hlSw9W1zRp4tj_WkRu846sc28CsSE5-rQE559ga0tQlycYszoyzaeFT_Pgr4jgiDDQWVGBt_KaE9Ep_fjveQv1zA5TqeY6Zpu8YFrVKuGD1Xp7zJtlCB4J8sGOvQtu-HUH4D88dnhHhECc2jYwLttecmA7OWJcdsOV9C6vvv2AgtPT4P514Upoc9e_gSLzV_O5t7bEVzyud9EwrmGpwsDjs-ut4YO6EVAit9v4l3xs2FM-wYc3hGm_kcQVqkEu-x14p768zSjT_kpujGXlSauWn0u2SGg4MQkAWA9BZtVfh_TW_-qpyDEQyEsh5WRxTthz1LljDf4SVtegD55nRzG3E8oDiq31vmwkXpHu6YuxZ8aArdIzR80aKKf4gq6odGn10w8wyvEoLCykQ1KK9Wor6jcafwWAXzywCc_mcouDHVsgxz1m_cfeuOfQLdQxiAkn49CV1lDrTbWSbBfMcHzAUaAqahtdROhcM4w6v0bH_GXu5gKQasaFrcnMP031d5N-3ZwYEPgWwy6GrYfS_D66e2EdRYRfgGWPro4Lx-r5nQkoPGVwDUoty2aAASkcSkgEmtjlBGpMFF6BeEuUCS7SYkZOgRJLj1FEFi74FUxpsxKfwoTe2_aaqjyRTu9G4i1GoizvwTYiOOdtmzmNhFwvzBezbxrFFIzPNDn0395y0uieEJswgD6Nd553T_qDRwsXsflPMEodIoJNWavN1bhpTXcwMcxYvhEw9W0V7O3lLyHE-nqnhWC-q3NiHyydKHgu5BRoTkP03mELAA8vQZgY-uimTaiRQj2SPoneM01gGx7DUCRXPTUe7SH4VkuLlccGrtfdibz_U_WT0XqJqoAJYeb2LmEOUTrTnTt3yZX95w_PcoX9YH4UKIT7tYFjA4w9KELM9G8R5oLokXk.jFDHENfkx5heQZoZF5Szvg.5da9712b1af87704f31fcfb6d3fb31561fc5a8a683469995896537960a47c6cd';

console.log('🧪 TESTING FRONTEND FRESH TOKEN\n');
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
    email: 'test-fresh-token@example.com',
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

async function checkTurnstileConfiguration() {
  console.log('\n📊 TURNSTILE CONFIGURATION CHECK:');
  console.log(`Site Key: ${config.siteKey}`);
  console.log(`Secret Key Length: ${config.secretKey ? config.secretKey.length : 'NOT SET'}`);
  console.log(`Secret Key Preview: ${config.secretKey ? config.secretKey.substring(0, 8) + '...' : 'NOT SET'}`);
  
  console.log('\n🔍 DOMAIN CONFIGURATION CHECK:');
  console.log('Please verify in Cloudflare Turnstile Dashboard:');
  console.log('');
  console.log('✅ Site Key: 0x4AAAAAAABkMYinukE8nzY');
  console.log('✅ Secret Key: Should match environment variable');
  console.log('✅ Domains should include:');
  console.log('   - petition.motherofpeace.com (production)');
  console.log('   - staging.petition.motherofpeace.com (staging frontend)');
  console.log('   - staging.api.petition.motherofpeace.com (staging backend)');
  console.log('   - api.petition.motherofpeace.com (production backend)');
  console.log('   - localhost (for development)');
  console.log('');
  console.log('⚠️  IMPORTANT: The backend domain needs to be added!');
  console.log('   Add: staging.api.petition.motherofpeace.com');
  console.log('   Add: api.petition.motherofpeace.com');
}

async function main() {
  await testTokenWithCloudflare();
  await testTokenWithBackend();
  await checkTurnstileConfiguration();
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Check if staging.api.petition.motherofpeace.com is in Turnstile dashboard');
  console.log('2. Add the backend domain to Turnstile dashboard if missing');
  console.log('3. Verify secret key matches between dashboard and environment');
  console.log('4. Test again with fresh token');
}

main().catch(console.error);
