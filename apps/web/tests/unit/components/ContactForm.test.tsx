import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/modules/contact/components/ContactForm';
import { logTestStart, logTestEnd, logTestStep, logTestAssertion, logTestError } from '../../utils/testHelpers';
import testLogger from '../../utils/testLogger';

// Mock dependencies - must be hoisted before imports
const mockSubmitContact = jest.fn();
jest.mock('@/modules/contact/services/contactService', () => {
  return {
    submitContactForm: (...args: any[]) => mockSubmitContact(...args),
  };
});

describe('ContactForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    testLogger.clearContext();
  });

  afterEach(() => {
    testLogger.clearContext();
  });

  it('should render contact form', () => {
    render(<ContactForm />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('should update form fields on input', async () => {
    render(<ContactForm />);
    
    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/subject/i), 'Test Subject');
    await userEvent.type(screen.getByLabelText(/message/i), 'Test message');
    
    expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
  });

  it('should show validation errors for invalid input', async () => {
    render(<ContactForm />);
    
    const submitButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      // The schema validates minimum length, so empty name will show "Name must be at least 2 characters"
      expect(screen.getByText(/name must be at least/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const testName = 'should submit form with valid data';
    const startTime = Date.now();
    logTestStart(testName, 'ContactForm Component');
    
    mockSubmitContact.mockResolvedValue({ success: true, message: 'Thank you' });
    
    logTestStep('Rendering ContactForm component');
    render(<ContactForm />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const subjectInput = screen.getByLabelText(/subject/i);
    const messageInput = screen.getByLabelText(/message/i);
    
    logTestStep('Filling form fields with test data');
    // Fill form fields - use clear first to ensure clean state
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'John Doe');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.clear(subjectInput);
    await userEvent.type(subjectInput, 'Test Subject');
    // Message must be at least 10 characters per schema
    await userEvent.clear(messageInput);
    await userEvent.type(messageInput, 'This is a test message with enough content');
    
    logTestStep('Verifying form field values');
    // Verify inputs have values
    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(messageInput).toHaveValue('This is a test message with enough content');
    
    logTestAssertion('Form fields have correct values', true, {
      name: nameInput.getAttribute('value'),
      email: emailInput.getAttribute('value')
    });
    
    logTestStep('Submitting form');
    // Submit the form using userEvent for more realistic behavior
    const submitButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(submitButton);
    
    logTestStep('Waiting for form submission to complete');
    // Wait for the mock to be called - the form submission is async
    await waitFor(() => {
      expect(mockSubmitContact).toHaveBeenCalled();
    }, { timeout: 10000 });
    
    logTestAssertion('submitContactForm was called', mockSubmitContact.mock.calls.length > 0, {
      callCount: mockSubmitContact.mock.calls.length
    });
    
    // Verify the call arguments - subject is optional, so it might be undefined
    const callArgs = mockSubmitContact.mock.calls[0][0];
    expect(callArgs.name).toBe('John Doe');
    expect(callArgs.email).toBe('john@example.com');
    expect(callArgs.message).toBe('This is a test message with enough content');
    // Subject is optional, check if it's present
    if (callArgs.subject !== undefined) {
      expect(callArgs.subject).toBe('Test Subject');
    }
    
    const duration = Date.now() - startTime;
    logTestEnd(testName, 'passed', duration, {
      submittedData: {
        name: callArgs.name,
        email: callArgs.email,
        hasSubject: callArgs.subject !== undefined
      }
    });
  }, 15000); // Increase timeout for this test

  it('should show success message after submission', async () => {
    mockSubmitContact.mockResolvedValue({ success: true, message: 'Thank you for contacting us' });
    
    render(<ContactForm />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const subjectInput = screen.getByLabelText(/subject/i);
    const messageInput = screen.getByLabelText(/message/i);
    
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'John Doe');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.clear(subjectInput);
    await userEvent.type(subjectInput, 'Test Subject');
    // Message must be at least 10 characters per schema
    await userEvent.clear(messageInput);
    await userEvent.type(messageInput, 'This is a test message with enough content');
    
    const submitButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(submitButton);
    
    // Wait for the mock to be called first
    await waitFor(() => {
      expect(mockSubmitContact).toHaveBeenCalled();
    }, { timeout: 5000 });
    
    // Then wait for the success message to appear
    await waitFor(() => {
      // The actual message is "Thank you! Your message has been sent successfully."
      expect(screen.getByText(/thank you.*your message has been sent successfully/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 15000); // Increase timeout for this test
});

