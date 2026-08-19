import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeHtml, sanitizeObject, escapeHtml } from '../../src/core/utils/sanitize';

describe('Sanitize Utilities', () => {
  describe('sanitizeString', () => {
    it('should sanitize XSS attempts', () => {
      const malicious = '<script>alert("xss")</script>';
      const sanitized = sanitizeString(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should trim whitespace', () => {
      const input = '  test string  ';
      const sanitized = sanitizeString(input);
      expect(sanitized).toBe('test string');
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('should handle non-string input', () => {
      expect(sanitizeString(null as unknown as string)).toBe('');
      expect(sanitizeString(undefined as unknown as string)).toBe('');
      expect(sanitizeString(123 as unknown as string)).toBe('');
    });

    it('should remove HTML tags', () => {
      const input = '<p>Hello</p><b>World</b>';
      const sanitized = sanitizeString(input);
      expect(sanitized).not.toContain('<p>');
      expect(sanitizeString).not.toContain('<b>');
    });
  });

  describe('sanitizeHtml', () => {
    it('should sanitize HTML while preserving structure', () => {
      const input = '<p>Hello <b>World</b></p>';
      const sanitized = sanitizeHtml(input);
      expect(sanitized).toBeTruthy();
    });

    it('should trim whitespace', () => {
      const input = '  <p>test</p>  ';
      const sanitized = sanitizeHtml(input);
      expect(sanitized.trim()).toBe(sanitized);
    });

    it('should handle empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('should handle non-string input', () => {
      expect(sanitizeHtml(null as unknown as string)).toBe('');
      expect(sanitizeHtml(undefined as unknown as string)).toBe('');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize string properties in object', () => {
      const input = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        age: 25,
      };
      const sanitized = sanitizeObject(input);
      expect(sanitized.name).not.toContain('<script>');
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.age).toBe(25);
    });

    it('should sanitize nested objects', () => {
      const input = {
        user: {
          name: '<script>alert("xss")</script>',
          profile: {
            bio: '<b>Bio</b>',
          },
        },
      };
      const sanitized = sanitizeObject(input);
      expect(sanitized.user.name).not.toContain('<script>');
      expect(sanitized.user.profile.bio).toBeTruthy();
    });

    it('should sanitize array elements', () => {
      const input = {
        tags: ['<script>alert("xss")</script>', 'normal', '<b>bold</b>'],
        numbers: [1, 2, 3],
      };
      const sanitized = sanitizeObject(input);
      expect(sanitized.tags[0]).not.toContain('<script>');
      expect(sanitized.tags[1]).toBe('normal');
      expect(sanitized.numbers).toEqual([1, 2, 3]);
    });

    it('should handle empty object', () => {
      const input = {};
      const sanitized = sanitizeObject(input);
      expect(sanitized).toEqual({});
    });

    it('should not mutate original object', () => {
      const input = { name: '<script>test</script>' };
      const sanitized = sanitizeObject(input);
      expect(input.name).toBe('<script>test</script>');
      expect(sanitized.name).not.toContain('<script>');
    });

    it('should handle arrays of objects', () => {
      const input = {
        users: [
          { name: '<script>user1</script>', email: 'user1@test.com' },
          { name: 'user2', email: 'user2@test.com' },
        ],
      };
      const sanitized = sanitizeObject(input);
      expect(sanitized.users[0].name).not.toContain('<script>');
      expect(sanitized.users[1].name).toBe('user2');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      const input = '<div>Hello & "World"</div>';
      const escaped = escapeHtml(input);
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&amp;');
      expect(escaped).toContain('&quot;');
      expect(escaped).not.toContain('<div>');
    });

    it('should escape all HTML special characters', () => {
      const input = '<>&"\'';
      const escaped = escapeHtml(input);
      expect(escaped).toBe('&lt;&gt;&amp;&quot;&#039;');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle non-string input', () => {
      expect(escapeHtml(null as unknown as string)).toBe('');
      expect(escapeHtml(undefined as unknown as string)).toBe('');
      expect(escapeHtml(123 as unknown as string)).toBe('');
    });

    it('should not modify safe strings', () => {
      const input = 'Hello World';
      const escaped = escapeHtml(input);
      expect(escaped).toBe('Hello World');
    });
  });
});

