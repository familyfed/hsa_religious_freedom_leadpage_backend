const https = require('https');

console.log('🧪 Testing Postal Code Bypass - Any Format Accepted...\n');

// Test various postal code formats
const testCases = [
  { name: 'US Format', postal_code: '12345', country: 'US' },
  { name: 'NL Format', postal_code: '1234AB', country: 'NL' },
  { name: 'IT Format', postal_code: '00100', country: 'IT' },
  { name: 'DK Format', postal_code: '2100', country: 'DK' },
  { name: 'Invalid Format', postal_code: 'invalid-format', country: 'US' },
  { name: 'Empty String', postal_code: '', country: 'US' },
  { name: 'No Postal Code', postal_code: null, country: 'US' }
];

async function testPostalCodeFormat(testCase) {
  try {
    console.log(`\n🧪 Testing ${testCase.name}: "${testCase.postal_code}" for ${testCase.country}`);
    
    const testData = {
      first_name: 'PostalTest',
      last_name: 'User',
      email: `postal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}@example.com`,
      country: testCase.country,
      city: 'Test City',
      state: 'CA',
      consent_news: true
    };
    
    // Only add postal_code if it's not null
    if (testCase.postal_code !== null) {
      testData.postal_code = testCase.postal_code;
    }
    
    const jsonData = JSON.stringify(testData);

    const options = {
      hostname: 'api.petition.motherofpeace.com',
      port: 443,
      path: '/api/petitions/petition-for-the-mother-of-peace/sign',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 ${testCase.name} Response Status: ${res.statusCode}`);
        console.log(`📝 ${testCase.name} Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log(`✅ ${testCase.name}: SUCCESS - Postal code accepted!`);
          } else {
            console.log(`❌ ${testCase.name}: FAILED - ${response.error}`);
          }
        } catch (e) {
          console.log(`❌ ${testCase.name}: Invalid JSON response`);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ ${testCase.name} request failed:`, error.message);
    });

    req.write(jsonData);
    req.end();

  } catch (error) {
    console.error(`❌ Error testing ${testCase.name}:`, error.message);
  }
}

// Run all tests with delays
async function runAllTests() {
  console.log('🚀 Starting Postal Code Bypass Tests\n');
  
  for (let i = 0; i < testCases.length; i++) {
    await testPostalCodeFormat(testCases[i]);
    
    // Wait between tests to avoid rate limiting
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 All postal code tests completed!');
}

runAllTests().catch(console.error);
