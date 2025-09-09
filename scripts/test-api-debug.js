#!/usr/bin/env node

/**
 * Debug API issues
 */

const https = require('https');

const API_BASE = 'https://hsa-religious-freedom-leadpage-backend-c54jj2hx6.vercel.app';

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Debug-Script/1.0',
        ...headers
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

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
            raw: responseData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            raw: responseData,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testHealth() {
  console.log('🔍 Testing Health Endpoint...');
  try {
    const response = await makeRequest('/health');
    console.log('Status:', response.statusCode);
    console.log('Headers:', Object.keys(response.headers));
    console.log('Data:', response.data);
    console.log('Raw:', response.raw);
    return response.statusCode === 200;
  } catch (error) {
    console.error('Health test failed:', error.message);
    return false;
  }
}

async function testStats() {
  console.log('\n📊 Testing Stats Endpoint...');
  try {
    const response = await makeRequest('/api/petitions/campaign/stats');
    console.log('Status:', response.statusCode);
    console.log('Headers:', Object.keys(response.headers));
    console.log('Data:', response.data);
    console.log('Raw:', response.raw);
    if (response.parseError) {
      console.log('Parse Error:', response.parseError);
    }
    return response.statusCode === 200;
  } catch (error) {
    console.error('Stats test failed:', error.message);
    return false;
  }
}

async function testStatsWithCORS() {
  console.log('\n🌐 Testing Stats with CORS...');
  try {
    const response = await makeRequest('/api/petitions/campaign/stats', 'GET', null, {
      'Origin': 'https://hsa-religious-freedom-leadpage-frontend-447byozxo.vercel.app'
    });
    console.log('Status:', response.statusCode);
    console.log('CORS Headers:');
    console.log('  - access-control-allow-origin:', response.headers['access-control-allow-origin']);
    console.log('  - access-control-allow-methods:', response.headers['access-control-allow-methods']);
    console.log('  - access-control-allow-credentials:', response.headers['access-control-allow-credentials']);
    console.log('Data:', response.data);
    console.log('Raw:', response.raw);
    return response.statusCode === 200;
  } catch (error) {
    console.error('CORS test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 API Debug Test Suite');
  console.log('========================\n');
  
  const healthOk = await testHealth();
  const statsOk = await testStats();
  const corsOk = await testStatsWithCORS();
  
  console.log('\n📋 Test Summary:');
  console.log('================');
  console.log('Health Check:', healthOk ? '✅ PASS' : '❌ FAIL');
  console.log('Stats Endpoint:', statsOk ? '✅ PASS' : '❌ FAIL');
  console.log('CORS Headers:', corsOk ? '✅ PASS' : '❌ FAIL');
  
  if (healthOk && statsOk && corsOk) {
    console.log('\n🎉 All tests passed! API is working correctly.');
  } else {
    console.log('\n🚨 Some tests failed. Check the output above for details.');
  }
}

main().catch(console.error);
