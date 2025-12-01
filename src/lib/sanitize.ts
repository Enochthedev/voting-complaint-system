/**
 * Input Sanitization Utilities
 *
 * Provides functions to sanitize user input and prevent XSS attacks.
 * Uses DOMPurify for HTML sanitization.
 *
 * Security Requirements:
 * - NFR2: Security - XSS protection
 * - All user-generated HTML content must be sanitized before rendering
 * - All text input should be escaped when displayed
 */

// Lazy import DOMPurify only on client side
let DOMPurify: any = null;

// Initialize DOMPurify only in browser environment
if (typeof window !== 'undefined') {
  import('dompurify').then((module) => {
    DOMPurify = module.default;
  });
}

/**
 * Configuration for DOMPurify based on content type
 */
const SANITIZE_CONFIG = {
  // For rich text content (complaints, feedback, comments)
  richText: {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'code',
      'pre',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'blockquote',
      'a',
    ] as string[],
    ALLOWED_ATTR: ['href', 'target', 'rel'] as string[],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  },
  // For plain text that should have no HTML
  plainText: {
    ALLOWED_TAGS: [] as string[],
    ALLOWED_ATTR: [] as string[],
    KEEP_CONTENT: true,
  },
  // For SVG content (avatars)
  svg: {
    ALLOWED_TAGS: ['svg', 'path', 'circle', 'rect', 'g', 'defs', 'use'] as string[],
    ALLOWED_ATTR: [
      'viewBox',
      'xmlns',
      'width',
      'height',
      'fill',
      'stroke',
      'd',
      'cx',
      'cy',
      'r',
      'x',
      'y',
      'transform',
      'id',
    ] as string[],
    ALLOW_DATA_ATTR: false,
  },
};

/**
 * Sanitize HTML content for rich text display
 *
 * Use this for content from rich text editors (complaints, feedback, etc.)
 * Allows safe HTML tags while removing potentially dangerous content.
 *
 * @param html - Raw HTML string from user input
 * @returns Sanitized HTML safe for rendering
 *
 * @example
 * ```tsx
 * const cleanHtml = sanitizeHtml(userInput);
 * <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
 * ```
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !DOMPurify) {
    // Server-side: strip all HTML tags
    return html.replace(/<[^>]*>/g, '');
  }

  return DOMPurify.sanitize(html, SANITIZE_CONFIG.richText);
}

/**
 * Sanitize text input by stripping all HTML tags
 *
 * Use this for plain text fields (titles, names, etc.)
 * Removes all HTML but keeps the text content.
 *
 * @param text - Raw text that might contain HTML
 * @returns Plain text with HTML removed
 *
 * @example
 * ```tsx
 * const cleanText = sanitizeText(userInput);
 * <h1>{cleanText}</h1>
 * ```
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !DOMPurify) {
    // Server-side: strip HTML tags
    return text.replace(/<[^>]*>/g, '');
  }

  return DOMPurify.sanitize(text, SANITIZE_CONFIG.plainText);
}

/**
 * Sanitize SVG content
 *
 * Use this for SVG avatars and icons from external sources.
 * Allows only safe SVG elements and attributes.
 *
 * @param svg - Raw SVG string
 * @returns Sanitized SVG safe for rendering
 *
 * @example
 * ```tsx
 * const cleanSvg = sanitizeSvg(avatarSvg);
 * <div dangerouslySetInnerHTML={{ __html: cleanSvg }} />
 * ```
 */
export function sanitizeSvg(svg: string): string {
  if (!svg || typeof svg !== 'string') {
    return '';
  }

  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !DOMPurify) {
    // Server-side: return empty string for safety
    return '';
  }

  return DOMPurify.sanitize(svg, SANITIZE_CONFIG.svg);
}

/**
 * Escape HTML special characters in text
 *
 * Use this as an alternative to sanitizeText when you want to
 * preserve the original text but make it safe for HTML display.
 *
 * @param text - Text to escape
 * @returns Escaped text safe for HTML
 *
 * @example
 * ```tsx
 * const escaped = escapeHtml(userInput);
 * <p>{escaped}</p>
 * ```
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Validate and sanitize URL
 *
 * Ensures URLs are safe and use allowed protocols.
 * Prevents javascript: and data: URLs.
 *
 * @param url - URL to validate
 * @returns Sanitized URL or empty string if invalid
 *
 * @example
 * ```tsx
 * const safeUrl = sanitizeUrl(userProvidedUrl);
 * if (safeUrl) {
 *   <a href={safeUrl}>Link</a>
 * }
 * ```
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Trim whitespace
  url = url.trim();

  // Check for dangerous protocols
  const dangerousProtocols = /^(javascript|data|vbscript|file):/i;
  if (dangerousProtocols.test(url)) {
    return '';
  }

  // Allow only safe protocols
  const safeProtocols = /^(https?|mailto|tel|sms):/i;
  if (!safeProtocols.test(url) && !url.startsWith('/') && !url.startsWith('#')) {
    // If no protocol and not a relative URL, assume https
    url = 'https://' + url;
  }

  return url;
}

/**
 * Sanitize file name
 *
 * Removes potentially dangerous characters from file names.
 * Prevents path traversal attacks.
 *
 * @param fileName - Original file name
 * @returns Sanitized file name
 *
 * @example
 * ```tsx
 * const safeName = sanitizeFileName(uploadedFile.name);
 * ```
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return 'unnamed';
  }

  // Remove path separators and null bytes
  let sanitized = fileName.replace(/[/\\:\0]/g, '_');

  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '');

  // Limit length
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const ext = sanitized.split('.').pop() || '';
    const nameWithoutExt = sanitized.substring(0, sanitized.length - ext.length - 1);
    sanitized = nameWithoutExt.substring(0, maxLength - ext.length - 1) + '.' + ext;
  }

  // If empty after sanitization, use default
  if (!sanitized || sanitized === '.') {
    return 'unnamed';
  }

  return sanitized;
}

/**
 * Sanitize search query
 *
 * Removes special characters that could interfere with search
 * while preserving the search intent.
 *
 * @param query - Search query string
 * @returns Sanitized search query
 *
 * @example
 * ```tsx
 * const safeQuery = sanitizeSearchQuery(userSearchInput);
 * ```
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = query.replace(/<[^>]*>/g, '');

  // Remove special regex characters that could cause issues
  sanitized = sanitized.replace(/[\\^$*+?.()|[\]{}]/g, '');

  // Trim and normalize whitespace
  sanitized = sanitized.trim().replace(/\s+/g, ' ');

  return sanitized;
}

/**
 * Validate and sanitize email address
 *
 * Basic email validation and sanitization.
 *
 * @param email - Email address to validate
 * @returns Sanitized email or empty string if invalid
 *
 * @example
 * ```tsx
 * const safeEmail = sanitizeEmail(userEmail);
 * ```
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Trim and lowercase
  email = email.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '';
  }

  // Remove any HTML
  email = email.replace(/<[^>]*>/g, '');

  return email;
}

/**
 * Sanitize JSON data
 *
 * Recursively sanitizes all string values in a JSON object.
 * Useful for sanitizing form data before submission.
 *
 * @param data - Object to sanitize
 * @param sanitizer - Function to use for sanitizing strings (default: sanitizeText)
 * @returns Sanitized object
 *
 * @example
 * ```tsx
 * const cleanData = sanitizeJson(formData);
 * ```
 */
export function sanitizeJson<T>(data: T, sanitizer: (text: string) => string = sanitizeText): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizer(data) as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeJson(item, sanitizer)) as T;
  }

  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeJson(value, sanitizer);
    }
    return sanitized as T;
  }

  return data;
}
