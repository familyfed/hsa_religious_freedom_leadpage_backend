const https = require('https');

console.log('🔍 Testing Turnstile Direct Verification with Cloudflare...\n');

// Test Turnstile verification directly with Cloudflare
async function testTurnstileDirectVerification() {
  try {
    console.log('🧪 Testing Turnstile verification directly with Cloudflare...');
    
    // This is the token from the frontend team's message
    const realToken = '0.h_zRDYDSZm2uOqNCO-MMescnx6lgS_NSlTrZeWkozR51B66ZfS55649IaspFcjQ4NeAfr102jkjJp_-IP06oFYbUTuxGlpYFSuNss9if-eIHNx6s6n4FvKLlGFxeXb2ei3RibiSObkd63MKlXButEamD5yOee3iO1TCMQ3fniF2uWvj6izwUWUFJJLxvFkB1txlwQEnZU6pqQiY1WcmquHVQJ6Xcn6Rhsy6FlSsXw5boSDRd0GRtmL_Wo0vnI1DpLPiqRPkqy48fPgmaQAk21h7WbQCP4P5DyFC0hMzMxrgeusbxLhrC7iM69Xfj5HWPoyLqImwqeTgz-6LQamQRc3LD-Mq3LHpOUxIjn9f9odkCtSpDQ3q6Azc9YLanj6Y8-VFb7NXEODV8BQqHzuMkhUidS8Q8i3e_7TiPDKJ06DEwT7nl_hM08SMP2SwNNczBL50cJrsYYh7V4ALH8iD8s3xT0iZiyfMkmFjtKiLxuVuLkzO6QKKeDNIEERXwTvaTPlfLJq18uC_kL-3ngPcN9T5fFQk6w1WH0Vr6Qg4HBLwYFs6dD-FVQOWG5ZDgF73R61dLZgK2Cko4tEwtR5KW6RYeKO_Ria5-8vbglp8al_7UFndwGRcYHA2G80_SfMC_TEVb4Ap1n71nMpob8ah3txvlAuuL6U-fcIVgck3KURYdkb0fx014iCteVum-sdltBCvlki-kysPUkD_iLfMehCnGQ7oRKrCtAekOAE8Zaq7tTFnOKnVTjTkPK2O4D68dfxisg9GyuEmWJE3khANzF32yN0BwwoiXxGdngPt1vOkYMUNTCNOn8Nra0Pry-se6C5im6Bv9PIqS2OKqsBwZSTVJzwJmNQIxcQ88W_t56-kioK_ssQE_V95gBCsCVG7ZPeKAvVfGQkezYxz2vpvqIefPZyLhBVFNPTM16y4VtiBCnUxUehQG-HqkihYpwWebe_NblNXrPbSE3RUXym9d2w.NBdEv9ercSex4PsSZFS3tw.f1ac48bc314f929c1459a8ef827d1766e20cb49f08b5f9a3fa7fe3c25471f76c';
    
    // Test with different site keys to see which one works
    const siteKeys = [
      '0x4AAAAAAB0JKe-utcVa1kuG', // Backend site key
      '0x4AAAAAAABkMYinukE8nzY'  // Frontend site key
    ];
    
    for (const siteKey of siteKeys) {
      console.log(`\n🧪 Testing with site key: ${siteKey}`);
      
      const postData = JSON.stringify({
        secret: 'YOUR_SECRET_KEY', // This would be the actual secret key
        response: realToken,
        remoteip: '127.0.0.1'
      });
      
      const options = {
        hostname: 'challenges.cloudflare.com',
        port: 443,
        path: '/turnstile/v0/siteverify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`📊 Cloudflare Response Status: ${res.statusCode}`);
          console.log(`📝 Cloudflare Response Body:`, data);
          
          try {
            const response = JSON.parse(data);
            if (response.success) {
              console.log(`✅ Token verified successfully with site key: ${siteKey}`);
            } else {
              console.log(`❌ Token verification failed with site key: ${siteKey}`);
              console.log(`❌ Error codes:`, response['error-codes']);
            }
          } catch (e) {
            console.log(`❌ Invalid JSON response for site key ${siteKey}`);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error(`❌ Request failed for site key ${siteKey}:`, error.message);
      });
      
      req.write(postData);
      req.end();
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

  } catch (error) {
    console.error('❌ Error testing Turnstile direct verification:', error.message);
  }
}

// Test with a fresh token to see if it's a token reuse issue
async function testWithFreshToken() {
  try {
    console.log('\n🧪 Testing with a fresh token (simulated)...');
    
    // Simulate what would happen with a fresh token
    const freshToken = 'fresh_token_simulation';
    
    const testData = JSON.stringify({
      first_name: 'FreshTest',
      last_name: 'User',
      email: `freshtest-${Date.now()}@example.com`,
      country: 'US',
      city: 'Test City',
      state: 'CA',
      consent_news: true,
      turnstileToken: freshToken
    });

    const options = {
      hostname: 'staging.api.petition.motherofpeace.com',
      port: 443,
      path: '/api/petitions/petition-for-the-mother-of-peace/sign',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData),
        'Origin': 'https://staging.petition.motherofpeace.com'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Fresh Token Response Status: ${res.statusCode}`);
        console.log(`📝 Fresh Token Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.error === 'Bot check failed') {
            console.log('❌ Fresh token also failed - this suggests a configuration issue');
          } else {
            console.log('✅ Fresh token worked differently:', response);
          }
        } catch (e) {
          console.log('❌ Invalid JSON response for fresh token');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Fresh token request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing fresh token:', error.message);
  }
}

// Run all tests
async function main() {
  console.log('🚀 Starting Turnstile Direct Verification Tests\n');
  
  await testTurnstileDirectVerification();
  
  // Wait before testing with fresh token
  setTimeout(() => {
    testWithFreshToken();
  }, 5000);
}

main().catch(console.error);
