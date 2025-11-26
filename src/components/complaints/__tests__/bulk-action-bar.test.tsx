import { render, screen, fireEvent } from '@testing-library/react';
import { BulkActionBar } from '../bulk-action-bar';

describe('BulkActionBar - Select All / Select None', () => {
  const mockOnExport = jest.fn();
  const mockOnSelectAll = jest.fn();
  const mockOnClearSelection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when no items are selected', () => {
    const { container } = render(
      <BulkActionBar
        selectedCount={0}
        totalCount={10}
        onExport={mockOnExport}
        onSelectAll={mockOnSelectAll}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render with selection count when items are selected', () => {
    render(
      <BulkActionBar
        selectedCount={3}
        totalCount={10}
        onExport={mockOnExport}
        onSelectAll={mockOnSelectAll}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.getByText('3 complaints selected')).toBeInTheDocument();
  });

  it('should show "Select all" link when not all items are selected', () => {
    render(
      <BulkActionBar
        selectedCount={3}
        totalCount={10}
        onExport={mockOnExport}
        onSelectAll={mockOnSelectAll}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.getByText('Select all 10')).toBeInTheDocument();
  });

  it('should always show "Select none" link when items are selected', () => {
    render(
      <BulkActionBar
        selectedCount={3}
        totalCount={10}
        onExport={mockOnExport}
        onSelectAll={mockOnSelectAll}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.getByText('Select none')).toBeInTheDocument();
  });

  it('should hide "Select all" link when all items are selected', () => {
    render(
      <BulkActionBar
        selectedCount={10}
        totalCount={10}
        onExport={mockOnExport}
        onSelectAll={mockOnSelectAll}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.queryByText('Select all 10')).not.toBeInTheDocument();
    expect(screen.getByText('Select none')).toBeInTheDocument();
  });

  it('should call onSelectAll when "Select all" link is clicked', () => {
    render(
      <BulkActionBar
        selectedCount={3}
        totalCount={10}
        onExport={mockOnExport}
        onSelectAll={mockOnSelectAll}
        onClearSelection={mockOnClearSelection}
      />
    );

    const selectAllLink = screen.getByText('Select all 10');
    fireEvent.click(selectAllLink);

    expect(mockOnSelectAll).toHaveBeenCalledTimes(1);
  });

  it('should call onClearSelection when "Select none" link is clicked', () => {
    render(
      <BulkActionBar
        selectedCount={3}
        totalCount={10}
        onExport={mockOnExport}
        onSelectAll={mockOnSelectAll}
        onClearSelection={mockOnClearSelection}
      />
    );

    const selectNoneLink = screen.getByText('Select none');
    fireEvent.click(selectNoneLink);

    expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
  });

  it('should call onClearSelection when Clear button is clicked', () => {
    render(
      <BulkActionBar
        selectedCount={3}
        totalCount={10}
        onExport={mockOnExport}
        onSelectAll={mockOnSelectAll}
        onClearSelection={mockOnClearSelection}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
  });

  it('should disable links when exporting', () => {
    render(
      <BulkActionBar
        selectedCount={3}
        totalCount={10}
        isExporting={true}
        onExport={mockOnExport}
        onSelectAll={mockOnSelectAll}
        onClearSelection={mockOnClearSelection}
      />
    );

    const selectAllLink = screen.getByText('Select all 10');
    const selectNoneLink = screen.getByText('Select none');

    expect(selectAllLink).toBeDisabled();
    expect(selectNoneLink).toBeDisabled();
  });

  it('should show singular "complaint" when only one is selected', () => {
    render(
      <BulkActionBar
        selectedCount={1}
        totalCount={10}
        onExport={mockOnExport}
        onSelectAll={mockOnSelectAll}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.getByText('1 complaint selected')).toBeInTheDocument();
  });

  it('should show plural "complaints" when multiple are selected', () => {
    render(
      <BulkActionBar
        selectedCount={5}
        totalCount={10}
        onExport={mockOnExport}
        onSelectAll={mockOnSelectAll}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.getByText('5 complaints selected')).toBeInTheDocument();
  });

  it('should show export progress when exporting', () => {
    render(
      <BulkActionBar
        selectedCount={3}
        totalCount={10}
        isExporting={true}
        exportProgress={50}
        exportMessage="Exporting complaints..."
        onExport={mockOnExport}
        onSelectAll={mockOnSelectAll}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.getByText('Exporting complaints...')).toBeInTheDocument();
  });
});
