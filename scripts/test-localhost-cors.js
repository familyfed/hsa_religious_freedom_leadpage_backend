#!/usr/bin/env node

/**
 * Test script for localhost CORS configuration
 * Tests both staging and production APIs with localhost:3030 origin
 */

const https = require('https');

// Configuration
const DOMAINS = {
  staging: 'https://staging.api.petition.motherofpeace.com',
  production: 'https://api.petition.motherofpeace.com'
};

const LOCALHOST_ORIGIN = 'http://localhost:3030';

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : require('http');
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Localhost-CORS-Test/1.0',
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
async function testLocalhostCORS(domain, name) {
  console.log(`\n🌐 Testing Localhost CORS - ${name}`);
  console.log(`   URL: ${domain}/health`);
  console.log(`   Origin: ${LOCALHOST_ORIGIN}`);
  
  try {
    const response = await makeRequest(`${domain}/health`, {
      headers: {
        'Origin': LOCALHOST_ORIGIN
      }
    });
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials']
    };
    
    if (response.status === 200 && corsHeaders['access-control-allow-origin'] === LOCALHOST_ORIGIN) {
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ CORS Headers: ${JSON.stringify(corsHeaders)}`);
      console.log(`   ✅ Response: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   ❌ CORS Headers: ${JSON.stringify(corsHeaders)}`);
      console.log(`   ❌ Expected Origin: ${LOCALHOST_ORIGIN}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testLocalhostOPTIONS(domain, name) {
  console.log(`\n🔍 Testing Localhost OPTIONS - ${name}`);
  console.log(`   URL: ${domain}/api/petitions/campaign/stats`);
  console.log(`   Origin: ${LOCALHOST_ORIGIN}`);
  
  try {
    const response = await makeRequest(`${domain}/api/petitions/campaign/stats`, {
      method: 'OPTIONS',
      headers: {
        'Origin': LOCALHOST_ORIGIN,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials']
    };
    
    if (response.status === 204 && corsHeaders['access-control-allow-origin'] === LOCALHOST_ORIGIN) {
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ CORS Headers: ${JSON.stringify(corsHeaders)}`);
      return true;
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   ❌ CORS Headers: ${JSON.stringify(corsHeaders)}`);
      console.log(`   ❌ Expected Origin: ${LOCALHOST_ORIGIN}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testLocalhostAPI(domain, name) {
  console.log(`\n📊 Testing Localhost API - ${name}`);
  console.log(`   URL: ${domain}/api/petitions/campaign/stats`);
  console.log(`   Origin: ${LOCALHOST_ORIGIN}`);
  
  try {
    const response = await makeRequest(`${domain}/api/petitions/campaign/stats`, {
      headers: {
        'Origin': LOCALHOST_ORIGIN
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

// Main test function
async function runTests() {
  console.log('🚀 Starting Localhost CORS Tests');
  console.log('=================================');
  console.log(`Testing Origin: ${LOCALHOST_ORIGIN}`);
  
  const results = {
    staging: {},
    production: {}
  };
  
  // Test Staging Domain
  console.log('\n📋 TESTING STAGING DOMAIN');
  console.log('==========================');
  
  results.staging.cors = await testLocalhostCORS(DOMAINS.staging, 'Staging');
  results.staging.options = await testLocalhostOPTIONS(DOMAINS.staging, 'Staging');
  results.staging.api = await testLocalhostAPI(DOMAINS.staging, 'Staging');
  
  // Test Production Domain
  console.log('\n📋 TESTING PRODUCTION DOMAIN');
  console.log('=============================');
  
  results.production.cors = await testLocalhostCORS(DOMAINS.production, 'Production');
  results.production.options = await testLocalhostOPTIONS(DOMAINS.production, 'Production');
  results.production.api = await testLocalhostAPI(DOMAINS.production, 'Production');
  
  // Summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  
  const domains = ['staging', 'production'];
  domains.forEach(domain => {
    console.log(`\n${domain.toUpperCase()} DOMAIN: ${DOMAINS[domain]}`);
    console.log(`  CORS Headers:    ${results[domain].cors ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  OPTIONS Request: ${results[domain].options ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  API Call:        ${results[domain].api ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  // Overall status
  const allPassed = Object.values(results).every(domain => 
    Object.values(domain).every(test => test === true)
  );
  
  console.log(`\n🎯 OVERALL STATUS: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 SUCCESS! Localhost CORS is working correctly!');
    console.log('The frontend team can now develop locally on port 3030.');
  } else {
    console.log('\n⚠️  If tests failed, check:');
    console.log('   - The CORS configuration has been deployed');
    console.log('   - http://localhost:3030 is in the corsOrigins array');
    console.log('   - The backend is running the latest code');
  }
}

// Run the tests
runTests().catch(console.error);
