#!/usr/bin/env node

/**
 * Test script for custom backend domains
 * Tests both staging and production API endpoints
 */

const https = require('https');
const http = require('http');

// Configuration
const DOMAINS = {
  staging: 'https://staging.api.petition.motherofpeace.com',
  production: 'https://api.petition.motherofpeace.com'
};

const TEST_ORIGINS = {
  staging: 'https://staging.petition.motherofpeace.com',
  production: 'https://petition.motherofpeace.com'
};

// Test data
const TEST_SIGNATURE = {
  first_name: 'Test',
  last_name: 'User',
  phone: '+1234567890',
  email: 'test@example.com',
  country: 'US',
  city: 'New York',
  state: 'NY',
  consent_news: true,
  turnstileToken: 'test_token_123'
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Custom-Domain-Test/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            raw: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: data
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

// Test functions
async function testHealthCheck(domain, name) {
  console.log(`\n🏥 Testing Health Check - ${name}`);
  console.log(`   URL: ${domain}/health`);
  
  try {
    const response = await makeRequest(`${domain}/health`);
    
    if (response.status === 200 && response.data?.ok === true) {
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ Response: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   ❌ Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testCORS(domain, origin, name) {
  console.log(`\n🌐 Testing CORS - ${name}`);
  console.log(`   URL: ${domain}/api/petitions/campaign/stats`);
  console.log(`   Origin: ${origin}`);
  
  try {
    const response = await makeRequest(`${domain}/api/petitions/campaign/stats`, {
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials']
    };
    
    if (response.status === 204 && corsHeaders['access-control-allow-origin']) {
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ CORS Headers: ${JSON.stringify(corsHeaders)}`);
      return true;
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   ❌ CORS Headers: ${JSON.stringify(corsHeaders)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testPetitionStats(domain, origin, name) {
  console.log(`\n📊 Testing Petition Stats - ${name}`);
  console.log(`   URL: ${domain}/api/petitions/campaign/stats`);
  
  try {
    const response = await makeRequest(`${domain}/api/petitions/campaign/stats`, {
      headers: {
        'Origin': origin
      }
    });
    
    if (response.status === 200 && response.data?.ok === true) {
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ Response: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   ❌ Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testPetitionSign(domain, origin, name) {
  console.log(`\n✍️  Testing Petition Sign - ${name}`);
  console.log(`   URL: ${domain}/api/petitions/campaign/sign`);
  
  try {
    const response = await makeRequest(`${domain}/api/petitions/campaign/sign`, {
      method: 'POST',
      headers: {
        'Origin': origin
      },
      body: TEST_SIGNATURE
    });
    
    if (response.status === 200 && response.data?.ok === true) {
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ Response: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   ❌ Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testSSL(domain, name) {
  console.log(`\n🔒 Testing SSL Certificate - ${name}`);
  console.log(`   URL: ${domain}`);
  
  try {
    const response = await makeRequest(`${domain}/health`);
    
    if (response.status === 200) {
      console.log(`   ✅ SSL Certificate: Valid`);
      console.log(`   ✅ HTTPS Connection: Working`);
      return true;
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Custom Domain API Tests');
  console.log('=====================================');
  
  const results = {
    staging: {},
    production: {}
  };
  
  // Test Staging Domain
  console.log('\n📋 TESTING STAGING DOMAIN');
  console.log('==========================');
  
  results.staging.ssl = await testSSL(DOMAINS.staging, 'Staging');
  results.staging.health = await testHealthCheck(DOMAINS.staging, 'Staging');
  results.staging.cors = await testCORS(DOMAINS.staging, TEST_ORIGINS.staging, 'Staging');
  results.staging.stats = await testPetitionStats(DOMAINS.staging, TEST_ORIGINS.staging, 'Staging');
  results.staging.sign = await testPetitionSign(DOMAINS.staging, TEST_ORIGINS.staging, 'Staging');
  
  // Test Production Domain
  console.log('\n📋 TESTING PRODUCTION DOMAIN');
  console.log('=============================');
  
  results.production.ssl = await testSSL(DOMAINS.production, 'Production');
  results.production.health = await testHealthCheck(DOMAINS.production, 'Production');
  results.production.cors = await testCORS(DOMAINS.production, TEST_ORIGINS.production, 'Production');
  results.production.stats = await testPetitionStats(DOMAINS.production, TEST_ORIGINS.production, 'Production');
  results.production.sign = await testPetitionSign(DOMAINS.production, TEST_ORIGINS.production, 'Production');
  
  // Summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  
  const domains = ['staging', 'production'];
  domains.forEach(domain => {
    console.log(`\n${domain.toUpperCase()} DOMAIN: ${DOMAINS[domain]}`);
    console.log(`  SSL Certificate: ${results[domain].ssl ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Health Check:    ${results[domain].health ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  CORS Headers:    ${results[domain].cors ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Petition Stats:  ${results[domain].stats ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Petition Sign:   ${results[domain].sign ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  // Overall status
  const allPassed = Object.values(results).every(domain => 
    Object.values(domain).every(test => test === true)
  );
  
  console.log(`\n🎯 OVERALL STATUS: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (!allPassed) {
    console.log('\n⚠️  If tests failed, check:');
    console.log('   - Custom domains are properly configured in Vercel');
    console.log('   - SSL certificates are active');
    console.log('   - CORS configuration includes the test origins');
    console.log('   - Backend deployments are live and healthy');
  }
}

// Run the tests
runTests().catch(console.error);
