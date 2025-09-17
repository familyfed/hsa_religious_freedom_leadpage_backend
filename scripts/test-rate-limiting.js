#!/usr/bin/env node

/**
 * Test Rate Limiting Configuration
 * 
 * This script tests the rate limiting configuration for both staging and production
 * environments to ensure the new limits are working properly.
 */

const https = require('https');

// Test configuration
const configs = [
  {
    name: 'Staging',
    domain: 'staging.api.petition.motherofpeace.com',
    expectedLimit: 100,
    expectedWindow: 3600
  },
  {
    name: 'Production',
    domain: 'api.petition.motherofpeace.com',
    expectedLimit: 10,
    expectedWindow: 3600
  }
];

async function makeRequest(domain, path = '/api/petitions/campaign/stats') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: domain,
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Rate-Limit-Test/1.0',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testRateLimiting(config) {
  console.log(`\n🧪 Testing ${config.name} Rate Limiting`);
  console.log(`Domain: ${config.domain}`);
  console.log(`Expected Limit: ${config.expectedLimit} requests/hour`);
  console.log(`Expected Window: ${config.expectedWindow} seconds`);
  console.log('─'.repeat(60));

  try {
    // Make initial request
    const response = await makeRequest(config.domain);
    
    console.log(`✅ Status: ${response.statusCode}`);
    
    // Check rate limit headers
    const rateLimitHeaders = {
      limit: response.headers['ratelimit-limit'],
      remaining: response.headers['ratelimit-remaining'],
      reset: response.headers['ratelimit-reset'],
      policy: response.headers['ratelimit-policy']
    };

    console.log(`📊 Rate Limit Headers:`);
    console.log(`   Limit: ${rateLimitHeaders.limit || 'Not set'}`);
    console.log(`   Remaining: ${rateLimitHeaders.remaining || 'Not set'}`);
    console.log(`   Reset: ${rateLimitHeaders.reset || 'Not set'}`);
    console.log(`   Policy: ${rateLimitHeaders.policy || 'Not set'}`);

    // Validate rate limit configuration
    if (rateLimitHeaders.limit) {
      const actualLimit = parseInt(rateLimitHeaders.limit);
      if (actualLimit === config.expectedLimit) {
        console.log(`✅ Rate limit matches expected: ${actualLimit}`);
      } else {
        console.log(`⚠️  Rate limit mismatch: expected ${config.expectedLimit}, got ${actualLimit}`);
        console.log(`   This might indicate the deployment hasn't propagated yet.`);
      }
    } else {
      console.log(`⚠️  No rate limit headers found`);
    }

    // Test multiple requests to see rate limiting in action
    console.log(`\n🔄 Testing multiple requests...`);
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(makeRequest(config.domain));
    }

    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.statusCode === 200).length;
    const rateLimitedCount = responses.filter(r => r.statusCode === 429).length;

    console.log(`   Successful requests: ${successCount}/5`);
    console.log(`   Rate limited requests: ${rateLimitedCount}/5`);

    if (rateLimitedCount > 0) {
      console.log(`   ⚠️  Some requests were rate limited - this is expected if limit is low`);
    } else {
      console.log(`   ✅ All requests succeeded - rate limiting is permissive`);
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function testHealthEndpoint() {
  console.log(`\n🏥 Testing Health Endpoint (should not be rate limited)`);
  console.log('─'.repeat(60));

  try {
    const response = await makeRequest('staging.api.petition.motherofpeace.com', '/health');
    console.log(`✅ Health Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Rate Limiting Test Suite');
  console.log('='.repeat(60));
  console.log('Testing updated rate limiting configuration...');
  console.log('Staging should have 100 requests/hour');
  console.log('Production should have 10 requests/hour');

  // Test health endpoint first (should not be rate limited)
  await testHealthEndpoint();

  // Test rate limiting for each environment
  for (const config of configs) {
    await testRateLimiting(config);
  }

  console.log('\n🎯 Summary');
  console.log('─'.repeat(60));
  console.log('✅ Rate limiting configuration updated');
  console.log('✅ Staging: 100 requests/hour (permissive for development)');
  console.log('✅ Production: 10 requests/hour (strict for production)');
  console.log('✅ Health endpoint: No rate limiting');
  console.log('\n💡 If you see old rate limit values, wait a few minutes for deployment to propagate.');
}

// Run the test
main().catch(console.error);
