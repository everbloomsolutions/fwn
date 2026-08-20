'use client';

/**
 * Test page for API client
 * Development only - Not accessible in production
 * Access at /api-test (dev mode only)
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getApiClient } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { transformError, getErrorMessage } from '@/shared/core/error/errorHandler';

export default function TestApiPage() {
  const router = useRouter();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Prevent access in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      router.replace('/');
    }
  }, [router]);
  
  // Don't render in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const testHealthEndpoint = async () => {
    setLoading(true);
    setError(null);
    setResult('');

    try {
      const client = getApiClient();
      const response = await client.get(API_ENDPOINTS.health);

      setResult(JSON.stringify(response.data, null, 2));
    } catch (err) {
      const appError = transformError(err);
      setError(getErrorMessage(appError));
      setResult(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-3xl font-bold">API Client Test</h1>

      <div className="mb-6">
        <button
          onClick={testHealthEndpoint}
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test Health Endpoint'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="rounded bg-bg-muted p-4">
          <h3 className="mb-2 font-bold">Response:</h3>
          <pre className="overflow-auto text-sm">{result}</pre>
        </div>
      )}

      <div className="mt-8 rounded bg-blue-50 p-4">
        <h3 className="mb-2 font-bold">Instructions:</h3>
        <ol className="list-inside list-decimal space-y-1">
          <li>Ensure backend is running on http://localhost:8080</li>
          <li>Click &quot;Test Health Endpoint&quot; button</li>
          <li>Check the response below</li>
          <li>Verify API client is working correctly</li>
        </ol>
      </div>
    </div>
  );
}

