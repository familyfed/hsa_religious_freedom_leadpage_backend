#!/usr/bin/env node

/**
 * Comprehensive Turnstile Configuration Debugging Script
 * Tests all aspects of Turnstile configuration and verification
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const config = {
  siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  secretKey: process.env.TURNSTILE_SECRET_KEY,
  nodeEnv: process.env.NODE_ENV || 'development',
  stagingUrl: 'https://staging.api.petition.motherofpeace.com',
  productionUrl: 'https://api.petition.motherofpeace.com'
};

console.log('🔍 TURNSTILE CONFIGURATION DEBUGGING\n');
console.log('=' .repeat(50));

// 1. Check Environment Variables
console.log('\n📋 1. ENVIRONMENT VARIABLES CHECK');
console.log('-'.repeat(30));

console.log(`NODE_ENV: ${config.nodeEnv}`);
console.log(`Site Key: ${config.siteKey ? '✅ Set' : '❌ Missing'}`);
console.log(`Secret Key: ${config.secretKey ? '✅ Set' : '❌ Missing'}`);

if (config.secretKey) {
  console.log(`Secret Key Length: ${config.secretKey.length} characters`);
  console.log(`Secret Key Preview: ${config.secretKey.substring(0, 8)}...`);
}

// 2. Test Turnstile Verification Endpoint
console.log('\n🧪 2. TURNSTILE VERIFICATION ENDPOINT TEST');
console.log('-'.repeat(40));

async function testTurnstileVerification() {
  if (!config.secretKey) {
    console.log('❌ Cannot test - Secret key not configured');
    return;
  }

  try {
    // Test with a dummy token to see what error we get
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: config.secretKey,
        response: 'test_token_123',
        remoteip: '127.0.0.1',
      }),
    });

    const result = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));
    
    if (result['error-codes']) {
      console.log('\n🔍 Error Code Analysis:');
      result['error-codes'].forEach(code => {
        switch (code) {
          case 'invalid-input-secret':
            console.log('  ❌ Invalid secret key - Check TURNSTILE_SECRET_KEY');
            break;
          case 'invalid-input-response':
            console.log('  ❌ Invalid token - Expected for test token');
            break;
          case 'timeout-or-duplicate':
            console.log('  ❌ Token expired or already used - Expected for test token');
            break;
          case 'internal-error':
            console.log('  ❌ Cloudflare internal error - Try again later');
            break;
          default:
            console.log(`  ❓ Unknown error: ${code}`);
        }
      });
    }
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
}

// Main execution function
async function main() {
  await testTurnstileVerification();

  // 3. Test Backend API Endpoints
console.log('\n🌐 3. BACKEND API ENDPOINTS TEST');
console.log('-'.repeat(35));

async function testBackendEndpoint(url, name) {
  try {
    console.log(`\nTesting ${name}: ${url}`);
    
    // Test health endpoint
    const healthResponse = await fetch(`${url}/health`);
    const healthData = await healthResponse.json();
    console.log(`  Health: ${healthResponse.status} - ${healthData.ok ? '✅' : '❌'}`);
    
    // Test stats endpoint
    const statsResponse = await fetch(`${url}/api/petitions/petition-for-the-mother-of-peace/stats`);
    const statsData = await statsResponse.json();
    console.log(`  Stats: ${statsResponse.status} - ${statsData.ok ? '✅' : '❌'}`);
    
    if (!statsData.ok) {
      console.log(`    Error: ${statsData.error}`);
    }
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

await testBackendEndpoint(config.stagingUrl, 'Staging');
await testBackendEndpoint(config.productionUrl, 'Production');

// 4. Test Turnstile Integration with Backend
console.log('\n🔐 4. TURNSTILE INTEGRATION TEST');
console.log('-'.repeat(35));

async function testTurnstileIntegration() {
  const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    country: 'US',
    city: 'Test City',
    state: 'CA',
    consent_news: true,
    turnstileToken: 'test_token_123' // This should be bypassed
  };

  try {
    console.log('\nTesting with test token (should be bypassed):');
    const response = await fetch(`${config.stagingUrl}/api/petitions/petition-for-the-mother-of-peace/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log(`  Status: ${response.status}`);
    console.log(`  Response:`, JSON.stringify(result, null, 2));
    
    if (result.ok) {
      console.log('  ✅ Test token bypass working');
    } else {
      console.log('  ❌ Test token bypass not working');
    }
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

await testTurnstileIntegration();

// 5. Check Turnstile Dashboard Configuration
console.log('\n📊 5. TURNSTILE DASHBOARD CONFIGURATION CHECK');
console.log('-'.repeat(45));

console.log('Please verify in Cloudflare Turnstile Dashboard:');
console.log('');
console.log('✅ Site Key matches: 0x4AAAAAAABkMYinukE8nzY');
console.log('✅ Secret Key matches environment variable');
console.log('✅ Domains include:');
console.log('   - petition.motherofpeace.com');
console.log('   - staging.petition.motherofpeace.com');
console.log('   - localhost (for development)');
console.log('✅ Status is Active');
console.log('✅ No rate limiting enabled');

// 6. Recommendations
console.log('\n💡 6. RECOMMENDATIONS');
console.log('-'.repeat(20));

console.log('If Turnstile verification is failing:');
console.log('');
console.log('1. 🔑 Check Secret Key:');
console.log('   - Verify TURNSTILE_SECRET_KEY is set correctly');
console.log('   - Ensure it matches the secret key in Turnstile dashboard');
console.log('   - Check if staging uses different secret key than production');
console.log('');
console.log('2. 🌐 Check Domain Configuration:');
console.log('   - Add staging.petition.motherofpeace.com to Turnstile dashboard');
console.log('   - Ensure domain matches exactly (no trailing slashes)');
console.log('');
console.log('3. 🔄 Check Environment Variables:');
console.log('   - Verify staging environment has correct TURNSTILE_SECRET_KEY');
console.log('   - Check if production key is being used by mistake');
console.log('');
console.log('4. 🧪 Test Manually:');
console.log('   - Use the curl command provided in the frontend guide');
console.log('   - Test with a fresh token from the frontend');
console.log('');

  console.log('=' .repeat(50));
  console.log('🎯 Debugging complete! Check the recommendations above.');
}

// Run the main function
main().catch(console.error);
