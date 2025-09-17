const https = require('https');

console.log('🚀 Testing Production Deployment...\n');

// Test the production API
async function testProductionDeployment() {
  try {
    console.log('🧪 Testing production API...');
    
    // Test with test token first to make sure basic functionality works
    console.log('\n1️⃣ Testing with test token (should bypass Turnstile)...');
    
    const testData = JSON.stringify({
      first_name: 'ProductionTest',
      last_name: 'User',
      email: `production-${Date.now()}@example.com`,
      country: 'US',
      city: 'Test City',
      state: 'CA',
      consent_news: true,
      turnstileToken: 'test_token_123' // This should bypass Turnstile
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
        console.log(`📊 Production Test Token Response Status: ${res.statusCode}`);
        console.log(`📝 Production Test Token Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('✅ Production: Test token bypassed Turnstile successfully');
            console.log('✅ Production: Backend basic functionality working');
          } else if (response.error === 'email address already signed this petition') {
            console.log('✅ Production: Test token bypassed Turnstile (email already exists)');
            console.log('✅ Production: Backend basic functionality working');
          } else {
            console.log('❌ Production: Unexpected response with test token:', response);
          }
        } catch (e) {
          console.log('❌ Production: Invalid JSON response with test token');
        }
        
        // Test production stats endpoint
        setTimeout(() => {
          testProductionStats();
        }, 2000);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Production test token request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing production deployment:', error.message);
  }
}

// Test production stats endpoint
async function testProductionStats() {
  try {
    console.log('\n2️⃣ Testing production stats endpoint...');
    
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
        console.log(`📊 Production Stats Response Status: ${res.statusCode}`);
        console.log(`📝 Production Stats Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('✅ Production: Stats endpoint working correctly');
            console.log(`📈 Production Confirmed: ${response.data.confirmed_count}`);
            console.log(`📈 Production Pending: ${response.data.pending_count}`);
            console.log(`📈 Production Total: ${response.data.total_count}`);
          } else {
            console.log('❌ Production: Stats endpoint error:', response.error);
          }
        } catch (e) {
          console.log('❌ Production: Invalid JSON response from stats');
        }
        
        // Test email confirmation redirect
        setTimeout(() => {
          testEmailConfirmationRedirect();
        }, 2000);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Production stats request failed:', error.message);
    });

    req.end();

  } catch (error) {
    console.error('❌ Error testing production stats:', error.message);
  }
}

// Test email confirmation redirect
async function testEmailConfirmationRedirect() {
  try {
    console.log('\n3️⃣ Testing production email confirmation redirect...');
    
    const options = {
      hostname: 'api.petition.motherofpeace.com',
      port: 443,
      path: '/api/confirm?token=test_token_123',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📊 Production Confirm Response Status: ${res.statusCode}`);
      console.log(`📄 Production Confirm Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📝 Production Confirm Response Body:`, data);
        
        // Check if we got a redirect to the frontend
        const location = res.headers.location;
        if (location && location.includes('petition.motherofpeace.com/thank-you')) {
          console.log('✅ Production: Email confirmation redirects to correct frontend URL');
          console.log(`🔗 Redirect URL: ${location}`);
        } else {
          console.log('❌ Production: Email confirmation redirect issue');
          console.log(`🔗 Location header: ${location}`);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Production confirm request failed:', error.message);
    });

    req.end();

  } catch (error) {
    console.error('❌ Error testing production email confirmation:', error.message);
  }
}

// Run all production tests
async function main() {
  console.log('🚀 Starting Production Deployment Tests\n');
  
  await testProductionDeployment();
}

main().catch(console.error);
