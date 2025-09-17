const https = require('https');

console.log('🔍 Checking Backend Environment Configuration...\n');

// Test the backend's environment configuration
async function checkBackendEnv() {
  try {
    console.log('📡 Testing backend environment configuration...');
    
    // Test with a test token to see what environment we're hitting
    const testData = JSON.stringify({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      country: 'US',
      city: 'Test City',
      state: 'CA',
      consent_news: true,
      turnstileToken: 'test_token_123' // This should bypass Turnstile in development
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
            console.log('✅ Test token bypassed Turnstile - backend is in development mode');
            console.log('✅ Backend environment: Development/Staging');
          } else if (response.error === 'Bot check failed') {
            console.log('❌ Test token was rejected - backend is in production mode');
            console.log('❌ Backend environment: Production');
          } else {
            console.log('❓ Unexpected response:', response);
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

// Test the stats endpoint to see if it's working
async function testStatsEndpoint() {
  try {
    console.log('\n📊 Testing stats endpoint...');
    
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
            console.log(`📈 Confirmed count: ${response.data.confirmed_count}`);
            console.log(`📈 Pending count: ${response.data.pending_count}`);
            console.log(`📈 Total count: ${response.data.total_count}`);
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

// Run the tests
async function main() {
  console.log('🚀 Starting Backend Environment Check\n');
  
  await checkBackendEnv();
  
  // Wait a bit before the second test
  setTimeout(() => {
    testStatsEndpoint();
  }, 2000);
}

main().catch(console.error);
