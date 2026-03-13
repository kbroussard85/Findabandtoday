import { describe, it, expect } from 'vitest';
import { sanitize, sanitizeObject } from '../sanitizer';

describe('Sanitizer Utility', () => {
  describe('sanitize', () => {
    it('should allow safe HTML tags', () => {
      const input = '<p><b>Bold</b> <i>Italic</i> <em>Em</em> <strong>Strong</strong><br /></p>';
      expect(sanitize(input)).toBe(input);
    });

    it('should remove unsafe HTML tags', () => {
      const input = 'Hello <script>alert("xss")</script><img src="x" onerror="alert(1)"> world';
      expect(sanitize(input)).toBe('Hello  world');
    });

    it('should remove unsafe attributes', () => {
      const input = '<p style="color: red" onclick="alert(1)">Text</p>';
      expect(sanitize(input)).toBe('<p>Text</p>');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize strings in an object', () => {
      const input = {
        name: '<b>Name</b>',
        bio: '<script>alert(1)</script>Bio',
        nested: {
          text: '<i>Italic</i>',
        },
      };
      const expected = {
        name: '<b>Name</b>',
        bio: 'Bio',
        nested: {
          text: '<i>Italic</i>',
        },
      };
      expect(sanitizeObject(input)).toEqual(expected);
    });

    it('should sanitize strings in an array', () => {
      const input = ['<b>One</b>', '<script>alert(1)</script>Two'];
      const expected = ['<b>One</b>', 'Two'];
      expect(sanitizeObject(input)).toEqual(expected);
    });

    it('should return non-string/non-object values as-is', () => {
      const input = {
        count: 10,
        active: true,
        none: null,
      };
      expect(sanitizeObject(input)).toEqual(input);
    });

    it('should sanitize a direct string input', () => {
      expect(sanitizeObject('<b>Test</b>')).toBe('<b>Test</b>');
    });

    it('should return null if input is null', () => {
      expect(sanitizeObject(null)).toBe(null);
    });

    it('should return non-object/non-string values as-is', () => {
      expect(sanitizeObject(123)).toBe(123);
      expect(sanitizeObject(true)).toBe(true);
    });
  });
});
