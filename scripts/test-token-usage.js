const { createClient } = require('@supabase/supabase-js');
const config = require('../dist/config').config;

async function testTokenUsage() {
  try {
    console.log('🔍 Testing token usage patterns...\n');

    // Test 1: Test the same token multiple times to see if it gets marked as used
    const testToken = '0.LrGSkmxXKUfAvUVv4Wb8RNYmjiTQWVR-fUbiHPMtV_kzadUHR3-qkmpbKfxIrZ7lMlgr8RebitBUSghAtRKVkBGOBngGCnaE8Gwo7nL5i2IT7-5axh5sAHGiQlpb-4lV-vPmt5Y6VdqMJtYaH9an7V8CH7YtlcO00311VSPfg3tjAkfjauWeeBlv-iVwx3y1t7xuyNh08smFHDsDx1E_--lmLyKo2J0TWhMwStABcRWr0iFca0ETNXX4b4qCPCXpAeHPb0oJjbzslXsidxBX_yOt_Jj1yENalOEjP4_dD6lzR_8g-C_6nW3HMNmgZ-4F7qqPAFV48t5dePqPgvLAl_2_7pkjyrcSv2pSDGV8SvdMY-ooKW3GeARg0yMA_qiKsmVtzP8EBPucJ2n4uJfMg_bwZ_IKPenXbFYQWvQFR-PRPilCSln5tt542Zu29ITPv5WD3Nw3e46lsP9pOXhLbZY-CDcsySvrymsK6zDLp9qayrIlqpllI_xKXGPtgF7AkSSYmvHNGfo0l4J6dZdTWJj2rvza6b7MdtMOVBKi7VWprCnidv50YqaSyQe-58V6TY5ZKDHcZ2Ksp2nkdA_G-2uXjQr7uoJM2iuOp0jFFbzj6f3pjRcDIwCrl4EQU7pFWnmql6PVxUdbw9WpdEDO8sN7aWsPX6fzM5hPXsgO1jITDFZFw7BbpHAGrVmcEXBP1WSZIuEm-szJODXRjNEubVKoD2eGtCmxorFuNfC3OrHPxKT5Cu2z8O7vzhAYq6E4ItMokMPDglRdtoIzLzfSa5qIaVKw1_lv8jmidS9SXiHw8FK39GCqYBjNCUm15PYje4OhmWcqqpACxhJTrfY9wgSu4J3aN4cMmLr8gpVSx3OhB-hTrLLw1qIp0HhgU5zfwYacW6qeKOgFhICBpZfJAEYT0x0CQvmpDnZkLKbuD7N_q-1pOjUC8gcWnfSrrXOH-9410N0JLvpDiYLReHPX8i4cXYzl4Yu4g6RVNVQvl-s.K-rT2kGfkSFrdnyFAKXBcw.3e1dc73d958e2d0d9d1d75e23f37852cbabefbdad6879b50be25919cba5545a1';

    console.log('🧪 Test 1: First verification with Cloudflare API...');
    try {
      const response1 = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: config.security.turnstile.secretKey,
          response: testToken,
          remoteip: '127.0.0.1',
        }),
      });

      const result1 = await response1.json();
      console.log('   First verification:', result1.success ? '✅ Success' : '❌ Failed');
      console.log('   Error codes:', result1['error-codes']);
    } catch (error) {
      console.log('   ❌ First verification error:', error.message);
    }

    console.log('\n🧪 Test 2: Second verification with same token...');
    try {
      const response2 = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: config.security.turnstile.secretKey,
          response: testToken,
          remoteip: '127.0.0.1',
        }),
      });

      const result2 = await response2.json();
      console.log('   Second verification:', result2.success ? '✅ Success' : '❌ Failed');
      console.log('   Error codes:', result2['error-codes']);
    } catch (error) {
      console.log('   ❌ Second verification error:', error.message);
    }

    console.log('\n🧪 Test 3: Test with backend service...');
    try {
      const { SecurityService } = require('../dist/services/security');
      const securityService = new SecurityService();
      
      const isValid = await securityService.verifyTurnstileToken(testToken, '127.0.0.1');
      console.log('   Backend service result:', isValid ? '✅ Valid' : '❌ Invalid');
    } catch (error) {
      console.log('   ❌ Backend service error:', error.message);
    }

    console.log('\n🧪 Test 4: Test with a completely different IP...');
    try {
      const response3 = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: config.security.turnstile.secretKey,
          response: testToken,
          remoteip: '192.168.1.100', // Different IP
        }),
      });

      const result3 = await response3.json();
      console.log('   Different IP verification:', result3.success ? '✅ Success' : '❌ Failed');
      console.log('   Error codes:', result3['error-codes']);
    } catch (error) {
      console.log('   ❌ Different IP verification error:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testTokenUsage();
