const https = require('https');

console.log('🔍 Checking Turnstile Domain Restrictions...\n');

// Test Turnstile verification with different domains
async function testTurnstileWithDomain(domain, token) {
  try {
    console.log(`🧪 Testing Turnstile with domain: ${domain}`);
    
    const testData = JSON.stringify({
      first_name: 'Test',
      last_name: 'User',
      email: `test-${Date.now()}@example.com`,
      country: 'US',
      city: 'Test City',
      state: 'CA',
      consent_news: true,
      turnstileToken: token
    });

    const options = {
      hostname: 'staging.api.petition.motherofpeace.com',
      port: 443,
      path: '/api/petitions/petition-for-the-mother-of-peace/sign',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData),
        'Origin': domain, // Test with different origins
        'Referer': domain
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log(`📝 Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log(`✅ Success with domain: ${domain}`);
          } else if (response.error === 'Bot check failed') {
            console.log(`❌ Bot check failed with domain: ${domain}`);
          } else {
            console.log(`❓ Unexpected response with domain ${domain}:`, response);
          }
        } catch (e) {
          console.log(`❌ Invalid JSON response with domain ${domain}`);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request failed for domain ${domain}:`, error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error(`❌ Error testing domain ${domain}:`, error.message);
  }
}

// Test with the real Turnstile token from the frontend
async function testWithRealToken() {
  try {
    console.log('🧪 Testing with real Turnstile token from frontend...');
    
    // This is the token from the frontend team's message
    const realToken = '0.h_zRDYDSZm2uOqNCO-MMescnx6lgS_NSlTrZeWkozR51B66ZfS55649IaspFcjQ4NeAfr102jkjJp_-IP06oFYbUTuxGlpYFSuNss9if-eIHNx6s6n4FvKLlGFxeXb2ei3RibiSObkd63MKlXButEamD5yOee3iO1TCMQ3fniF2uWvj6izwUWUFJJLxvFkB1txlwQEnZU6pqQiY1WcmquHVQJ6Xcn6Rhsy6FlSsXw5boSDRd0GRtmL_Wo0vnI1DpLPiqRPkqy48fPgmaQAk21h7WbQCP4P5DyFC0hMzMxrgeusbxLhrC7iM69Xfj5HWPoyLqImwqeTgz-6LQamQRc3LD-Mq3LHpOUxIjn9f9odkCtSpDQ3q6Azc9YLanj6Y8-VFb7NXEODV8BQqHzuMkhUidS8Q8i3e_7TiPDKJ06DEwT7nl_hM08SMP2SwNNczBL50cJrsYYh7V4ALH8iD8s3xT0iZiyfMkmFjtKiLxuVuLkzO6QKKeDNIEERXwTvaTPlfLJq18uC_kL-3ngPcN9T5fFQk6w1WH0Vr6Qg4HBLwYFs6dD-FVQOWG5ZDgF73R61dLZgK2Cko4tEwtR5KW6RYeKO_Ria5-8vbglp8al_7UFndwGRcYHA2G80_SfMC_TEVb4Ap1n71nMpob8ah3txvlAuuL6U-fcIVgck3KURYdkb0fx014iCteVum-sdltBCvlki-kysPUkD_iLfMehCnGQ7oRKrCtAekOAE8Zaq7tTFnOKnVTjTkPK2O4D68dfxisg9GyuEmWJE3khANzF32yN0BwwoiXxGdngPt1vOkYMUNTCNOn8Nra0Pry-se6C5im6Bv9PIqS2OKqsBwZSTVJzwJmNQIxcQ88W_t56-kioK_ssQE_V95gBCsCVG7ZPeKAvVfGQkezYxz2vpvqIefPZyLhBVFNPTM16y4VtiBCnUxUehQG-HqkihYpwWebe_NblNXrPbSE3RUXym9d2w.NBdEv9ercSex4PsSZFS3tw.f1ac48bc314f929c1459a8ef827d1766e20cb49f08b5f9a3fa7fe3c25471f76c';
    
    // Test with different domains
    const domains = [
      'https://staging.petition.motherofpeace.com',
      'https://petition.motherofpeace.com',
      'https://hsa-petitions.vercel.app',
      'https://localhost:3000'
    ];
    
    for (const domain of domains) {
      await testTurnstileWithDomain(domain, realToken);
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

  } catch (error) {
    console.error('❌ Error testing with real token:', error.message);
  }
}

// Test CORS configuration
async function testCORSConfiguration() {
  try {
    console.log('\n🧪 Testing CORS configuration...');
    
    const options = {
      hostname: 'staging.api.petition.motherofpeace.com',
      port: 443,
      path: '/api/petitions/petition-for-the-mother-of-peace/stats',
      method: 'GET',
      headers: {
        'Origin': 'https://staging.petition.motherofpeace.com',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📊 CORS Response Status: ${res.statusCode}`);
      console.log(`📄 CORS Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📝 CORS Response Body:`, data);
        
        // Check CORS headers
        const corsOrigin = res.headers['access-control-allow-origin'];
        const corsCredentials = res.headers['access-control-allow-credentials'];
        
        console.log(`🔍 CORS Origin: ${corsOrigin}`);
        console.log(`🔍 CORS Credentials: ${corsCredentials}`);
        
        if (corsOrigin === 'https://staging.petition.motherofpeace.com' || corsOrigin === '*') {
          console.log('✅ CORS configured for staging.petition.motherofpeace.com');
        } else {
          console.log('❌ CORS not configured for staging.petition.motherofpeace.com');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ CORS test failed:', error.message);
    });

    req.end();

  } catch (error) {
    console.error('❌ Error testing CORS:', error.message);
  }
}

// Run all tests
async function main() {
  console.log('🚀 Starting Turnstile Domain Restriction Check\n');
  
  await testCORSConfiguration();
  
  // Wait before testing with real token
  setTimeout(() => {
    testWithRealToken();
  }, 2000);
}

main().catch(console.error);
