# Input Sanitization Implementation

## Overview

This document describes the input sanitization implementation for the Student Complaint Resolution System. Input sanitization is a critical security measure that prevents Cross-Site Scripting (XSS) attacks and other injection vulnerabilities.

## Security Requirements

**NFR2: Security**

- All user data encrypted in transit and at rest
- Anonymous complaints maintain student privacy
- Role-based access control enforced
- **SQL injection and XSS protection** ✅

## Implementation

### Sanitization Library

We use **DOMPurify** for HTML sanitization:

- Industry-standard library for XSS prevention
- Actively maintained and regularly updated
- Configurable to allow safe HTML while blocking dangerous content
- Works in both browser and Node.js environments

### Installation

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

### Core Sanitization Module

Location: `src/lib/sanitize.ts`

This module provides comprehensive sanitization functions for different types of user input:

#### 1. `sanitizeHtml(html: string): string`

**Purpose**: Sanitize rich text content from editors (complaints, feedback, comments)

**Allowed HTML Tags**:

- Text formatting: `<p>`, `<br>`, `<strong>`, `<em>`, `<u>`, `<s>`, `<code>`, `<pre>`
- Headings: `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
- Lists: `<ul>`, `<ol>`, `<li>`
- Quotes: `<blockquote>`
- Links: `<a>` (with href, target, rel attributes)

**Blocked Content**:

- Script tags and event handlers
- Iframes and embeds
- Form elements
- Dangerous protocols (javascript:, data:, etc.)

**Usage**:

```tsx
import { sanitizeHtml } from '@/lib/sanitize';

const cleanHtml = sanitizeHtml(userInput);
<div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
```

#### 2. `sanitizeText(text: string): string`

**Purpose**: Strip all HTML from plain text fields (titles, names, tags)

**Behavior**:

- Removes all HTML tags
- Keeps text content
- Safe for display in any context

**Usage**:

```tsx
import { sanitizeText } from '@/lib/sanitize';

const cleanText = sanitizeText(userInput);
<h1>{cleanText}</h1>;
```

#### 3. `sanitizeSvg(svg: string): string`

**Purpose**: Sanitize SVG content (avatars, icons)

**Allowed SVG Elements**:

- `<svg>`, `<path>`, `<circle>`, `<rect>`, `<g>`, `<defs>`, `<use>`

**Allowed Attributes**:

- `viewBox`, `xmlns`, `width`, `height`, `fill`, `stroke`
- `d`, `cx`, `cy`, `r`, `x`, `y`, `transform`, `id`

**Usage**:

```tsx
import { sanitizeSvg } from '@/lib/sanitize';

const cleanSvg = sanitizeSvg(avatarSvg);
<div dangerouslySetInnerHTML={{ __html: cleanSvg }} />;
```

#### 4. `escapeHtml(text: string): string`

**Purpose**: Escape HTML special characters

**Escapes**:

- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#x27;`
- `/` → `&#x2F;`

#### 5. `sanitizeUrl(url: string): string`

**Purpose**: Validate and sanitize URLs

**Allowed Protocols**:

- `https://`, `http://`, `mailto:`, `tel:`, `sms:`

**Blocked Protocols**:

- `javascript:`, `data:`, `vbscript:`, `file:`

#### 6. `sanitizeFileName(fileName: string): string`

**Purpose**: Remove dangerous characters from file names

**Removes**:

- Path separators (`/`, `\`, `:`)
- Null bytes
- Leading dots (hidden files)

**Limits**: 255 characters

#### 7. `sanitizeSearchQuery(query: string): string`

**Purpose**: Clean search queries

**Removes**:

- HTML tags
- Special regex characters
- Normalizes whitespace

#### 8. `sanitizeEmail(email: string): string`

**Purpose**: Validate and sanitize email addresses

**Behavior**:

- Trims and lowercases
- Validates format
- Removes HTML

#### 9. `sanitizeJson<T>(data: T, sanitizer?): T`

**Purpose**: Recursively sanitize all strings in an object

**Usage**:

```tsx
const cleanData = sanitizeJson(formData);
```

## Component Integration

### 1. Complaint Description

**File**: `src/components/complaints/complaint-detail/ComplaintDescription.tsx`

```tsx
import { sanitizeHtml } from '@/lib/sanitize';

export function ComplaintDescription({ description }: Props) {
  const sanitizedDescription = React.useMemo(() => sanitizeHtml(description), [description]);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />;
}
```

### 2. Feedback Display

**File**: `src/components/complaints/feedback-display.tsx`

```tsx
import { sanitizeHtml } from '@/lib/sanitize';

<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }} />;
```

### 3. Avatar Component

**File**: `src/components/ui/avatar.tsx`

```tsx
import { sanitizeSvg } from '@/lib/sanitize';

React.useEffect(() => {
  const avatar = createAvatar(avataaars, { seed: name, size });
  setAvatarSvg(sanitizeSvg(avatar.toString()));
}, [name, size]);
```

### 4. Complaint Form

**File**: `src/components/complaints/complaint-form/validation.ts`

```tsx
import { sanitizeText, sanitizeHtml } from '@/lib/sanitize';

export function sanitizeFormData(formData: ComplaintFormData): ComplaintFormData {
  return {
    ...formData,
    title: sanitizeText(formData.title),
    description: sanitizeHtml(formData.description),
    tags: formData.tags.map((tag) => sanitizeText(tag)),
  };
}
```

**File**: `src/components/complaints/complaint-form/index.tsx`

```tsx
const handleSubmit = async (isDraft: boolean = false) => {
  // Sanitize form data before submission
  const sanitizedData = sanitizeFormData(formData);

  if (onSubmit) {
    await onSubmit(sanitizedData, isDraft);
  }
};
```

### 5. Comment Input

**File**: `src/components/complaints/comment-input.tsx`

```tsx
import { sanitizeText } from '@/lib/sanitize';

const handleSubmit = async (e: React.FormEvent) => {
  const sanitizedComment = sanitizeText(comment.trim());

  if (onSubmit) {
    await onSubmit(sanitizedComment, isInternal);
  }
};
```

### 6. Feedback Form

**File**: `src/components/complaints/feedback-form.tsx`

```tsx
import { sanitizeHtml } from '@/lib/sanitize';

const handleSubmit = async (e: React.FormEvent) => {
  const sanitizedContent = sanitizeHtml(content);

  if (onSubmit) {
    await onSubmit(sanitizedContent);
  }
};
```

### 7. Announcement Form

**File**: `src/components/announcements/announcement-form.tsx`

```tsx
import { sanitizeText } from '@/lib/sanitize';

const handleSubmit = (e: React.FormEvent) => {
  const announcementData = {
    title: sanitizeText(title.trim()),
    content: sanitizeText(content.trim()),
  };

  onSave(announcementData);
};
```

## Security Best Practices

### 1. Defense in Depth

Sanitization is applied at multiple layers:

- **Client-side**: Before form submission
- **Display**: Before rendering user content
- **Server-side**: Should also be applied in API endpoints (Phase 12)

### 2. Context-Appropriate Sanitization

Different contexts require different sanitization:

- **Rich text**: Use `sanitizeHtml()` to preserve formatting
- **Plain text**: Use `sanitizeText()` to strip all HTML
- **URLs**: Use `sanitizeUrl()` to validate protocols
- **File names**: Use `sanitizeFileName()` to prevent path traversal

### 3. Memoization for Performance

Use `React.useMemo` to avoid re-sanitizing on every render:

```tsx
const sanitizedContent = React.useMemo(() => sanitizeHtml(content), [content]);
```

### 4. Server-Side Rendering (SSR) Compatibility

The sanitization functions handle SSR gracefully:

- Check for `window` object before using DOMPurify
- Fall back to simple HTML stripping on the server
- Full sanitization happens in the browser

## Testing Sanitization

### Manual Testing

Test with these malicious inputs:

1. **Script injection**:

   ```html
   <script>
     alert('XSS');
   </script>
   ```

2. **Event handlers**:

   ```html
   <img src="x" onerror="alert('XSS')" />
   ```

3. **JavaScript URLs**:

   ```html
   <a href="javascript:alert('XSS')">Click me</a>
   ```

4. **Data URLs**:

   ```html
   <img src="data:text/html,<script>alert('XSS')</script>" />
   ```

5. **Iframe injection**:
   ```html
   <iframe src="javascript:alert('XSS')"></iframe>
   ```

### Expected Behavior

All malicious content should be:

- Removed completely, or
- Rendered as plain text, or
- Have dangerous attributes stripped

### Automated Testing

Create unit tests for sanitization functions:

```tsx
import { sanitizeHtml, sanitizeText, sanitizeUrl } from '@/lib/sanitize';

describe('sanitizeHtml', () => {
  it('should remove script tags', () => {
    const input = '<p>Hello</p><script>alert("XSS")</script>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain('<script>');
    expect(output).toContain('<p>Hello</p>');
  });

  it('should remove event handlers', () => {
    const input = '<img src="x" onerror="alert(\'XSS\')">';
    const output = sanitizeHtml(input);
    expect(output).not.toContain('onerror');
  });

  it('should allow safe HTML', () => {
    const input = '<p><strong>Bold</strong> and <em>italic</em></p>';
    const output = sanitizeHtml(input);
    expect(output).toContain('<strong>');
    expect(output).toContain('<em>');
  });
});
```

## Common Pitfalls to Avoid

### ❌ Don't Trust User Input

```tsx
// BAD: Direct rendering without sanitization
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### ✅ Always Sanitize

```tsx
// GOOD: Sanitize before rendering
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userInput) }} />
```

### ❌ Don't Sanitize Multiple Times

```tsx
// BAD: Over-sanitization can break content
const clean1 = sanitizeHtml(input);
const clean2 = sanitizeHtml(clean1); // Unnecessary
```

### ✅ Sanitize Once at the Right Time

```tsx
// GOOD: Sanitize once before submission or display
const cleanInput = sanitizeHtml(input);
```

### ❌ Don't Use innerHTML Directly

```tsx
// BAD: Direct DOM manipulation
element.innerHTML = userInput;
```

### ✅ Use React's Safe Rendering

```tsx
// GOOD: Use React with sanitization
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userInput) }} />
```

## Future Enhancements

1. **Content Security Policy (CSP)**
   - Add CSP headers to prevent inline scripts
   - Configure in `next.config.ts`

2. **Rate Limiting**
   - Implement rate limiting on form submissions
   - Prevent abuse and spam

3. **Input Length Limits**
   - Enforce maximum lengths at API level
   - Prevent DoS attacks

4. **Audit Logging**
   - Log sanitization events
   - Track potential attack attempts

5. **Regular Updates**
   - Keep DOMPurify updated
   - Monitor security advisories

## References

- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [React Security Best Practices](https://react.dev/learn/writing-markup-with-jsx#the-rules-of-jsx)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)

## Compliance

This implementation satisfies:

- ✅ **NFR2**: Security - XSS protection
- ✅ **OWASP Top 10**: A03:2021 – Injection
- ✅ **CWE-79**: Cross-site Scripting (XSS)

## Maintenance

- **Owner**: Security Team
- **Review Frequency**: Quarterly
- **Last Updated**: December 2024
- **Next Review**: March 2025
