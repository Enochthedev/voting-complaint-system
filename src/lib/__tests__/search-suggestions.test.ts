/**
 * Search Suggestions Tests
 * 
 * Tests for the search autocomplete/suggestions functionality.
 * Validates that suggestions are returned correctly based on query input.
 */

import { describe, it, expect } from 'vitest';
import { mockGetSearchSuggestions } from '../search-mock';

describe('Search Suggestions', () => {
  describe('mockGetSearchSuggestions', () => {
    it('should return empty array for queries less than 2 characters', async () => {
      const suggestions = await mockGetSearchSuggestions('a', 5);
      expect(suggestions).toEqual([]);
    });

    it('should return empty array for empty query', async () => {
      const suggestions = await mockGetSearchSuggestions('', 5);
      expect(suggestions).toEqual([]);
    });

    it('should return suggestions for "air" query', async () => {
      const suggestions = await mockGetSearchSuggestions('air', 5);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.toLowerCase().includes('air'))).toBe(true);
    });

    it('should return suggestions for "wifi" query', async () => {
      const suggestions = await mockGetSearchSuggestions('wifi', 5);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.toLowerCase().includes('wifi'))).toBe(true);
    });

    it('should return suggestions for "parking" query', async () => {
      const suggestions = await mockGetSearchSuggestions('parking', 5);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.toLowerCase().includes('parking'))).toBe(true);
    });

    it('should return suggestions for "grading" query', async () => {
      const suggestions = await mockGetSearchSuggestions('grading', 5);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.toLowerCase().includes('grad'))).toBe(true);
    });

    it('should limit suggestions to specified limit', async () => {
      const suggestions = await mockGetSearchSuggestions('a', 3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should return unique suggestions (no duplicates)', async () => {
      const suggestions = await mockGetSearchSuggestions('library', 10);
      const uniqueSuggestions = new Set(suggestions);
      expect(suggestions.length).toBe(uniqueSuggestions.size);
    });

    it('should prioritize titles that start with query', async () => {
      const suggestions = await mockGetSearchSuggestions('broken', 5);
      if (suggestions.length > 0) {
        // First suggestion should be a title that starts with "broken"
        const firstSuggestion = suggestions[0].toLowerCase();
        expect(firstSuggestion.startsWith('broken')).toBe(true);
      }
    });

    it('should handle case-insensitive queries', async () => {
      const lowerCaseSuggestions = await mockGetSearchSuggestions('wifi', 5);
      const upperCaseSuggestions = await mockGetSearchSuggestions('WIFI', 5);
      const mixedCaseSuggestions = await mockGetSearchSuggestions('WiFi', 5);
      
      expect(lowerCaseSuggestions.length).toBeGreaterThan(0);
      expect(upperCaseSuggestions.length).toBeGreaterThan(0);
      expect(mixedCaseSuggestions.length).toBeGreaterThan(0);
    });

    it('should include common search terms in suggestions', async () => {
      const suggestions = await mockGetSearchSuggestions('cafe', 5);
      expect(suggestions.some(s => s.toLowerCase().includes('cafeteria'))).toBe(true);
    });

    it('should include tag matches in suggestions', async () => {
      const suggestions = await mockGetSearchSuggestions('safety', 5);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should handle queries with no matches gracefully', async () => {
      const suggestions = await mockGetSearchSuggestions('xyzabc123', 5);
      expect(suggestions).toEqual([]);
    });

    it('should trim whitespace from queries', async () => {
      const suggestions = await mockGetSearchSuggestions('  wifi  ', 5);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
});
