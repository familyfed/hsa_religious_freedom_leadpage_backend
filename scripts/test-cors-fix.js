#!/usr/bin/env node

/**
 * Test CORS fix for dynamic Vercel URLs
 */

const https = require('https');

const API_BASE = 'https://hsa-religious-freedom-leadpage-backend-906coezv8.vercel.app';

function makeRequest(path, origin = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CORS-Test-Script/1.0'
      }
    };

    if (origin) {
      options.headers['Origin'] = origin;
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData,
          corsOrigin: res.headers['access-control-allow-origin'],
          corsCredentials: res.headers['access-control-allow-credentials']
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function testCORS(origin, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`   Origin: ${origin}`);
  
  try {
    const response = await makeRequest('/api/petitions/campaign/stats', origin);
    
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   CORS Origin: ${response.corsOrigin || 'NOT SET'}`);
    console.log(`   CORS Credentials: ${response.corsCredentials || 'NOT SET'}`);
    console.log(`   Data: ${response.data}`);
    
    const isWorking = response.statusCode === 200 && 
                     response.corsOrigin === origin && 
                     response.corsCredentials === 'true';
    
    console.log(`   Result: ${isWorking ? '✅ PASS' : '❌ FAIL'}`);
    return isWorking;
    
  } catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log(`   Result: ❌ FAIL`);
    return false;
  }
}

async function main() {
  console.log('🔧 CORS Fix Verification Test');
  console.log('==============================');
  
  const tests = [
    {
      origin: 'https://hsa-religious-freedom-leadpage-frontend-ol39u2zhi.vercel.app',
      description: 'Current Frontend URL (from letter)'
    },
    {
      origin: 'https://hsa-religious-freedom-leadpage-frontend-447byozxo.vercel.app',
      description: 'Previous Frontend URL'
    },
    {
      origin: 'https://hsa-religious-freedom-leadpage-frontend-abc123.vercel.app',
      description: 'Random Dynamic Vercel URL'
    },
    {
      origin: 'https://hsa-religious-freedom-leadpage-frontend.vercel.app',
      description: 'Production Domain'
    },
    {
      origin: 'https://religiousfreedom.vercel.app',
      description: 'Original Domain'
    },
    {
      origin: 'http://localhost:3000',
      description: 'Development Localhost'
    },
    {
      origin: 'https://some-other-app.vercel.app',
      description: 'Other Vercel App (should work with fallback)'
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    const passed = await testCORS(test.origin, test.description);
    if (passed) passedTests++;
  }
  
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`Passed: ${passedTests}/${totalTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! CORS fix is working perfectly.');
    console.log('✅ Dynamic Vercel URLs are now supported');
    console.log('✅ Frontend team can proceed with integration');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
}

main().catch(console.error);
