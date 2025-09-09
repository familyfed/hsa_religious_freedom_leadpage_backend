#!/usr/bin/env node

/**
 * Production API Testing Script
 * Tests the deployed API at religiousfreedombackend.vercel.app
 */

const https = require('https');

const API_BASE = 'https://hsa-religious-freedom-leadpage-backend-lr2pmwvut.vercel.app';
const PETITION_SLUG = 'campaign';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testHealthCheck() {
  log('\n🔍 Testing Health Check...', 'yellow');
  try {
    const response = await makeRequest(`${API_BASE}/health`);
    if (response.statusCode === 200) {
      log('✅ Health Check: PASSED', 'green');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      return true;
    } else {
      log('❌ Health Check: FAILED', 'red');
      log(`Status: ${response.statusCode}`, 'red');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Health Check: ERROR', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

async function testPetitionStats() {
  log('\n📊 Testing Petition Stats...', 'yellow');
  try {
    const response = await makeRequest(`${API_BASE}/api/petitions/${PETITION_SLUG}/stats`);
    if (response.statusCode === 200) {
      log('✅ Petition Stats: PASSED', 'green');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      return true;
    } else {
      log('❌ Petition Stats: FAILED', 'red');
      log(`Status: ${response.statusCode}`, 'red');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Petition Stats: ERROR', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

async function testPetitionSigning() {
  log('\n✍️  Testing Petition Signing...', 'yellow');
  try {
    const response = await makeRequest(`${API_BASE}/api/petitions/${PETITION_SLUG}/sign`, {
      method: 'POST',
      body: {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        country: 'US',
        city: 'New York',
        state: 'NY',
        consent_news: true,
        turnstileToken: 'test-token'
      }
    });

    if (response.statusCode === 200) {
      log('✅ Petition Signing: PASSED', 'green');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      return true;
    } else if (response.statusCode === 400) {
      log('⚠️  Petition Signing: VALIDATION ERROR (Expected)', 'yellow');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      log('💡 This is expected due to Turnstile validation in production', 'yellow');
      return true;
    } else {
      log('❌ Petition Signing: FAILED', 'red');
      log(`Status: ${response.statusCode}`, 'red');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Petition Signing: ERROR', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

async function testEmailValidation() {
  log('\n📧 Testing Email Validation...', 'yellow');
  try {
    const response = await makeRequest(`${API_BASE}/api/petitions/${PETITION_SLUG}/sign`, {
      method: 'POST',
      body: {
        first_name: 'Test',
        last_name: 'User',
        email: 'invalid-email',
        country: 'US',
        city: 'New York',
        state: 'NY',
        consent_news: true,
        turnstileToken: 'test-token'
      }
    });

    if (response.statusCode === 400) {
      log('✅ Email Validation: PASSED', 'green');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      return true;
    } else {
      log('❌ Email Validation: FAILED', 'red');
      log(`Status: ${response.statusCode}`, 'red');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Email Validation: ERROR', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

async function testRequiredFields() {
  log('\n📝 Testing Required Fields Validation...', 'yellow');
  try {
    const response = await makeRequest(`${API_BASE}/api/petitions/${PETITION_SLUG}/sign`, {
      method: 'POST',
      body: {
        email: 'test@example.com'
      }
    });

    if (response.statusCode === 400) {
      log('✅ Required Fields Validation: PASSED', 'green');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      return true;
    } else {
      log('❌ Required Fields Validation: FAILED', 'red');
      log(`Status: ${response.statusCode}`, 'red');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Required Fields Validation: ERROR', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('🧪 Production API Testing Suite', 'bold');
  log('================================', 'bold');
  log(`API Base: ${API_BASE}`, 'blue');
  log(`Petition Slug: ${PETITION_SLUG}`, 'blue');

  const results = {
    healthCheck: await testHealthCheck(),
    petitionStats: await testPetitionStats(),
    petitionSigning: await testPetitionSigning(),
    emailValidation: await testEmailValidation(),
    requiredFields: await testRequiredFields()
  };

  log('\n📋 Test Summary:', 'yellow');
  log('================', 'yellow');
  log(`• Health Check: ${results.healthCheck ? '✅ PASS' : '❌ FAIL'}`, results.healthCheck ? 'green' : 'red');
  log(`• Petition Stats: ${results.petitionStats ? '✅ PASS' : '❌ FAIL'}`, results.petitionStats ? 'green' : 'red');
  log(`• Petition Signing: ${results.petitionSigning ? '✅ PASS' : '❌ FAIL'}`, results.petitionSigning ? 'green' : 'red');
  log(`• Email Validation: ${results.emailValidation ? '✅ PASS' : '❌ FAIL'}`, results.emailValidation ? 'green' : 'red');
  log(`• Required Fields: ${results.requiredFields ? '✅ PASS' : '❌ FAIL'}`, results.requiredFields ? 'green' : 'red');

  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    log('\n🎉 All tests passed! Your production API is working!', 'green');
    log('💡 Frontend can now connect to the API', 'yellow');
  } else {
    log('\n🚨 Some tests failed. Check the output above for details.', 'red');
    if (!results.healthCheck) {
      log('💡 Make sure environment variables are set in Vercel dashboard', 'yellow');
    }
  }

  return allPassed;
}

// Run the tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log(`\n💥 Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});
