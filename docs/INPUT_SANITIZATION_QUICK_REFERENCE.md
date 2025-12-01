# Input Sanitization - Quick Reference

## When to Use Each Function

### 🔒 `sanitizeHtml(html: string)`

**Use for**: Rich text content from editors (complaints, feedback, comments)

```tsx
import { sanitizeHtml } from '@/lib/sanitize';

// ✅ GOOD: Sanitize before rendering
const cleanHtml = sanitizeHtml(userInput);
<div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;

// ✅ GOOD: Memoize for performance
const cleanHtml = React.useMemo(() => sanitizeHtml(content), [content]);
```

**Allows**: `<p>`, `<strong>`, `<em>`, `<h2-h6>`, `<ul>`, `<ol>`, `<li>`, `<blockquote>`, `<a>`  
**Blocks**: `<script>`, `<iframe>`, event handlers, dangerous protocols

---

### 📝 `sanitizeText(text: string)`

**Use for**: Plain text fields (titles, names, tags, simple text)

```tsx
import { sanitizeText } from '@/lib/sanitize';

// ✅ GOOD: Strip all HTML
const cleanText = sanitizeText(userInput);
<h1>{cleanText}</h1>;

// ✅ GOOD: In form submission
const sanitizedData = {
  title: sanitizeText(formData.title),
  tags: formData.tags.map((tag) => sanitizeText(tag)),
};
```

**Behavior**: Removes ALL HTML tags, keeps text content

---

### 🎨 `sanitizeSvg(svg: string)`

**Use for**: SVG content from external sources (avatars, icons)

```tsx
import { sanitizeSvg } from '@/lib/sanitize';

// ✅ GOOD: Sanitize SVG before rendering
const cleanSvg = sanitizeSvg(avatarSvg);
<div dangerouslySetInnerHTML={{ __html: cleanSvg }} />;
```

**Allows**: Safe SVG elements and attributes only  
**Blocks**: Script tags, event handlers, external references

---

### 🔗 `sanitizeUrl(url: string)`

**Use for**: User-provided URLs (links, redirects)

```tsx
import { sanitizeUrl } from '@/lib/sanitize';

// ✅ GOOD: Validate URL before using
const safeUrl = sanitizeUrl(userProvidedUrl);
if (safeUrl) {
  <a href={safeUrl}>Link</a>;
}
```

**Allows**: `https://`, `http://`, `mailto:`, `tel:`, relative URLs  
**Blocks**: `javascript:`, `data:`, `vbscript:`, `file:`

---

### 📁 `sanitizeFileName(fileName: string)`

**Use for**: File uploads, downloads

```tsx
import { sanitizeFileName } from '@/lib/sanitize';

// ✅ GOOD: Sanitize file name
const safeName = sanitizeFileName(uploadedFile.name);
```

**Removes**: Path separators, null bytes, leading dots  
**Limits**: 255 characters

---

### 🔍 `sanitizeSearchQuery(query: string)`

**Use for**: Search inputs, query parameters

```tsx
import { sanitizeSearchQuery } from '@/lib/sanitize';

// ✅ GOOD: Clean search query
const safeQuery = sanitizeSearchQuery(userSearchInput);
```

**Removes**: HTML tags, special regex characters  
**Normalizes**: Whitespace

---

### 📧 `sanitizeEmail(email: string)`

**Use for**: Email address inputs

```tsx
import { sanitizeEmail } from '@/lib/sanitize';

// ✅ GOOD: Validate and sanitize email
const safeEmail = sanitizeEmail(userEmail);
if (safeEmail) {
  // Use email
}
```

**Validates**: Email format  
**Normalizes**: Lowercase, trim  
**Removes**: HTML

---

### 📦 `sanitizeJson<T>(data: T)`

**Use for**: Bulk sanitization of form data

```tsx
import { sanitizeJson } from '@/lib/sanitize';

// ✅ GOOD: Sanitize entire object
const cleanData = sanitizeJson(formData);

// ✅ GOOD: With custom sanitizer
const cleanData = sanitizeJson(formData, sanitizeHtml);
```

**Behavior**: Recursively sanitizes all string values

---

## Common Patterns

### Form Submission

```tsx
import { sanitizeText, sanitizeHtml } from '@/lib/sanitize';

const handleSubmit = async (formData) => {
  const sanitizedData = {
    title: sanitizeText(formData.title),
    description: sanitizeHtml(formData.description),
    tags: formData.tags.map((tag) => sanitizeText(tag)),
  };

  await submitForm(sanitizedData);
};
```

### Display User Content

```tsx
import { sanitizeHtml } from '@/lib/sanitize';

function ContentDisplay({ content }) {
  const cleanContent = React.useMemo(() => sanitizeHtml(content), [content]);

  return <div dangerouslySetInnerHTML={{ __html: cleanContent }} />;
}
```

### File Upload

```tsx
import { sanitizeFileName } from '@/lib/sanitize';

const handleFileUpload = (file: File) => {
  const safeName = sanitizeFileName(file.name);
  // Upload with safe name
};
```

## ❌ Common Mistakes

### Don't render unsanitized HTML

```tsx
// ❌ BAD: XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD: Sanitize first
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userInput) }} />
```

### Don't use wrong sanitizer

```tsx
// ❌ BAD: Using text sanitizer for rich content
const clean = sanitizeText(richTextContent); // Loses formatting

// ✅ GOOD: Use appropriate sanitizer
const clean = sanitizeHtml(richTextContent); // Preserves safe formatting
```

### Don't sanitize multiple times

```tsx
// ❌ BAD: Over-sanitization
const clean1 = sanitizeHtml(input);
const clean2 = sanitizeHtml(clean1); // Unnecessary

// ✅ GOOD: Sanitize once
const clean = sanitizeHtml(input);
```

### Don't forget to sanitize on submission

```tsx
// ❌ BAD: Only sanitizing on display
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />;
// But submitting unsanitized data

// ✅ GOOD: Sanitize before submission AND display
const sanitizedData = sanitizeFormData(formData);
await submitForm(sanitizedData);
```

## Testing Checklist

Test your forms with these malicious inputs:

- [ ] `<script>alert('XSS')</script>`
- [ ] `<img src="x" onerror="alert('XSS')">`
- [ ] `<a href="javascript:alert('XSS')">Click</a>`
- [ ] `<iframe src="evil.com"></iframe>`
- [ ] `<svg onload="alert('XSS')">`
- [ ] `../../../etc/passwd` (file names)
- [ ] `javascript:alert('XSS')` (URLs)

**Expected**: All malicious content should be removed or escaped.

## Performance Tips

1. **Memoize sanitization** in React components:

   ```tsx
   const clean = React.useMemo(() => sanitizeHtml(content), [content]);
   ```

2. **Sanitize once** at the right time (submission or display, not both)

3. **Use appropriate sanitizer** (don't use `sanitizeHtml` for plain text)

## Need Help?

- 📖 Full documentation: `docs/INPUT_SANITIZATION.md`
- 🧪 Test examples: `src/lib/__tests__/sanitize.test.ts`
- 🔒 Security requirements: `.kiro/specs/requirements.md` (NFR2)
