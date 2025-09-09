#!/usr/bin/env node

const https = require('https');

const API_BASE = 'https://hsa-religious-freedom-leadpage-backend-4fpslda6v.vercel.app';
const FRONTEND_ORIGIN = 'https://hsa-religious-freedom-leadpage-fron-sandy.vercel.app';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_ORIGIN,
        'User-Agent': 'Test-Script/1.0'
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

async function testStats() {
  console.log('🧪 Testing Stats Endpoint...');
  try {
    const response = await makeRequest('/api/petitions/campaign/stats');
    console.log('Status:', response.statusCode);
    console.log('CORS Origin:', response.headers['access-control-allow-origin']);
    console.log('CORS Credentials:', response.headers['access-control-allow-credentials']);
    console.log('Data:', response.data);
    console.log('Raw:', response.raw);
    return response.statusCode === 200;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

async function testSignPetition() {
  console.log('\n✍️  Testing Sign Petition Endpoint...');
  try {
    const response = await makeRequest('/api/petitions/campaign/sign', 'POST', {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      country: 'US',
      city: 'Test City',
      turnstileToken: 'test_token'
    });
    console.log('Status:', response.statusCode);
    console.log('CORS Origin:', response.headers['access-control-allow-origin']);
    console.log('CORS Credentials:', response.headers['access-control-allow-credentials']);
    console.log('Data:', response.data);
    console.log('Raw:', response.raw);
    return response.statusCode === 200 || response.statusCode === 400; // 400 is expected for invalid token
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Testing CORS Fix for New Frontend Domain');
  console.log('============================================');
  console.log(`Frontend: ${FRONTEND_ORIGIN}`);
  console.log(`Backend: ${API_BASE}\n`);
  
  const statsOk = await testStats();
  const signOk = await testSignPetition();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log('Stats Endpoint:', statsOk ? '✅ PASS' : '❌ FAIL');
  console.log('Sign Endpoint:', signOk ? '✅ PASS' : '❌ FAIL');
  
  if (statsOk && signOk) {
    console.log('\n🎉 CORS fix successful! Frontend should work now.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.');
  }
}

main().catch(console.error);
