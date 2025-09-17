const { createClient } = require('@supabase/supabase-js');
const config = require('../dist/config').config;

async function testTurnstileVerification() {
  try {
    console.log('🔍 Testing Turnstile verification with real token...\n');

    // Test 1: Check environment variables
    console.log('📋 Environment Check:');
    console.log('   TURNSTILE_SECRET_KEY:', process.env.TURNSTILE_SECRET_KEY ? 'Set' : 'Missing');
    console.log('   Config secret key:', config.security.turnstile.secretKey ? 'Set' : 'Missing');
    console.log('   Config site key:', config.security.turnstile.siteKey ? 'Set' : 'Missing');

    // Test 2: Test Turnstile verification directly
    console.log('\n🧪 Testing Turnstile verification directly...');
    
    const realToken = '0.74vb0EoKiPu8bOxVHNbcVPGUvKYFxCayJcrVGR-tUI7nlzgbk9THWxJV_lSzXfkynVMdM02Cc_k3SFIIWW4Hv6vVYyrijwuf_Gkn1NJzl_SvVFrvCkwunP0Pv4xkjTAMRvqFHIBqChN4AOnselVaHRxymiOy9AX1UWW8wngijCQERAPjNgTswI2uQhNzE3DK0xyKB0s85ccYxAv4ZmeC5gHSpTG_r-5f9J3JjqIkaYqDnwsodt2OeEu_tFb_9kHgORugjD_xmb8SWS6Fer4N_YtDej0kvD-_mPKZzyPIVRNrzN1R-2yYi1I93IImu1a4FH_hUZEip__8Aq5u9-87MxNkiDnUcyatQiySv7KDH7FR0iTm8HHYOSbHfJ8GPhsObH1IfBA1I6D4A6kTyprCkUhlLFmo95BPHIlQDyb3p4qrrKWyU16ybY9Ss5UPGpwKC5wN52lN2tT0UsWILBdZ8udsm8L4rTKwgVV8_HPg5phoFCNWcu23U8xwUGdoo-EsUE8oidvHHuaZLCRuYA8gM-70WfAohYzjzUm0XhF5cME5k_NHZQQliD2Pj8N2LkAyNE6jxaROx-JeQTzx08r5fYrCyYaDjwNow2kzG8zjk4uTJAqT-TkXORPFUDtORehkHtGmywMVQLOcORyM4OFE9velW34SuW3Bi_wrp371cTkLmVSZ4S8mE3Ix0z2LZzRVuhqc6jyQD8COHEoCW3xRa3QRi81bp7OryDbKciwI78kZ5C-ABlKkXVXDftLqQGQRxXNoq9-0Wl37avrygtGdEI9waAXmalIc4MYtF30N6t41o1QoAo3tNn4K-RVrSE8wxqx_k3-mBleWqM3QU2JCE5PzSNu2IQKGTL-rjV3-vOSHS0HVgrQ-AEjsSVXefchnR4JMhvISKz2RZeGywG45u4A6RP-xE4R8WLqhBusezYygFk3ofO_WMm_oNkFw276SKTrBf9uKST_IK0k1WctHNXtGjmMwVbjuFBWJypdzcXs.N4BNbvKnacXWb_C40AjV5g.81e9caea9d0293595cf0925c6ea565646c8ba792c9faaf58d842295c6f011592';
    
    // Import the security service
    const { SecurityService } = require('../dist/services/security');
    const securityService = new SecurityService();
    
    console.log('   Testing with real token from frontend...');
    console.log('   Token length:', realToken.length);
    console.log('   Token preview:', realToken.substring(0, 50) + '...');
    
    const isValid = await securityService.verifyTurnstileToken(realToken, '127.0.0.1');
    console.log('   Result:', isValid ? '✅ Valid' : '❌ Invalid');

    // Test 3: Test with Cloudflare API directly
    console.log('\n🌐 Testing Cloudflare API directly...');
    
    try {
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: config.security.turnstile.secretKey,
          response: realToken,
          remoteip: '127.0.0.1',
        }),
      });

      const result = await response.json();
      console.log('   Cloudflare API Response:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('   ✅ Cloudflare verification successful');
      } else {
        console.log('   ❌ Cloudflare verification failed');
        console.log('   Error codes:', result['error-codes']);
      }
    } catch (error) {
      console.log('   ❌ Cloudflare API error:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testTurnstileVerification();
