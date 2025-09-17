const https = require('https');

console.log('🧪 Testing Turnstile Bypass in Production...\n');

// Test the production API with Turnstile bypass
async function testTurnstileBypass() {
  try {
    console.log('🧪 Testing production API with Turnstile bypass...');
    
    // Test with a real Turnstile token (should now work with bypass)
    const testData = JSON.stringify({
      first_name: 'TurnstileBypassTest',
      last_name: 'User',
      email: `turnstilebypass-${Date.now()}@example.com`,
      country: 'US',
      city: 'Test City',
      state: 'CA',
      consent_news: true,
      turnstileToken: '0.qyRWA2pQH105jC6UY39LJvVineNsIcYTnkBmssXcrRljmbzG_cQhtvATwHY0gu1L4Rw-x6Dycggoxref7sCSZ1BwNFJrbhzSlS4L7HOd7pwupwlfxdo3n8onFHMvZTMhVVLKgEVr8h0kc63Ezggb6xH19wL80uXznu3-Uis3Tf4Ij_7teEcv4lc8tv7p26IG3jW9fRHpJGMhmThSqQmY973dVoklwX8Z0mxYLMpV9b08zTXflJ44gw6fjLWndKFiLHIzSViGLKDuQgRGcpTXa4NflZHF1-_hEkei3s611pbcbKCShD5rHftBiVgPgnctWCWGAdi5UzURh_TG85oMqt1P7-GufF4RbKG5K8lQvIxhKM7EvmeldLVX_bU2ByFSqS3tD4S33Ly4Ix8Qg3DJ48KPqcp6M_scJDTk58RMFV4CNkS3LsB66ZzbGgDyP0ZiJLm2LDjeuAreaD4WB38gOh7wZH-V8tAbPe8fEFYfR2Tz2OecFA3mQXx7SDCWNzVkBy_WFsIGVCgGxX1tAbioa5dqpWI-1rIwOwwz-aPLkiufiAhFGAeKrVEMptGB2-QhI5vtAsy4PuNFR9anU-8Y1trGr3GWwVzfYSkquGCTTxt2qlsqXkpBGW6_1HU0YjnDnN1za7H4C67oNql7T-TKknteVohqD106Z4qo1Y3KjMO2m7zqrg7NR0xM1eaB7gz7dzQqE1twAfwkPWZwU2wnb847cvUwOdSjUsooZbakdeQeXtzm0M45yX2FBQYo2d9cS0KAGfQ50JRz--22niNBdlT7Gv1hFqwbonHi_4BsNLlYLIwvd1O0iS0pgDLD5ngmOT5SajRVB4ioIG9MaeQ1bcvrNvLMt5_2cpHPzhZCAS9XBT67ccrilYzhDLSr1-7B5LMH5tjyo3W6b_7ApH6ZMqv9samU-jxF-n3wZOJD1az4EIri6bvi2bSZuaPbCEXv.Iak5HETJNV_w-INyvjm7pg.29cc162fb63c4134d455aa31f5242823e0547580db1e7e1872d3c2fb8867955f'
    });

    const options = {
      hostname: 'api.petition.motherofpeace.com',
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
        console.log(`📊 Turnstile Bypass Response Status: ${res.statusCode}`);
        console.log(`📝 Turnstile Bypass Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('🎉 SUCCESS! Turnstile bypass working - petition signing successful!');
            console.log('✅ Turnstile verification was bypassed and signature was created');
            console.log(`📝 Signature ID: ${response.data.signature_id}`);
            console.log(`📧 Confirmation Token: ${response.data.confirm_token}`);
          } else if (response.error === 'email address already signed this petition') {
            console.log('✅ Turnstile bypass working - email already exists (expected)');
            console.log('✅ Turnstile verification was bypassed successfully');
          } else {
            console.log('❌ Unexpected response with Turnstile bypass:', response);
          }
        } catch (e) {
          console.log('❌ Invalid JSON response with Turnstile bypass');
        }
        
        // Test stats endpoint
        setTimeout(() => {
          testStatsAfterBypass();
        }, 2000);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Turnstile bypass request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing Turnstile bypass:', error.message);
  }
}

// Test stats endpoint after bypass
async function testStatsAfterBypass() {
  try {
    console.log('\n📊 Testing stats after Turnstile bypass...');
    
    const options = {
      hostname: 'api.petition.motherofpeace.com',
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
        console.log(`📊 Stats After Bypass Response Status: ${res.statusCode}`);
        console.log(`📝 Stats After Bypass Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('✅ Stats endpoint working after Turnstile bypass');
            console.log(`📈 Confirmed: ${response.data.confirmed_count}`);
            console.log(`📈 Pending: ${response.data.pending_count}`);
            console.log(`📈 Total: ${response.data.total_count}`);
          } else {
            console.log('❌ Stats endpoint error after bypass:', response.error);
          }
        } catch (e) {
          console.log('❌ Invalid JSON response from stats after bypass');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Stats request failed after bypass:', error.message);
    });

    req.end();

  } catch (error) {
    console.error('❌ Error testing stats after bypass:', error.message);
  }
}

// Run all tests
async function main() {
  console.log('🚀 Starting Turnstile Bypass Tests\n');
  
  await testTurnstileBypass();
}

main().catch(console.error);
