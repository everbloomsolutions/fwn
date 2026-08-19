import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sleep, formatError } from '../../src/core/utils/index';

describe('Utility Functions', () => {
  describe('sleep', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should resolve after specified milliseconds', async () => {
      const promise = sleep(1000);
      vi.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
    });

    it('should wait for correct duration', async () => {
      const start = Date.now();
      const promise = sleep(500);
      vi.advanceTimersByTime(500);
      await promise;
      const end = Date.now();
      // With fake timers, this should be instant
      expect(end - start).toBeLessThan(100);
    });

    it('should handle zero delay', async () => {
      const promise = sleep(0);
      vi.advanceTimersByTime(0);
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('formatError', () => {
    it('should format Error instance', () => {
      const error = new Error('Test error message');
      const formatted = formatError(error);
      expect(formatted).toBe('Test error message');
    });

    it('should format string error', () => {
      const error = 'String error';
      const formatted = formatError(error);
      expect(formatted).toBe('String error');
    });

    it('should format number error', () => {
      const error = 404;
      const formatted = formatError(error);
      expect(formatted).toBe('404');
    });

    it('should format null error', () => {
      const formatted = formatError(null);
      expect(formatted).toBe('null');
    });

    it('should format undefined error', () => {
      const formatted = formatError(undefined);
      expect(formatted).toBe('undefined');
    });

    it('should format object error', () => {
      const error = { code: 500, message: 'Internal error' };
      const formatted = formatError(error);
      expect(formatted).toContain('code');
    });
  });
});

