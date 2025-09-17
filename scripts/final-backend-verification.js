const https = require('https');

console.log('🔍 Final Backend Turnstile Configuration Verification...\n');

// Test 1: Verify test token bypass works
async function testTokenBypass() {
  try {
    console.log('🧪 Test 1: Testing token bypass with test_token_123...');
    
    const testData = JSON.stringify({
      first_name: 'TestBypass',
      last_name: 'User',
      email: 'testbypass@example.com',
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
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log(`📝 Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('✅ Test token bypassed Turnstile successfully');
            console.log('✅ Backend is correctly configured for development/staging');
          } else if (response.error === 'email address already signed this petition') {
            console.log('✅ Test token bypassed Turnstile (email already exists)');
            console.log('✅ Backend is correctly configured for development/staging');
          } else {
            console.log('❌ Unexpected response:', response);
          }
        } catch (e) {
          console.log('❌ Invalid JSON response');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing token bypass:', error.message);
  }
}

// Test 2: Verify invalid token is rejected
async function testInvalidToken() {
  try {
    console.log('\n🧪 Test 2: Testing invalid token rejection...');
    
    const testData = JSON.stringify({
      first_name: 'TestInvalid',
      last_name: 'User',
      email: 'testinvalid@example.com',
      country: 'US',
      city: 'Test City',
      state: 'CA',
      consent_news: true,
      turnstileToken: 'invalid_token_123' // This should be rejected
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
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log(`📝 Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.error === 'Bot check failed') {
            console.log('✅ Invalid token correctly rejected');
            console.log('✅ Turnstile verification is working');
          } else {
            console.log('❌ Unexpected response:', response);
          }
        } catch (e) {
          console.log('❌ Invalid JSON response');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing invalid token:', error.message);
  }
}

// Test 3: Check stats endpoint
async function testStatsEndpoint() {
  try {
    console.log('\n🧪 Test 3: Testing stats endpoint...');
    
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
  console.log('🚀 Starting Final Backend Verification\n');
  
  await testTokenBypass();
  
  // Wait between tests
  setTimeout(() => {
    testInvalidToken();
  }, 2000);
  
  setTimeout(() => {
    testStatsEndpoint();
  }, 4000);
}

main().catch(console.error);
