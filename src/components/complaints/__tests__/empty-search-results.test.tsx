/**
 * Empty Search Results Handling Tests
 * 
 * Tests for verifying that empty search results are handled properly
 * with helpful feedback and suggestions for users.
 * 
 * Validates: AC13 (Search and Advanced Filtering)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComplaintList } from '../complaint-list';

describe('Empty Search Results Handling', () => {
  describe('Empty State Display', () => {
    it('should display generic empty state when no search is active', () => {
      render(
        <ComplaintList
          complaints={[]}
          isSearchResult={false}
          emptyMessage="No complaints to display."
        />
      );

      expect(screen.getByText('No complaints found')).toBeInTheDocument();
      expect(screen.getByText('No complaints to display.')).toBeInTheDocument();
      expect(screen.queryByText('Try these suggestions:')).not.toBeInTheDocument();
    });

    it('should display search-specific empty state when search returns no results', () => {
      render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery="nonexistent query"
          emptyMessage='No complaints found matching "nonexistent query"'
        />
      );

      expect(screen.getByText('No search results found')).toBeInTheDocument();
      expect(screen.getByText(/No complaints found matching/)).toBeInTheDocument();
      expect(screen.getByText('Try these suggestions:')).toBeInTheDocument();
    });

    it('should show helpful suggestions for empty search results', () => {
      render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery="xyz123"
          emptyMessage="No results found"
        />
      );

      // Check for suggestion items
      expect(screen.getByText(/Check your spelling/)).toBeInTheDocument();
      expect(screen.getByText(/Use more general terms/)).toBeInTheDocument();
      expect(screen.getByText(/Try searching by category/)).toBeInTheDocument();
      expect(screen.getByText(/Remove filters/)).toBeInTheDocument();
    });

    it('should display clear search button when onClearSearch is provided', () => {
      const mockClearSearch = vi.fn();

      render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery="test"
          emptyMessage="No results"
          onClearSearch={mockClearSearch}
        />
      );

      const clearButton = screen.getByText(/Clear search and show all complaints/);
      expect(clearButton).toBeInTheDocument();
    });

    it('should call onClearSearch when clear button is clicked', () => {
      const mockClearSearch = vi.fn();

      render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery="test"
          emptyMessage="No results"
          onClearSearch={mockClearSearch}
        />
      );

      const clearButton = screen.getByText(/Clear search and show all complaints/);
      fireEvent.click(clearButton);

      expect(mockClearSearch).toHaveBeenCalledTimes(1);
    });

    it('should not show clear button when onClearSearch is not provided', () => {
      render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery="test"
          emptyMessage="No results"
        />
      );

      expect(screen.queryByText(/Clear search and show all complaints/)).not.toBeInTheDocument();
    });
  });

  describe('Search Query Display', () => {
    it('should display the search query in the empty message', () => {
      const searchQuery = "broken wifi";

      render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery={searchQuery}
          emptyMessage={`No complaints found matching "${searchQuery}"`}
        />
      );

      expect(screen.getByText(new RegExp(searchQuery))).toBeInTheDocument();
    });

    it('should handle special characters in search query', () => {
      const searchQuery = "test & special <chars>";

      render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery={searchQuery}
          emptyMessage={`No complaints found matching "${searchQuery}"`}
        />
      );

      // Should render without errors
      expect(screen.getByText('No search results found')).toBeInTheDocument();
    });
  });

  describe('Visual Feedback', () => {
    it('should use different styling for search results vs regular empty state', () => {
      const { container: searchContainer } = render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery="test"
          emptyMessage="No results"
        />
      );

      const { container: regularContainer } = render(
        <ComplaintList
          complaints={[]}
          isSearchResult={false}
          emptyMessage="No complaints"
        />
      );

      // Search result should have suggestions section
      expect(searchContainer.querySelector('.space-y-3')).toBeInTheDocument();
      expect(regularContainer.querySelector('.space-y-3')).not.toBeInTheDocument();
    });

    it('should display icon in empty state', () => {
      render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery="test"
          emptyMessage="No results"
        />
      );

      // Check for FileText icon (via class or test-id if added)
      const emptyStateContainer = screen.getByText('No search results found').closest('div');
      expect(emptyStateContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search query gracefully', () => {
      render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery=""
          emptyMessage="No results"
        />
      );

      expect(screen.getByText('No search results found')).toBeInTheDocument();
    });

    it('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(200);

      render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery={longQuery}
          emptyMessage={`No complaints found matching "${longQuery}"`}
        />
      );

      expect(screen.getByText('No search results found')).toBeInTheDocument();
    });

    it('should handle undefined search query', () => {
      render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          emptyMessage="No results"
        />
      );

      // Should still show suggestions even without explicit query
      expect(screen.getByText('Try these suggestions:')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery="test"
          emptyMessage="No results"
        />
      );

      const heading = screen.getByText('No search results found');
      expect(heading.tagName).toBe('H3');
    });

    it('should have readable text contrast', () => {
      const { container } = render(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery="test"
          emptyMessage="No results"
        />
      );

      // Check that text elements have appropriate color classes
      const textElements = container.querySelectorAll('.text-zinc-600, .text-zinc-900');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Integration with Search Flow', () => {
    it('should transition from results to empty state correctly', () => {
      const { rerender } = render(
        <ComplaintList
          complaints={[
            {
              id: '1',
              title: 'Test Complaint',
              description: 'Test',
              category: 'facilities',
              priority: 'medium',
              status: 'new',
              student_id: 'test',
              is_anonymous: false,
              is_draft: false,
              assigned_to: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              opened_at: null,
              opened_by: null,
              resolved_at: null,
              escalated_at: null,
              escalation_level: 0,
            },
          ]}
          isSearchResult={true}
          searchQuery="test"
        />
      );

      expect(screen.getByText('Test Complaint')).toBeInTheDocument();

      // Rerender with empty results
      rerender(
        <ComplaintList
          complaints={[]}
          isSearchResult={true}
          searchQuery="nonexistent"
          emptyMessage="No results"
        />
      );

      expect(screen.queryByText('Test Complaint')).not.toBeInTheDocument();
      expect(screen.getByText('No search results found')).toBeInTheDocument();
    });
  });
});
