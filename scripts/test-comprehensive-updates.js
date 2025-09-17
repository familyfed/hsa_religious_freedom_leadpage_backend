const https = require('https');

console.log('🧪 Testing Comprehensive Updates - Email Confirmation + Language Capture...\n');

// Test email-only submission with language (should be immediately confirmed)
async function testEmailOnlyWithLanguage() {
  try {
    console.log('🧪 Testing email-only submission with language (immediate confirmation)...');
    
    const testData = JSON.stringify({
      first_name: 'EmailLangTest',
      last_name: 'User',
      email: `emaillang-${Date.now()}@example.com`,
      country: 'US',
      city: 'Test City',
      state: 'CA',
      postal_code: '12345',
      language: 'en',
      consent_news: true
      // No phone field - should be immediately confirmed
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
        console.log(`📊 Email+Language Response Status: ${res.statusCode}`);
        console.log(`📝 Email+Language Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('✅ Email+language submission: SUCCESS!');
            console.log(`📧 Immediate confirmation: ${response.data.message === 'Thank you for signing the petition!'}`);
            console.log(`🔑 No confirm token: ${!response.data.confirm_token}`);
          } else {
            console.log('❌ Email+language submission: FAILED -', response.error);
          }
        } catch (e) {
          console.log('❌ Email+language submission: Invalid JSON response');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Email+language request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing email+language submission:', error.message);
  }
}

// Test different languages
async function testDifferentLanguages() {
  const languages = ['en', 'ko', 'ja', 'es', 'zh', 'fr'];
  
  for (const lang of languages) {
    try {
      console.log(`\n🧪 Testing language: ${lang}...`);
      
      const testData = JSON.stringify({
        first_name: `${lang}Test`,
        last_name: 'User',
        email: `${lang}-${Date.now()}@example.com`,
        country: 'US',
        city: 'Test City',
        state: 'CA',
        postal_code: '12345',
        language: lang,
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
          console.log(`📊 ${lang} Response Status: ${res.statusCode}`);
          
          try {
            const response = JSON.parse(data);
            if (response.ok) {
              console.log(`✅ ${lang} submission: SUCCESS!`);
            } else {
              console.log(`❌ ${lang} submission: FAILED -`, response.error);
            }
          } catch (e) {
            console.log(`❌ ${lang} submission: Invalid JSON response`);
          }
        });
      });

      req.on('error', (error) => {
        console.error(`❌ ${lang} request failed:`, error.message);
      });

      req.write(testData);
      req.end();
      
      // Wait between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error testing ${lang}:`, error.message);
    }
  }
}

// Test invalid language (should fail)
async function testInvalidLanguage() {
  try {
    console.log('\n🧪 Testing invalid language (should fail)...');
    
    const testData = JSON.stringify({
      first_name: 'InvalidLangTest',
      last_name: 'User',
      email: `invalidlang-${Date.now()}@example.com`,
      country: 'US',
      city: 'Test City',
      state: 'CA',
      postal_code: '12345',
      language: 'invalid', // Invalid language code
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
        console.log(`📊 Invalid Language Response Status: ${res.statusCode}`);
        console.log(`📝 Invalid Language Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (!response.ok) {
            console.log('✅ Invalid language correctly rejected:', response.error);
          } else {
            console.log('❌ Invalid language should have been rejected but was accepted');
          }
        } catch (e) {
          console.log('❌ Invalid language submission: Invalid JSON response');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Invalid language request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing invalid language:', error.message);
  }
}

// Test missing language (should fail)
async function testMissingLanguage() {
  try {
    console.log('\n🧪 Testing missing language (should fail)...');
    
    const testData = JSON.stringify({
      first_name: 'NoLangTest',
      last_name: 'User',
      email: `nolang-${Date.now()}@example.com`,
      country: 'US',
      city: 'Test City',
      state: 'CA',
      postal_code: '12345',
      // No language field - should fail
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
        console.log(`📊 No Language Response Status: ${res.statusCode}`);
        console.log(`📝 No Language Response Body:`, data);
        
        try {
          const response = JSON.parse(data);
          if (!response.ok) {
            console.log('✅ Missing language correctly rejected:', response.error);
          } else {
            console.log('❌ Missing language should have been rejected but was accepted');
          }
        } catch (e) {
          console.log('❌ No language submission: Invalid JSON response');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ No language request failed:', error.message);
    });

    req.write(testData);
    req.end();

  } catch (error) {
    console.error('❌ Error testing missing language:', error.message);
  }
}

// Run all tests
async function main() {
  console.log('🚀 Starting Comprehensive Update Tests\n');
  
  await testEmailOnlyWithLanguage();
  
  setTimeout(() => {
    testDifferentLanguages();
  }, 2000);
  
  setTimeout(() => {
    testInvalidLanguage();
  }, 10000);
  
  setTimeout(() => {
    testMissingLanguage();
  }, 12000);
}

main().catch(console.error);
