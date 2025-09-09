#!/usr/bin/env node

/**
 * Test stable domain configuration
 */

const https = require('https');

const STABLE_BACKEND = 'https://hsa-petitions-api.vercel.app';
const STABLE_FRONTEND = 'https://hsa-petitions.vercel.app';

function makeRequest(path, origin = STABLE_FRONTEND) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, STABLE_BACKEND);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': origin,
        'User-Agent': 'Stable-Domain-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData,
            raw: responseData,
            corsOrigin: res.headers['access-control-allow-origin'],
            corsCredentials: res.headers['access-control-allow-credentials']
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            raw: responseData,
            corsOrigin: res.headers['access-control-allow-origin'],
            corsCredentials: res.headers['access-control-allow-credentials'],
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function testStableDomains() {
  console.log('🎯 Testing Stable Domain Configuration');
  console.log('=====================================');
  console.log(`Backend: ${STABLE_BACKEND}`);
  console.log(`Frontend: ${STABLE_FRONTEND}\n`);
  
  const tests = [
    {
      name: 'Health Check',
      path: '/health',
      origin: STABLE_FRONTEND
    },
    {
      name: 'Stats Endpoint',
      path: '/api/petitions/campaign/stats',
      origin: STABLE_FRONTEND
    },
    {
      name: 'Health Check (No Origin)',
      path: '/health',
      origin: null
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`🧪 Testing: ${test.name}`);
    console.log(`   Path: ${test.path}`);
    console.log(`   Origin: ${test.origin || 'None'}`);
    
    try {
      const response = await makeRequest(test.path, test.origin);
      
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   CORS Origin: ${response.corsOrigin || 'NOT SET'}`);
      console.log(`   CORS Credentials: ${response.corsCredentials || 'NOT SET'}`);
      console.log(`   Data: ${response.raw.substring(0, 100)}${response.raw.length > 100 ? '...' : ''}`);
      
      const isWorking = response.statusCode === 200 && 
                       (test.origin ? response.corsOrigin === test.origin : true) && 
                       (test.origin ? response.corsCredentials === 'true' : true);
      
      console.log(`   Result: ${isWorking ? '✅ PASS' : '❌ FAIL'}`);
      if (isWorking) passedTests++;
      
    } catch (error) {
      console.log(`   Error: ${error.message}`);
      console.log(`   Result: ❌ FAIL`);
    }
    
    console.log('');
  }
  
  console.log('📊 Test Summary');
  console.log('================');
  console.log(`Passed: ${passedTests}/${totalTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Stable domains are working perfectly.');
    console.log('✅ Backend stable domain: https://hsa-petitions-api.vercel.app');
    console.log('✅ Frontend stable domain: https://hsa-petitions.vercel.app');
    console.log('✅ CORS configuration working correctly');
    console.log('✅ Ready for frontend integration');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
}

testStableDomains().catch(console.error);
