/**
 * Mock data for frontend tests
 */

export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user' as const,
  isActive: true,
  onboardingCompleted: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockAdminUser = {
  ...mockUser,
  _id: '507f1f77bcf86cd799439012',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin' as const,
};

export const mockProject = {
  _id: '507f1f77bcf86cd799439013',
  userId: mockUser._id,
  serviceType: 'electrical' as const,
  title: 'Test Project',
  description: 'Test Description',
  status: 'pending' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockNotification = {
  _id: '507f1f77bcf86cd799439014',
  user: mockUser._id,
  title: 'Test Notification',
  message: 'Test message',
  type: 'info' as const,
  isRead: false,
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const mockContactForm = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Test Subject',
  message: 'Test message content',
  phoneNumber: '+1234567890',
};

export const mockApiResponse = <T,>(data: T, success: boolean = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
});

export const mockApiError = (message: string, status: number = 400) => ({
  success: false,
  message,
  status,
  errors: [],
});

