'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface HighlightTextProps {
  text: string;
  query?: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * HighlightText Component
 * 
 * Renders text with highlighted search terms.
 * Wraps matching terms in <mark> elements for visual highlighting.
 * 
 * Features:
 * - Case-insensitive matching
 * - Multiple search terms support
 * - Customizable highlight styling
 * - Preserves original text formatting
 * 
 * @example
 * <HighlightText text="Broken AC in Lecture Hall" query="lecture hall" />
 * // Renders: Broken AC in <mark>Lecture</mark> <mark>Hall</mark>
 */
export function HighlightText({
  text,
  query,
  className,
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800 text-foreground',
}: HighlightTextProps) {
  // If no query, return plain text
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Split query into individual terms
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0);

  if (terms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Create a regex pattern that matches any of the search terms
  // Use word boundaries for better matching
  const pattern = terms.map((term) => escapeRegex(term)).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');

  // Split text by matches
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches any search term (case-insensitive)
        const isMatch = terms.some(
          (term) => part.toLowerCase() === term.toLowerCase()
        );

        if (isMatch) {
          return (
            <mark
              key={index}
              className={cn(
                'rounded px-0.5 font-medium',
                highlightClassName
              )}
            >
              {part}
            </mark>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}

/**
 * HighlightHTML Component
 * 
 * Similar to HighlightText but handles HTML content.
 * Strips HTML tags before highlighting to avoid breaking markup.
 * 
 * @example
 * <HighlightHTML html="<p>Broken AC in Lecture Hall</p>" query="lecture" />
 */
export function HighlightHTML({
  html,
  query,
  className,
  highlightClassName,
}: {
  html: string;
  query?: string;
  className?: string;
  highlightClassName?: string;
}) {
  // Strip HTML tags for display
  const plainText = html.replace(/<[^>]*>/g, '');

  return (
    <HighlightText
      text={plainText}
      query={query}
      className={className}
      highlightClassName={highlightClassName}
    />
  );
}
