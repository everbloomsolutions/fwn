/**
 * Node.js script to test API client
 * Run with: npx tsx scripts/test-api-client.ts
 * Or: node --loader tsx scripts/test-api-client.ts
 */

import axios from 'axios';

// Set environment variable if not set
process.env.NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const HEALTH_ENDPOINT = '/health';

async function testApiClient() {
  console.log('🧪 Testing API Client...\n');
  console.log(`📍 API URL: ${API_URL}`);
  console.log(`📍 Health Endpoint: ${HEALTH_ENDPOINT}\n`);

  try {
    // Create axios instance (simulating API client)
    const client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Making request to health endpoint...\n');

    const response = await client.get(HEALTH_ENDPOINT);

    console.log('✅ API Client test successful!');
    console.log('\n📦 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n📊 Response Status:', response.status);
    console.log('📊 Response Headers:', JSON.stringify(response.headers, null, 2));

    // Verify response structure
    if (response.data.success === true) {
      console.log('\n✅ Response structure is correct!');
    } else {
      console.log('\n⚠️  Warning: Response structure may be unexpected');
    }

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error: unknown) {
    console.error('\n❌ API Client test failed!');
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('\n📊 Error Response Status:', error.response.status);
        console.error('📊 Error Response Data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('\n❌ No response received from server');
        console.error('💡 Make sure the backend is running on', API_URL);
      } else {
        console.error('\n❌ Error setting up request:', error.message);
      }
    } else if (error instanceof Error) {
      console.error('\n❌ Error:', error.message);
    } else {
      console.error('\n❌ Unknown error:', error);
    }

    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testApiClient();
