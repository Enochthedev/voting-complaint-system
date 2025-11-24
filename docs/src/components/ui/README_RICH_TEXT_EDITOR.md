# Rich Text Editor Component

## Overview

The `RichTextEditor` component provides a WYSIWYG (What You See Is What You Get) editor for formatted text input. It's built using [Tiptap](https://tiptap.dev/), a headless editor framework based on ProseMirror.

## Features

- **Text Formatting**: Bold, Italic, Code
- **Headings**: H2 and H3 levels
- **Lists**: Bullet lists and numbered lists
- **Blockquotes**: For quoted text
- **Undo/Redo**: Full history support
- **Character Count**: Optional character limit with live counter
- **Keyboard Shortcuts**: Standard shortcuts (Ctrl+B, Ctrl+I, etc.)
- **Placeholder**: Customizable placeholder text
- **Disabled State**: Can be disabled for read-only display
- **Error State**: Visual feedback for validation errors
- **Dark Mode**: Full dark mode support

## Usage

### Basic Example

```tsx
import { RichTextEditor } from '@/components/ui/rich-text-editor';

function MyForm() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start typing..."
    />
  );
}
```

### With Character Limit

```tsx
<RichTextEditor
  value={description}
  onChange={setDescription}
  placeholder="Describe your issue..."
  maxLength={5000}
/>
```

### With Error State

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  error={!!errors.description}
  placeholder="This field is required"
/>
```

### Disabled State

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  disabled={isSubmitting}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | HTML content of the editor (required) |
| `onChange` | `(value: string) => void` | - | Callback when content changes (required) |
| `placeholder` | `string` | `"Start typing..."` | Placeholder text when empty |
| `disabled` | `boolean` | `false` | Whether the editor is disabled |
| `maxLength` | `number` | - | Maximum character count (optional) |
| `error` | `boolean` | `false` | Whether to show error styling |
| `className` | `string` | `""` | Additional CSS classes |

## Toolbar Buttons

The editor includes a toolbar with the following formatting options:

- **Bold** (Ctrl+B): Make text bold
- **Italic** (Ctrl+I): Make text italic
- **Code** (Ctrl+E): Format as inline code
- **Heading**: Create a heading (H2)
- **Bullet List**: Create an unordered list
- **Numbered List**: Create an ordered list
- **Quote**: Create a blockquote
- **Undo** (Ctrl+Z): Undo last change
- **Redo** (Ctrl+Shift+Z): Redo undone change

## Output Format

The editor outputs HTML content. Example:

```html
<p>This is <strong>bold</strong> and <em>italic</em> text.</p>
<h2>A Heading</h2>
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>
```

## Character Counting

When `maxLength` is provided, the character count is based on the **text content** (excluding HTML tags), not the raw HTML string. This ensures accurate character limits.

## Validation

To validate the editor content in a form:

```tsx
// Strip HTML tags to get text content
const getTextContent = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

// Validate
const textContent = getTextContent(editorValue);
if (!textContent.trim()) {
  setError('Description is required');
}
```

## Styling

The editor uses Tailwind CSS for styling and includes custom CSS for the editor content (prose styles). The styles are defined in `src/app/globals.css`.

## Accessibility

- Toolbar buttons include `title` attributes for tooltips
- Keyboard shortcuts are supported
- Focus management is handled automatically
- Disabled state is properly communicated

## Dependencies

- `@tiptap/react`: React wrapper for Tiptap
- `@tiptap/starter-kit`: Essential extensions bundle
- `@tiptap/extension-placeholder`: Placeholder support
- `@tiptap/extension-character-count`: Character counting

## Integration with Complaint Form

The rich text editor is integrated into the complaint form at `src/components/complaints/complaint-form.tsx` for the description field, replacing the previous plain textarea.

## Future Enhancements

Potential features to add:

- Image upload and embedding
- Link insertion
- Text color and highlighting
- Tables
- Horizontal rules
- Strikethrough
- Subscript/Superscript
- Text alignment
- Markdown shortcuts
