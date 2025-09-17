const https = require('https');

console.log('🔍 Verifying Backend Turnstile Configuration...\n');

// Test the backend's Turnstile configuration
async function testBackendTurnstileConfig() {
  try {
    console.log('📡 Testing backend Turnstile configuration...');
    
    // Test with a dummy token to see what error we get
    const testData = JSON.stringify({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      country: 'US',
      city: 'Test City',
      state: 'CA',
      consent_news: true,
      turnstileToken: 'dummy_token_for_testing'
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
        console.log(`📄 Response Headers:`, res.headers);
        console.log(`📝 Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.error === 'Bot check failed') {
            console.log('✅ Backend is correctly rejecting invalid tokens');
            console.log('✅ Turnstile verification is working');
          } else {
            console.log('❌ Unexpected response - Turnstile might not be configured');
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
    console.error('❌ Error testing backend:', error.message);
  }
}

// Test with a real Turnstile token to see if it works
async function testWithRealToken() {
  try {
    console.log('\n🧪 Testing with a real Turnstile token...');
    
    // This would be a real token from the frontend
    const realToken = '0x4AAAAAAB0JKe-utcVa1kuG_test_token';
    
    const testData = JSON.stringify({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
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

// Run the tests
async function main() {
  console.log('🚀 Starting Backend Turnstile Configuration Verification\n');
  
  await testBackendTurnstileConfig();
  
  // Wait a bit before the second test
  setTimeout(() => {
    testWithRealToken();
  }, 2000);
}

main().catch(console.error);
