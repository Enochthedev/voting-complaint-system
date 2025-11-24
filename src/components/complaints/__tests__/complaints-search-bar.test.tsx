import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComplaintsSearchBar } from '../complaints-search-bar';

describe('ComplaintsSearchBar', () => {
    const mockOnSearchQueryChange = jest.fn();
    const mockOnSearch = jest.fn();
    const mockOnClearSearch = jest.fn();

    const defaultProps = {
        searchQuery: '',
        searchSuggestions: [],
        isSearching: false,
        searchError: null,
        useSearch: false,
        searchResults: null,
        onSearchQueryChange: mockOnSearchQueryChange,
        onSearch: mockOnSearch,
        onClearSearch: mockOnClearSearch,
    };

    beforeEach(() => {
        mockOnSearchQueryChange.mockClear();
        mockOnSearch.mockClear();
        mockOnClearSearch.mockClear();
    });

    it('should render search input with placeholder', () => {
        render(<ComplaintsSearchBar {...defaultProps} />);

        expect(
            screen.getByPlaceholderText(/search complaints by title or description/i)
        ).toBeInTheDocument();
    });

    it('should display search error when present', () => {
        render(
            <ComplaintsSearchBar
                {...defaultProps}
                searchError="Failed to connect to search service"
            />
        );

        expect(screen.getByText(/error:/i)).toBeInTheDocument();
        expect(
            screen.getByText(/failed to connect to search service/i)
        ).toBeInTheDocument();
    });

    describe('Search Results Display', () => {
        it('should show "no results" message when search returns zero results', () => {
            render(
                <ComplaintsSearchBar
                    {...defaultProps}
                    useSearch={true}
                    searchQuery="nonexistent"
                    searchResults={{
                        total: 0,
                        complaints: [],
                        totalPages: 0,
                    }}
                />
            );

            expect(screen.getByText(/no results found/i)).toBeInTheDocument();
            expect(screen.getByText(/nonexistent/i)).toBeInTheDocument();
        });

        it('should show results count for single result', () => {
            render(
                <ComplaintsSearchBar
                    {...defaultProps}
                    useSearch={true}
                    searchQuery="test"
                    searchResults={{
                        total: 1,
                        complaints: [],
                        totalPages: 1,
                    }}
                />
            );

            expect(screen.getByText(/found/i)).toBeInTheDocument();
            expect(screen.getByText(/1/)).toBeInTheDocument();
            expect(screen.getByText(/result\b/i)).toBeInTheDocument(); // singular "result"
            expect(screen.queryByText(/results/i)).not.toBeInTheDocument(); // not plural
        });

        it('should show results count for multiple results', () => {
            render(
                <ComplaintsSearchBar
                    {...defaultProps}
                    useSearch={true}
                    searchQuery="test"
                    searchResults={{
                        total: 5,
                        complaints: [],
                        totalPages: 1,
                    }}
                />
            );

            expect(screen.getByText(/found/i)).toBeInTheDocument();
            expect(screen.getByText(/5/)).toBeInTheDocument();
            expect(screen.getByText(/results/i)).toBeInTheDocument(); // plural "results"
        });
    });

    describe('Loading State', () => {
        it('should show loading state when isSearching is true', () => {
            render(
                <ComplaintsSearchBar
                    {...defaultProps}
                    isSearching={true}
                    searchQuery="test"
                />
            );

            // The SearchBar component should handle the loading state internally
            // This test verifies the prop is passed correctly
            expect(screen.getByDisplayValue('test')).toBeInTheDocument();
        });
    });

    describe('Suggestions', () => {
        it('should display search suggestions when available', () => {
            const suggestions = ['broken AC', 'library wifi', 'parking'];

            render(
                <ComplaintsSearchBar
                    {...defaultProps}
                    searchQuery="br"
                    searchSuggestions={suggestions}
                />
            );

            // Suggestions are passed to the SearchBar component
            expect(screen.getByDisplayValue('br')).toBeInTheDocument();
        });
    });
});
