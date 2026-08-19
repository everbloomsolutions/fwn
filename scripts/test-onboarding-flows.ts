/**
 * Manual test script for onboarding flows
 * Run with: tsx scripts/test-onboarding-flows.ts
 */

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const BASE_URL = `${API_BASE}/api/v1`;

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
  results.push(result);
  const status = result.passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${result.name}`);
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
  if (result.data) {
    console.log(`   Data:`, JSON.stringify(result.data, null, 2));
  }
}

async function testTraditionalRegistration() {
  console.log('\n📝 Testing Traditional Registration Flow...\n');
  
  const email = `test-traditional-${Date.now()}@example.com`;
  const password = 'Test1234';
  const name = 'Test User';

  try {
    // 1. Register new user
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email,
      password,
      name,
    });

    if (registerResponse.status !== 201) {
      logResult({
        name: 'Traditional Registration - Status Code',
        passed: false,
        error: `Expected 201, got ${registerResponse.status}`,
      });
      return;
    }

    if (!registerResponse.data.success) {
      logResult({
        name: 'Traditional Registration - Success Flag',
        passed: false,
        error: 'Response success flag is false',
      });
      return;
    }

    if (!registerResponse.data.data.isNewUser) {
      logResult({
        name: 'Traditional Registration - isNewUser Flag',
        passed: false,
        error: 'isNewUser should be true for new registration',
      });
      return;
    }

    logResult({
      name: 'Traditional Registration - Complete',
      passed: true,
      data: {
        email: registerResponse.data.data.user.email,
        isNewUser: registerResponse.data.data.isNewUser,
        hasToken: !!registerResponse.data.data.token,
      },
    });

    const token = registerResponse.data.data.token;

    // 2. Check onboarding status
    const statusResponse = await axios.get(`${BASE_URL}/profile/onboarding/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (statusResponse.data.data.onboardingCompleted !== false) {
      logResult({
        name: 'Traditional Registration - Initial Onboarding Status',
        passed: false,
        error: 'New user should have onboardingCompleted = false',
      });
    } else {
      logResult({
        name: 'Traditional Registration - Initial Onboarding Status',
        passed: true,
        data: statusResponse.data.data,
      });
    }

    // 3. Update profile
    const updateResponse = await axios.patch(
      `${BASE_URL}/profile/onboarding/profile`,
      {
        phoneNumber: '+1234567890',
        company: 'Test Company',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (updateResponse.status === 200) {
      logResult({
        name: 'Traditional Registration - Profile Update',
        passed: true,
        data: {
          phoneNumber: updateResponse.data.data.user.phoneNumber,
          company: updateResponse.data.data.user.company,
        },
      });
    } else {
      logResult({
        name: 'Traditional Registration - Profile Update',
        passed: false,
        error: `Expected 200, got ${updateResponse.status}`,
      });
    }

    // 4. Complete onboarding
    const completeResponse = await axios.post(
      `${BASE_URL}/profile/onboarding/complete`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (completeResponse.status === 200) {
      logResult({
        name: 'Traditional Registration - Complete Onboarding',
        passed: true,
      });

      // 5. Verify completion
      const finalStatusResponse = await axios.get(
        `${BASE_URL}/profile/onboarding/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (finalStatusResponse.data.data.onboardingCompleted === true) {
        logResult({
          name: 'Traditional Registration - Verify Completion',
          passed: true,
          data: finalStatusResponse.data.data,
        });
      } else {
        logResult({
          name: 'Traditional Registration - Verify Completion',
          passed: false,
          error: 'Onboarding should be marked as completed',
        });
      }
    } else {
      logResult({
        name: 'Traditional Registration - Complete Onboarding',
        passed: false,
        error: `Expected 200, got ${completeResponse.status}`,
      });
    }

    // 6. Test login (should not be new user)
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });

    if (loginResponse.data.data.isNewUser !== false) {
      logResult({
        name: 'Traditional Registration - Login isNewUser',
        passed: false,
        error: 'Existing user login should have isNewUser = false',
      });
    } else {
      logResult({
        name: 'Traditional Registration - Login isNewUser',
        passed: true,
      });
    }

  } catch (error: any) {
    logResult({
      name: 'Traditional Registration - Error',
      passed: false,
      error: error.message || 'Unknown error',
    });
  }
}

async function testOnboardingSkip() {
  console.log('\n⏭️  Testing Skip Functionality...\n');

  const email = `test-skip-${Date.now()}@example.com`;
  const password = 'Test1234';

  try {
    // 1. Register user
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email,
      password,
    });

    const token = registerResponse.data.data.token;

    // 2. Check status (should be incomplete)
    const statusResponse = await axios.get(`${BASE_URL}/profile/onboarding/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (statusResponse.data.data.onboardingCompleted === false) {
      logResult({
        name: 'Skip Functionality - Initial Status',
        passed: true,
        data: { onboardingCompleted: false },
      });
    } else {
      logResult({
        name: 'Skip Functionality - Initial Status',
        passed: false,
        error: 'New user should have incomplete onboarding',
      });
    }

    // 3. Skip onboarding by completing without updating profile
    const completeResponse = await axios.post(
      `${BASE_URL}/profile/onboarding/complete`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (completeResponse.status === 200) {
      logResult({
        name: 'Skip Functionality - Complete Without Profile',
        passed: true,
        data: { message: 'Onboarding can be completed without profile update' },
      });
    } else {
      logResult({
        name: 'Skip Functionality - Complete Without Profile',
        passed: false,
        error: `Expected 200, got ${completeResponse.status}`,
      });
    }

  } catch (error: any) {
    logResult({
      name: 'Skip Functionality - Error',
      passed: false,
      error: error.message || 'Unknown error',
    });
  }
}

async function runTests() {
  console.log('🧪 Starting Onboarding Flow Tests\n');
  console.log(`API Base URL: ${BASE_URL}\n`);

  await testTraditionalRegistration();
  await testOnboardingSkip();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(50));

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

