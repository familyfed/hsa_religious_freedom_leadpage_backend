const https = require('https');

console.log('🧪 Testing Email-Only Validation...\n');

// Test email-only submission (no phone)
async function testEmailOnlySubmission() {
  try {
    console.log('🧪 Testing email-only submission (no phone)...');
    
    const testData = JSON.stringify({
      first_name: 'EmailOnlyTest',
      last_name: 'User',
      email: `emailonly-${Date.now()}@example.com`,
      country: 'US',
      city: 'Test City',
      state: 'CA',
      postal_code: '12345',
      consent_news: true
      // No phone field - should work with email only
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
        console.log(`📊 Email-Only Response Status: ${res.statusCode}`);
        console.log(`📝 Email-Only Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('✅ Email-only submission: SUCCESS!');
            console.log(`📧 Email confirmation required: ${response.data.message.includes('check your email')}`);
          } else {
            console.log('❌ Email-only submission: FAILED -', response.error);
          }
        } catch (e) {
          console.log('❌ Email-only submission: Invalid JSON response');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Email-only request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing email-only submission:', error.message);
  }
}

// Test submission with both email and phone (should be immediately confirmed)
async function testEmailAndPhoneSubmission() {
  try {
    console.log('\n🧪 Testing email + phone submission (immediate confirmation)...');
    
    const testData = JSON.stringify({
      first_name: 'EmailPhoneTest',
      last_name: 'User',
      email: `emailphone-${Date.now()}@example.com`,
      phone: '2017073920',
      country: 'US',
      city: 'Test City',
      state: 'CA',
      postal_code: '12345',
      consent_news: true
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
        console.log(`📊 Email+Phone Response Status: ${res.statusCode}`);
        console.log(`📝 Email+Phone Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('✅ Email+phone submission: SUCCESS!');
            console.log(`📧 Immediate confirmation: ${!response.data.message.includes('check your email')}`);
          } else {
            console.log('❌ Email+phone submission: FAILED -', response.error);
          }
        } catch (e) {
          console.log('❌ Email+phone submission: Invalid JSON response');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Email+phone request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing email+phone submission:', error.message);
  }
}

// Test missing email (should fail)
async function testMissingEmail() {
  try {
    console.log('\n🧪 Testing missing email (should fail)...');
    
    const testData = JSON.stringify({
      first_name: 'NoEmailTest',
      last_name: 'User',
      // No email field - should fail
      country: 'US',
      city: 'Test City',
      state: 'CA',
      postal_code: '12345',
      consent_news: true
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
        console.log(`📊 No Email Response Status: ${res.statusCode}`);
        console.log(`📝 No Email Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (!response.ok) {
            console.log('✅ Missing email correctly rejected:', response.error);
          } else {
            console.log('❌ Missing email should have been rejected but was accepted');
          }
        } catch (e) {
          console.log('❌ No email submission: Invalid JSON response');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ No email request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing missing email:', error.message);
  }
}

// Run all tests
async function main() {
  console.log('🚀 Starting Email-Only Validation Tests\n');
  
  await testEmailOnlySubmission();
  
  setTimeout(() => {
    testEmailAndPhoneSubmission();
  }, 2000);
  
  setTimeout(() => {
    testMissingEmail();
  }, 4000);
}

main().catch(console.error);
