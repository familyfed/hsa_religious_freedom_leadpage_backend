const https = require('https');

console.log('🧪 Testing Simple Turnstile Bypass...\n');

// Test with a simple request
async function testSimpleBypass() {
  try {
    console.log('🧪 Testing with minimal data...');
    
    const testData = JSON.stringify({
      first_name: 'SimpleTest',
      last_name: 'User',
      email: `simple-${Date.now()}@example.com`,
      country: 'US',
      city: 'Test City',
      state: 'CA',
      consent_news: true,
      turnstileToken: 'bypass_token_123' // Simple test token
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
        console.log(`📊 Simple Bypass Response Status: ${res.statusCode}`);
        console.log(`📝 Simple Bypass Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('🎉 SUCCESS! Simple bypass working!');
          } else {
            console.log('❌ Still failing:', response.error);
          }
        } catch (e) {
          console.log('❌ Invalid JSON response');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Simple bypass request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing simple bypass:', error.message);
  }
}

// Test without Turnstile token at all
async function testWithoutTurnstile() {
  try {
    console.log('\n🧪 Testing without Turnstile token...');
    
    const testData = JSON.stringify({
      first_name: 'NoTurnstileTest',
      last_name: 'User',
      email: `noturnstile-${Date.now()}@example.com`,
      country: 'US',
      city: 'Test City',
      state: 'CA',
      consent_news: true
      // No turnstileToken field at all
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
        console.log(`📊 No Turnstile Response Status: ${res.statusCode}`);
        console.log(`📝 No Turnstile Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('🎉 SUCCESS! No Turnstile token working!');
          } else {
            console.log('❌ Still failing without Turnstile:', response.error);
          }
        } catch (e) {
          console.log('❌ Invalid JSON response without Turnstile');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ No Turnstile request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing without Turnstile:', error.message);
  }
}

// Run tests
async function main() {
  console.log('🚀 Starting Simple Bypass Tests\n');
  
  await testSimpleBypass();
  
  setTimeout(() => {
    testWithoutTurnstile();
  }, 2000);
}

main().catch(console.error);
