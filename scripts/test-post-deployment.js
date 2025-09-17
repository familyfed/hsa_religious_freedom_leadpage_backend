const https = require('https');

console.log('🔍 Testing Post-Deployment Turnstile Configuration...\n');

// Test the deployed backend with Turnstile verification
async function testPostDeployment() {
  try {
    console.log('🧪 Testing deployed backend with Turnstile verification...');
    
    // Test with test token first to make sure basic functionality works
    console.log('\n1️⃣ Testing with test token (should bypass Turnstile)...');
    
    const testData = JSON.stringify({
      first_name: 'PostDeployTest',
      last_name: 'User',
      email: `postdeploy-${Date.now()}@example.com`,
      country: 'US',
      city: 'Test City',
      state: 'CA',
      consent_news: true,
      turnstileToken: 'test_token_123' // This should bypass Turnstile
    });

    const options = {
      hostname: 'staging.api.petition.motherofpeace.com',
      port: 443,
      path: '/api/petitions/petition-for-the-mother-of-peace/sign',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Test Token Response Status: ${res.statusCode}`);
        console.log(`📝 Test Token Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('✅ Test token bypassed Turnstile successfully');
            console.log('✅ Backend basic functionality working');
          } else if (response.error === 'email address already signed this petition') {
            console.log('✅ Test token bypassed Turnstile (email already exists)');
            console.log('✅ Backend basic functionality working');
          } else {
            console.log('❌ Unexpected response with test token:', response);
          }
        } catch (e) {
          console.log('❌ Invalid JSON response with test token');
        }
        
        // Now test with a real Turnstile token
        setTimeout(() => {
          testWithRealToken();
        }, 2000);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Test token request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing post-deployment:', error.message);
  }
}

// Test with a real Turnstile token
async function testWithRealToken() {
  try {
    console.log('\n2️⃣ Testing with real Turnstile token...');
    
    // Use a fresh token from the frontend team's message
    const realToken = '0.h_zRDYDSZm2uOqNCO-MMescnx6lgS_NSlTrZeWkozR51B66ZfS55649IaspFcjQ4NeAfr102jkjJp_-IP06oFYbUTuxGlpYFSuNss9if-eIHNx6s6n4FvKLlGFxeXb2ei3RibiSObkd63MKlXButEamD5yOee3iO1TCMQ3fniF2uWvj6izwUWUFJJLxvFkB1txlwQEnZU6pqQiY1WcmquHVQJ6Xcn6Rhsy6FlSsXw5boSDRd0GRtmL_Wo0vnI1DpLPiqRPkqy48fPgmaQAk21h7WbQCP4P5DyFC0hMzMxrgeusbxLhrC7iM69Xfj5HWPoyLqImwqeTgz-6LQamQRc3LD-Mq3LHpOUxIjn9f9odkCtSpDQ3q6Azc9YLanj6Y8-VFb7NXEODV8BQqHzuMkhUidS8Q8i3e_7TiPDKJ06DEwT7nl_hM08SMP2SwNNczBL50cJrsYYh7V4ALH8iD8s3xT0iZiyfMkmFjtKiLxuVuLkzO6QKKeDNIEERXwTvaTPlfLJq18uC_kL-3ngPcN9T5fFQk6w1WH0Vr6Qg4HBLwYFs6dD-FVQOWG5ZDgF73R61dLZgK2Cko4tEwtR5KW6RYeKO_Ria5-8vbglp8al_7UFndwGRcYHA2G80_SfMC_TEVb4Ap1n71nMpob8ah3txvlAuuL6U-fcIVgck3KURYdkb0fx014iCteVum-sdltBCvlki-kysPUkD_iLfMehCnGQ7oRKrCtAekOAE8Zaq7tTFnOKnVTjTkPK2O4D68dfxisg9GyuEmWJE3khANzF32yN0BwwoiXxGdngPt1vOkYMUNTCNOn8Nra0Pry-se6C5im6Bv9PIqS2OKqsBwZSTVJzwJmNQIxcQ88W_t56-kioK_ssQE_V95gBCsCVG7ZPeKAvVfGQkezYxz2vpvqIefPZyLhBVFNPTM16y4VtiBCnUxUehQG-HqkihYpwWebe_NblNXrPbSE3RUXym9d2w.NBdEv9ercSex4PsSZFS3tw.f1ac48bc314f929c1459a8ef827d1766e20cb49f08b5f9a3fa7fe3c25471f76c';
    
    const testData = JSON.stringify({
      first_name: 'RealTokenTest',
      last_name: 'User',
      email: `realtoken-${Date.now()}@example.com`,
      country: 'US',
      city: 'Test City',
      state: 'CA',
      consent_news: true,
      turnstileToken: realToken
    });

    const options = {
      hostname: 'staging.api.petition.motherofpeace.com',
      port: 443,
      path: '/api/petitions/petition-for-the-mother-of-peace/sign',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Real Token Response Status: ${res.statusCode}`);
        console.log(`📝 Real Token Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('🎉 SUCCESS! Real Turnstile token verified successfully!');
            console.log('✅ Turnstile integration is now working perfectly!');
          } else if (response.error === 'Bot check failed') {
            console.log('❌ Real token still failing - secret key may not be properly configured');
            console.log('❌ Check Vercel environment variables for TURNSTILE_SECRET_KEY');
          } else {
            console.log('❓ Unexpected response with real token:', response);
          }
        } catch (e) {
          console.log('❌ Invalid JSON response with real token');
        }
        
        // Test stats endpoint
        setTimeout(() => {
          testStatsEndpoint();
        }, 2000);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Real token request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing with real token:', error.message);
  }
}

// Test stats endpoint
async function testStatsEndpoint() {
  try {
    console.log('\n3️⃣ Testing stats endpoint...');
    
    const options = {
      hostname: 'staging.api.petition.motherofpeace.com',
      port: 443,
      path: '/api/petitions/petition-for-the-mother-of-peace/stats',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Stats Response Status: ${res.statusCode}`);
        console.log(`📝 Stats Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('✅ Stats endpoint working correctly');
            console.log(`📈 Confirmed: ${response.data.confirmed_count}`);
            console.log(`📈 Pending: ${response.data.pending_count}`);
            console.log(`📈 Total: ${response.data.total_count}`);
          } else {
            console.log('❌ Stats endpoint error:', response.error);
          }
        } catch (e) {
          console.log('❌ Invalid JSON response from stats');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Stats request failed:', error.message);
    });

    req.end();

  } catch (error) {
    console.error('❌ Error testing stats:', error.message);
  }
}

// Run all tests
async function main() {
  console.log('🚀 Starting Post-Deployment Turnstile Tests\n');
  
  await testPostDeployment();
}

main().catch(console.error);
