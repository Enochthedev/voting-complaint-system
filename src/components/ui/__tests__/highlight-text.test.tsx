/**
 * Tests for HighlightText Component
 * 
 * Validates search term highlighting functionality
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HighlightText, HighlightHTML } from '../highlight-text';

describe('HighlightText', () => {
  it('renders plain text when no query is provided', () => {
    const { container } = render(
      <HighlightText text="Broken AC in Lecture Hall" />
    );
    
    expect(container.textContent).toBe('Broken AC in Lecture Hall');
    expect(container.querySelector('mark')).toBeNull();
  });

  it('highlights single search term', () => {
    const { container } = render(
      <HighlightText text="Broken AC in Lecture Hall" query="lecture" />
    );
    
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('Lecture');
  });

  it('highlights multiple search terms', () => {
    const { container } = render(
      <HighlightText text="Broken AC in Lecture Hall" query="broken hall" />
    );
    
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
    expect(marks[0].textContent).toBe('Broken');
    expect(marks[1].textContent).toBe('Hall');
  });

  it('performs case-insensitive matching', () => {
    const { container } = render(
      <HighlightText text="Broken AC in Lecture Hall" query="BROKEN lecture" />
    );
    
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
    expect(marks[0].textContent).toBe('Broken');
    expect(marks[1].textContent).toBe('Lecture');
  });

  it('handles empty query gracefully', () => {
    const { container } = render(
      <HighlightText text="Broken AC in Lecture Hall" query="" />
    );
    
    expect(container.textContent).toBe('Broken AC in Lecture Hall');
    expect(container.querySelector('mark')).toBeNull();
  });

  it('handles whitespace-only query', () => {
    const { container } = render(
      <HighlightText text="Broken AC in Lecture Hall" query="   " />
    );
    
    expect(container.textContent).toBe('Broken AC in Lecture Hall');
    expect(container.querySelector('mark')).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(
      <HighlightText 
        text="Test text" 
        query="test" 
        className="custom-class"
      />
    );
    
    const span = container.querySelector('span');
    expect(span?.className).toContain('custom-class');
  });

  it('applies custom highlight className', () => {
    const { container } = render(
      <HighlightText 
        text="Test text" 
        query="test" 
        highlightClassName="custom-highlight"
      />
    );
    
    const mark = container.querySelector('mark');
    expect(mark?.className).toContain('custom-highlight');
  });

  it('handles special regex characters in query', () => {
    const { container } = render(
      <HighlightText text="Cost is $100 (approx.)" query="$100" />
    );
    
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('$100');
  });

  it('highlights all occurrences of search term', () => {
    const { container } = render(
      <HighlightText text="The test is a test of testing" query="test" />
    );
    
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(3);
    expect(marks[0].textContent).toBe('test');
    expect(marks[1].textContent).toBe('test');
    expect(marks[2].textContent).toBe('test');
  });
});

describe('HighlightHTML', () => {
  it('strips HTML tags before highlighting', () => {
    const { container } = render(
      <HighlightHTML 
        html="<p>Broken <strong>AC</strong> in Lecture Hall</p>" 
        query="lecture" 
      />
    );
    
    // Should strip HTML and highlight the term
    expect(container.textContent).toBe('Broken AC in Lecture Hall');
    
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('Lecture');
  });

  it('handles complex HTML structures', () => {
    const { container } = render(
      <HighlightHTML 
        html="<div><p>First paragraph</p><p>Second paragraph</p></div>" 
        query="paragraph" 
      />
    );
    
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
  });

  it('handles HTML entities', () => {
    const { container } = render(
      <HighlightHTML 
        html="<p>Cost &gt; $100</p>" 
        query="cost" 
      />
    );
    
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('Cost');
  });
});
