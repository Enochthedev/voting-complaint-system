/**
 * Input Sanitization Tests
 *
 * Tests for the sanitization utility functions to ensure XSS protection.
 */

import {
  sanitizeHtml,
  sanitizeText,
  sanitizeSvg,
  escapeHtml,
  sanitizeUrl,
  sanitizeFileName,
  sanitizeSearchQuery,
  sanitizeEmail,
  sanitizeJson,
} from '../sanitize';

// Mock window for testing
const mockWindow = () => {
  if (typeof window === 'undefined') {
    (global as any).window = {};
  }
};

describe('sanitizeHtml', () => {
  beforeEach(mockWindow);

  it('should remove script tags', () => {
    const input = '<p>Hello</p><script>alert("XSS")</script>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain('<script>');
    expect(output).toContain('Hello');
  });

  it('should remove event handlers', () => {
    const input = '<img src="x" onerror="alert(\'XSS\')">';
    const output = sanitizeHtml(input);
    expect(output).not.toContain('onerror');
  });

  it('should allow safe HTML tags', () => {
    const input = '<p><strong>Bold</strong> and <em>italic</em></p>';
    const output = sanitizeHtml(input);
    expect(output).toContain('<strong>');
    expect(output).toContain('<em>');
  });

  it('should remove iframe tags', () => {
    const input = '<p>Content</p><iframe src="evil.com"></iframe>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain('<iframe>');
  });

  it('should handle empty input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null as any)).toBe('');
    expect(sanitizeHtml(undefined as any)).toBe('');
  });
});

describe('sanitizeText', () => {
  beforeEach(mockWindow);

  it('should strip all HTML tags', () => {
    const input = '<p>Hello <strong>World</strong></p>';
    const output = sanitizeText(input);
    expect(output).not.toContain('<p>');
    expect(output).not.toContain('<strong>');
    expect(output).toContain('Hello World');
  });

  it('should remove script tags and content', () => {
    const input = 'Text<script>alert("XSS")</script>More text';
    const output = sanitizeText(input);
    expect(output).not.toContain('<script>');
    expect(output).not.toContain('alert');
  });

  it('should handle empty input', () => {
    expect(sanitizeText('')).toBe('');
    expect(sanitizeText(null as any)).toBe('');
  });
});

describe('escapeHtml', () => {
  it('should escape HTML special characters', () => {
    const input = '<script>alert("XSS")</script>';
    const output = escapeHtml(input);
    expect(output).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
  });

  it('should escape ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape quotes', () => {
    expect(escapeHtml('Say "Hello"')).toBe('Say &quot;Hello&quot;');
    expect(escapeHtml("It's fine")).toBe('It&#x27;s fine');
  });
});

describe('sanitizeUrl', () => {
  it('should allow safe protocols', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
  });

  it('should block dangerous protocols', () => {
    expect(sanitizeUrl('javascript:alert("XSS")')).toBe('');
    expect(sanitizeUrl('data:text/html,<script>alert("XSS")</script>')).toBe('');
    expect(sanitizeUrl('vbscript:msgbox("XSS")')).toBe('');
  });

  it('should add https to URLs without protocol', () => {
    expect(sanitizeUrl('example.com')).toBe('https://example.com');
  });

  it('should allow relative URLs', () => {
    expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
    expect(sanitizeUrl('#anchor')).toBe('#anchor');
  });

  it('should handle empty input', () => {
    expect(sanitizeUrl('')).toBe('');
    expect(sanitizeUrl(null as any)).toBe('');
  });
});

describe('sanitizeFileName', () => {
  it('should remove path separators', () => {
    expect(sanitizeFileName('../../../etc/passwd')).toBe('.._.._.._.._etc_passwd');
    expect(sanitizeFileName('path/to/file.txt')).toBe('path_to_file.txt');
  });

  it('should remove leading dots', () => {
    expect(sanitizeFileName('.hidden')).toBe('hidden');
    expect(sanitizeFileName('...file')).toBe('file');
  });

  it('should limit length', () => {
    const longName = 'a'.repeat(300) + '.txt';
    const output = sanitizeFileName(longName);
    expect(output.length).toBeLessThanOrEqual(255);
    expect(output).toContain('.txt');
  });

  it('should handle empty input', () => {
    expect(sanitizeFileName('')).toBe('unnamed');
    expect(sanitizeFileName('.')).toBe('unnamed');
  });
});

describe('sanitizeSearchQuery', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("XSS")</script>search term';
    const output = sanitizeSearchQuery(input);
    expect(output).not.toContain('<script>');
    expect(output).toContain('search term');
  });

  it('should remove special regex characters', () => {
    const input = 'search.*term[0-9]+';
    const output = sanitizeSearchQuery(input);
    expect(output).not.toContain('.*');
    expect(output).not.toContain('[');
  });

  it('should normalize whitespace', () => {
    const input = 'search   term   with    spaces';
    const output = sanitizeSearchQuery(input);
    expect(output).toBe('search term with spaces');
  });
});

describe('sanitizeEmail', () => {
  it('should validate and sanitize valid emails', () => {
    expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
    expect(sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
  });

  it('should reject invalid emails', () => {
    expect(sanitizeEmail('not-an-email')).toBe('');
    expect(sanitizeEmail('missing@domain')).toBe('');
    expect(sanitizeEmail('@example.com')).toBe('');
  });

  it('should remove HTML from emails', () => {
    const input = '<script>alert("XSS")</script>test@example.com';
    const output = sanitizeEmail(input);
    expect(output).not.toContain('<script>');
  });
});

describe('sanitizeJson', () => {
  beforeEach(mockWindow);

  it('should sanitize all string values in an object', () => {
    const input = {
      name: '<script>alert("XSS")</script>John',
      email: 'john@example.com',
      bio: '<p>Hello <strong>World</strong></p>',
    };
    const output = sanitizeJson(input);
    expect(output.name).not.toContain('<script>');
    expect(output.bio).not.toContain('<p>');
  });

  it('should handle nested objects', () => {
    const input = {
      user: {
        name: '<script>XSS</script>',
        profile: {
          bio: '<iframe>evil</iframe>',
        },
      },
    };
    const output = sanitizeJson(input);
    expect(output.user.name).not.toContain('<script>');
    expect(output.user.profile.bio).not.toContain('<iframe>');
  });

  it('should handle arrays', () => {
    const input = {
      tags: ['<script>XSS</script>', 'normal tag', '<img onerror="alert()">'],
    };
    const output = sanitizeJson(input);
    expect(output.tags[0]).not.toContain('<script>');
    expect(output.tags[2]).not.toContain('onerror');
  });

  it('should preserve non-string values', () => {
    const input = {
      name: 'John',
      age: 30,
      active: true,
      score: null,
    };
    const output = sanitizeJson(input);
    expect(output.age).toBe(30);
    expect(output.active).toBe(true);
    expect(output.score).toBe(null);
  });
});
