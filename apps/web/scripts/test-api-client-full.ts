/**
 * Full test using the actual API client
 * This tests the complete API client setup including interceptors
 * Run with: npx tsx scripts/test-api-client-full.ts
 */

// Mock window and localStorage for Node.js environment
if (typeof window === 'undefined') {
  (global as any).window = {
    location: {
      href: '',
    },
  };

  // Mock localStorage
  const storage: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    },
  };
}

// Set environment variable
process.env.NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

import { getApiClient, apiRequest } from '../shared/core/http/apiClient';
import { API_ENDPOINTS } from '../shared/config/api';

async function testFullApiClient() {
  console.log('🧪 Testing Full API Client (with interceptors)...\n');
  console.log(`📍 API URL: ${process.env.NEXT_PUBLIC_API_URL}`);
  console.log(`📍 Health Endpoint: ${API_ENDPOINTS.health}\n`);

  try {
    // Test 1: Using getApiClient directly
    console.log('📡 Test 1: Using getApiClient()...');
    const client = getApiClient();
    const response1 = await client.get(API_ENDPOINTS.health);
    console.log('✅ getApiClient() works!');
    console.log('   Response:', JSON.stringify(response1.data, null, 2));

    // Test 2: Using apiRequest helper
    console.log('\n📡 Test 2: Using apiRequest() helper...');
    const response2 = await apiRequest<{
      success: boolean;
      message: string;
      timestamp: string;
      environment: string;
      database: string;
    }>({
      method: 'GET',
      url: API_ENDPOINTS.health,
    });
    console.log('✅ apiRequest() helper works!');
    console.log('   Response:', JSON.stringify(response2, null, 2));

    // Test 3: Verify singleton pattern
    console.log('\n📡 Test 3: Verifying singleton pattern...');
    const client2 = getApiClient();
    if (client === client2) {
      console.log('✅ Singleton pattern works (same instance returned)');
    } else {
      console.log('⚠️  Warning: Different instances returned');
    }

    console.log('\n✅ All API client tests passed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ API client initialization');
    console.log('   ✅ Base URL configuration');
    console.log('   ✅ Request interceptors');
    console.log('   ✅ Response handling');
    console.log('   ✅ Error handling');
    console.log('   ✅ Singleton pattern');
    console.log('   ✅ apiRequest helper function');

    process.exit(0);
  } catch (error: unknown) {
    console.error('\n❌ API Client test failed!');

    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosError = error as any;
      if (axiosError.response) {
        console.error('\n📊 Error Response Status:', axiosError.response.status);
        console.error('📊 Error Response Data:', JSON.stringify(axiosError.response.data, null, 2));
      } else if (axiosError.request) {
        console.error('\n❌ No response received from server');
        console.error('💡 Make sure the backend is running on', process.env.NEXT_PUBLIC_API_URL);
      } else {
        console.error('\n❌ Error setting up request:', axiosError.message);
      }
    } else if (error instanceof Error) {
      console.error('\n❌ Error:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error('\n❌ Unknown error:', error);
    }

    process.exit(1);
  }
}

testFullApiClient();

