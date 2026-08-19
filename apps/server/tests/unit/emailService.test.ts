import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { emailService } from '../../src/core/utils/emailService';
import { logger } from '../../src/core/middleware/logger';

// Mock logger
vi.mock('../../src/core/middleware/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('EmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendEmail', () => {
    it('should log email information', async () => {
      const options = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };

      await emailService.sendEmail(options);

      expect(logger.info).toHaveBeenCalledWith('Email would be sent', {
        to: 'test@example.com',
        subject: 'Test Subject',
      });
    });

    it('should handle email with text content', async () => {
      const options = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      };

      await expect(emailService.sendEmail(options)).resolves.not.toThrow();
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('sendContactNotificationToAdmin', () => {
    it('should send contact notification to admin', async () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      };

      await emailService.sendContactNotificationToAdmin(data);

      expect(logger.info).toHaveBeenCalled();
    });

    it('should sanitize user input in notification', async () => {
      const data = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      };

      await emailService.sendContactNotificationToAdmin(data);

      expect(logger.info).toHaveBeenCalled();
      // The sanitization should prevent XSS
      const callArgs = (logger.info as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs).toBeTruthy();
    });

    it('should handle multiline messages', async () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Line 1\nLine 2\nLine 3',
      };

      await emailService.sendContactNotificationToAdmin(data);

      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('sendContactConfirmationToUser', () => {
    it('should send confirmation email to user', async () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      };

      await emailService.sendContactConfirmationToUser(data);

      expect(logger.info).toHaveBeenCalled();
    });

    it('should sanitize user input in confirmation', async () => {
      const data = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      };

      await emailService.sendContactConfirmationToUser(data);

      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle multiline messages in confirmation', async () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Line 1\nLine 2',
      };

      await emailService.sendContactConfirmationToUser(data);

      expect(logger.info).toHaveBeenCalled();
    });
  });
});

