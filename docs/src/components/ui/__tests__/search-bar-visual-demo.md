# Search Bar Visual Demo

## Overview

This document provides a visual guide to the SearchBar component and its various states.

## Component States

### 1. Default State

```
┌─────────────────────────────────────────────────────────┐
│ 🔍  Search complaints...                              │
└─────────────────────────────────────────────────────────┘
```

- Empty input field
- Search icon on the left
- Placeholder text visible
- No suggestions shown

### 2. Typing State

```
┌─────────────────────────────────────────────────────────┐
│ 🔍  broken air                                      ✕  │
└─────────────────────────────────────────────────────────┘
```

- User has typed text
- Clear button (✕) appears on the right
- Suggestions dropdown may appear below

### 3. Loading State

```
┌─────────────────────────────────────────────────────────┐
│ ⟳  broken air conditioning                          ✕  │
└─────────────────────────────────────────────────────────┘
```

- Spinning loader icon replaces search icon
- Indicates search is in progress
- Clear button still available

### 4. With Suggestions Dropdown

```
┌─────────────────────────────────────────────────────────┐
│ 🔍  broken air                                      ✕  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ 🔍 broken air conditioning                      Recent  │
│ 🔍 broken air conditioner                               │
│ 🔍 air conditioning repair                              │
└─────────────────────────────────────────────────────────┘
```

- Dropdown appears below input
- Shows matching suggestions
- Each suggestion has a search icon
- Recent searches marked with "Recent" label
- Hover state highlights suggestions

### 5. Keyboard Navigation

```
┌─────────────────────────────────────────────────────────┐
│ 🔍  broken air                                      ✕  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ 🔍 broken air conditioning                      Recent  │ ← Selected
│ 🔍 broken air conditioner                               │
│ 🔍 air conditioning repair                              │
└─────────────────────────────────────────────────────────┘
```

- Arrow keys navigate through suggestions
- Selected suggestion is highlighted
- Enter key selects highlighted suggestion
- Escape key closes dropdown

### 6. Disabled State

```
┌─────────────────────────────────────────────────────────┐
│ 🔍  Search complaints...                              │ (grayed out)
└─────────────────────────────────────────────────────────┘
```

- Input is disabled
- Grayed out appearance
- No interaction possible

## Integration Examples

### Example 1: Basic Search

```tsx
<SearchBar
  value={searchValue}
  onChange={setSearchValue}
  onSearch={handleSearch}
  placeholder="Search complaints..."
/>
```

### Example 2: With Autocomplete

```tsx
<SearchBar
  value={searchValue}
  onChange={handleSearchChange}
  onSearch={handleSearch}
  suggestions={suggestions}
  showSuggestions={true}
  placeholder="Search complaints by title, description, or tags..."
/>
```

### Example 3: With Loading

```tsx
<SearchBar
  value={searchValue}
  onChange={setSearchValue}
  onSearch={handleSearch}
  isLoading={isSearching}
  placeholder="Search complaints..."
/>
```

## User Interactions

### Typing

1. User clicks on search bar
2. Input field receives focus
3. User types search query
4. `onChange` callback fires with each keystroke
5. Suggestions appear if `showSuggestions={true}`

### Selecting Suggestion

1. User sees suggestions dropdown
2. User clicks on a suggestion OR uses arrow keys + Enter
3. Input value updates to selected suggestion
4. `onSearch` callback fires with suggestion text
5. Dropdown closes

### Submitting Search

1. User types search query
2. User presses Enter key
3. `onSearch` callback fires with current input value
4. Dropdown closes (if open)

### Clearing Search

1. User clicks the clear button (✕)
2. Input value clears
3. `onChange` callback fires with empty string
4. `onClear` callback fires
5. Suggestions dropdown closes

## Responsive Behavior

### Desktop (≥768px)

- Full width search bar
- Suggestions dropdown full width
- Comfortable padding and spacing

### Tablet (≥640px, <768px)

- Slightly reduced padding
- Suggestions dropdown adapts to width
- Touch-friendly tap targets

### Mobile (<640px)

- Full width search bar
- Larger touch targets
- Suggestions dropdown full width
- Optimized for thumb navigation

## Accessibility Features

### Keyboard Support

- **Tab**: Focus search input
- **Arrow Down**: Navigate to next suggestion
- **Arrow Up**: Navigate to previous suggestion
- **Enter**: Submit search or select suggestion
- **Escape**: Close suggestions and blur input

### Screen Reader Support

- Input has `aria-label="Search complaints"`
- Suggestions have `role="listbox"`
- Each suggestion has `role="option"`
- `aria-expanded` indicates dropdown state
- `aria-controls` links input to suggestions

### Focus Management

- Clear focus indicators
- Focus trap within suggestions when navigating
- Focus returns to input after selection

## Color Scheme

### Light Mode

- Background: White (#FFFFFF)
- Border: Zinc-200 (#E4E4E7)
- Text: Zinc-900 (#18181B)
- Placeholder: Zinc-500 (#71717A)
- Hover: Zinc-50 (#FAFAFA)
- Selected: Zinc-100 (#F4F4F5)

### Dark Mode

- Background: Zinc-950 (#09090B)
- Border: Zinc-800 (#27272A)
- Text: Zinc-50 (#FAFAFA)
- Placeholder: Zinc-400 (#A1A1AA)
- Hover: Zinc-900 (#18181B)
- Selected: Zinc-800 (#27272A)

## Testing Checklist

- [ ] Component renders without errors
- [ ] Input accepts text input
- [ ] onChange callback fires correctly
- [ ] onSearch callback fires on Enter key
- [ ] onSearch callback fires on suggestion click
- [ ] Clear button appears when input has value
- [ ] Clear button clears input and fires callbacks
- [ ] Suggestions dropdown appears when showSuggestions={true}
- [ ] Keyboard navigation works (arrows, enter, escape)
- [ ] Loading state shows spinner icon
- [ ] Disabled state prevents interaction
- [ ] Click outside closes suggestions
- [ ] Component is accessible (ARIA attributes)
- [ ] Component is responsive on all screen sizes
- [ ] Dark mode styling works correctly

## Demo File

See `search-bar-demo.tsx` for a working interactive demo with mock data.

## Related Documentation

- `README_SEARCH_BAR.md` - Full component documentation
- `search-bar.tsx` - Component source code
- `README_SEARCH_INTEGRATION.md` - Integration guide for complaints page
