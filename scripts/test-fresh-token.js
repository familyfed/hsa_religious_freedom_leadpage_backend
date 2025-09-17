const { createClient } = require('@supabase/supabase-js');
const config = require('../dist/config').config;

async function testFreshToken() {
  try {
    console.log('🔍 Testing fresh Turnstile token from frontend...\n');

    const freshToken = '0.LrGSkmxXKUfAvUVv4Wb8RNYmjiTQWVR-fUbiHPMtV_kzadUHR3-qkmpbKfxIrZ7lMlgr8RebitBUSghAtRKVkBGOBngGCnaE8Gwo7nL5i2IT7-5axh5sAHGiQlpb-4lV-vPmt5Y6VdqMJtYaH9an7V8CH7YtlcO00311VSPfg3tjAkfjauWeeBlv-iVwx3y1t7xuyNh08smFHDsDx1E_--lmLyKo2J0TWhMwStABcRWr0iFca0ETNXX4b4qCPCXpAeHPb0oJjbzslXsidxBX_yOt_Jj1yENalOEjP4_dD6lzR_8g-C_6nW3HMNmgZ-4F7qqPAFV48t5dePqPgvLAl_2_7pkjyrcSv2pSDGV8SvdMY-ooKW3GeARg0yMA_qiKsmVtzP8EBPucJ2n4uJfMg_bwZ_IKPenXbFYQWvQFR-PRPilCSln5tt542Zu29ITPv5WD3Nw3e46lsP9pOXhLbZY-CDcsySvrymsK6zDLp9qayrIlqpllI_xKXGPtgF7AkSSYmvHNGfo0l4J6dZdTWJj2rvza6b7MdtMOVBKi7VWprCnidv50YqaSyQe-58V6TY5ZKDHcZ2Ksp2nkdA_G-2uXjQr7uoJM2iuOp0jFFbzj6f3pjRcDIwCrl4EQU7pFWnmql6PVxUdbw9WpdEDO8sN7aWsPX6fzM5hPXsgO1jITDFZFw7BbpHAGrVmcEXBP1WSZIuEm-szJODXRjNEubVKoD2eGtCmxorFuNfC3OrHPxKT5Cu2z8O7vzhAYq6E4ItMokMPDglRdtoIzLzfSa5qIaVKw1_lv8jmidS9SXiHw8FK39GCqYBjNCUm15PYje4OhmWcqqpACxhJTrfY9wgSu4J3aN4cMmLr8gpVSx3OhB-hTrLLw1qIp0HhgU5zfwYacW6qeKOgFhICBpZfJAEYT0x0CQvmpDnZkLKbuD7N_q-1pOjUC8gcWnfSrrXOH-9410N0JLvpDiYLReHPX8i4cXYzl4Yu4g6RVNVQvl-s.K-rT2kGfkSFrdnyFAKXBcw.3e1dc73d958e2d0d9d1d75e23f37852cbabefbdad6879b50be25919cba5545a1';

    // Test 1: Check environment variables
    console.log('📋 Environment Check:');
    console.log('   TURNSTILE_SECRET_KEY:', process.env.TURNSTILE_SECRET_KEY ? 'Set' : 'Missing');
    console.log('   Config secret key:', config.security.turnstile.secretKey ? 'Set' : 'Missing');
    console.log('   Config site key:', config.security.turnstile.siteKey ? 'Set' : 'Missing');
    console.log('   Secret key preview:', config.security.turnstile.secretKey ? config.security.turnstile.secretKey.substring(0, 10) + '...' : 'Missing');

    // Test 2: Test with Cloudflare API directly
    console.log('\n🌐 Testing Cloudflare API directly...');
    
    try {
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: config.security.turnstile.secretKey,
          response: freshToken,
          remoteip: '127.0.0.1',
        }),
      });

      const result = await response.json();
      console.log('   Cloudflare API Response:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('   ✅ Cloudflare verification successful');
        console.log('   Hostname:', result.hostname);
        console.log('   Challenge timestamp:', result['challenge_ts']);
      } else {
        console.log('   ❌ Cloudflare verification failed');
        console.log('   Error codes:', result['error-codes']);
        console.log('   Messages:', result.messages);
      }
    } catch (error) {
      console.log('   ❌ Cloudflare API error:', error.message);
    }

    // Test 3: Test with our backend service
    console.log('\n🔧 Testing backend service...');
    
    try {
      const { SecurityService } = require('../dist/services/security');
      const securityService = new SecurityService();
      
      const isValid = await securityService.verifyTurnstileToken(freshToken, '127.0.0.1');
      console.log('   Backend service result:', isValid ? '✅ Valid' : '❌ Invalid');
    } catch (error) {
      console.log('   ❌ Backend service error:', error.message);
    }

    // Test 4: Test with staging API
    console.log('\n🌐 Testing staging API...');
    
    try {
      const response = await fetch('https://staging.api.petition.motherofpeace.com/api/petitions/petition-for-the-mother-of-peace/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: 'Test',
          last_name: 'User',
          email: 'test13@example.com',
          country: 'US',
          city: 'Test City',
          consent_news: false,
          turnstileToken: freshToken
        })
      });

      const data = await response.json();
      console.log('   Staging API Response:', JSON.stringify(data, null, 2));
      
      if (data.ok) {
        console.log('   ✅ Staging API successful');
      } else {
        console.log('   ❌ Staging API failed:', data.error);
      }
    } catch (error) {
      console.log('   ❌ Staging API error:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFreshToken();
