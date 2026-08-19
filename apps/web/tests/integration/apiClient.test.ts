import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { mockApiError } from '../utils/mockData';

// Mock interceptors to avoid setup issues
jest.mock('@/shared/core/http/interceptors', () => ({
  setupRequestInterceptor: jest.fn(),
  setupResponseInterceptor: jest.fn(),
}));

// Mock axios - must be before any axios imports
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  request: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

const mockAxiosCreate = jest.fn(() => mockAxiosInstance);

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: mockAxiosCreate,
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';

// Import after mocks
import { getApiClient, resetApiClient } from '@/shared/core/http/apiClient';

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the API client instance between tests
    resetApiClient();
    // Reset the mock implementation
    mockAxiosCreate.mockReturnValue(mockAxiosInstance);
  });

  it('should create API client instance', () => {
    const client = getApiClient();
    expect(client).toBeDefined();
  });

  it('should make GET request', async () => {
    const mockData = { success: true, data: { message: 'Hello' } };
    (mockAxiosInstance.get as jest.Mock).mockResolvedValue({ data: mockData });

    const client = getApiClient();
    // The client should be the mocked instance
    expect(client).toBe(mockAxiosInstance);
    
    const response = await client.get('/test');

    expect(response.data).toEqual(mockData);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
  });

  it('should make POST request', async () => {
    const mockData = { success: true, data: { id: '123' } };
    (mockAxiosInstance.post as jest.Mock).mockResolvedValue({ data: mockData });

    const client = getApiClient();
    // The client should be the mocked instance
    expect(client).toBe(mockAxiosInstance);
    
    const response = await client.post('/test', { name: 'Test' });

    expect(response.data).toEqual(mockData);
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', { name: 'Test' }, undefined);
  });

  it('should handle errors', async () => {
    const error = mockApiError('Not found', 404);
    (mockAxiosInstance.get as jest.Mock).mockRejectedValue(error);

    const client = getApiClient();
    
    await expect(client.get('/test')).rejects.toBeDefined();
  });
});

