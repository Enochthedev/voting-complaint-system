import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BulkActionConfirmationModal } from '../bulk-action-confirmation-modal';

describe('BulkActionConfirmationModal', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(
      <BulkActionConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Test Action"
        description="This is a test description"
        itemCount={5}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Test Action')).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
    expect(screen.getByText(/5 complaints/)).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <BulkActionConfirmationModal
        open={false}
        onOpenChange={mockOnOpenChange}
        title="Test Action"
        description="This is a test description"
        itemCount={5}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByText('Test Action')).not.toBeInTheDocument();
  });

  it('displays singular form for single item', () => {
    render(
      <BulkActionConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Test Action"
        description="This is a test description"
        itemCount={1}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/1 complaint$/)).toBeInTheDocument();
  });

  it('displays plural form for multiple items', () => {
    render(
      <BulkActionConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Test Action"
        description="This is a test description"
        itemCount={10}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/10 complaints/)).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    render(
      <BulkActionConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Test Action"
        description="This is a test description"
        itemCount={5}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onOpenChange when cancel button is clicked', async () => {
    render(
      <BulkActionConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Test Action"
        description="This is a test description"
        itemCount={5}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('disables buttons when isLoading is true', () => {
    render(
      <BulkActionConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Test Action"
        description="This is a test description"
        itemCount={5}
        onConfirm={mockOnConfirm}
        isLoading={true}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /processing/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('shows custom confirm and cancel text', () => {
    render(
      <BulkActionConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Test Action"
        description="This is a test description"
        itemCount={5}
        onConfirm={mockOnConfirm}
        confirmText="Yes, proceed"
        cancelText="No, go back"
      />
    );

    expect(screen.getByRole('button', { name: /yes, proceed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no, go back/i })).toBeInTheDocument();
  });

  it('applies destructive styling when actionType is destructive', () => {
    render(
      <BulkActionConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Delete Items"
        description="This action cannot be undone"
        itemCount={5}
        onConfirm={mockOnConfirm}
        actionType="destructive"
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toHaveClass('bg-destructive');
  });

  it('displays warning icon', () => {
    render(
      <BulkActionConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Test Action"
        description="This is a test description"
        itemCount={5}
        onConfirm={mockOnConfirm}
      />
    );

    // Check for the AlertCircle icon by looking for its container
    const iconContainer = screen
      .getByText('Test Action')
      .closest('div')
      ?.querySelector('.text-orange-600');
    expect(iconContainer).toBeInTheDocument();
  });
});
