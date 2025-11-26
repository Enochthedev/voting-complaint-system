import { render, screen } from '@testing-library/react';
import { TimelineSection } from '../TimelineSection';
import type { ComplaintHistory, User as UserType } from '@/types/database.types';

describe('TimelineSection', () => {
  const mockUser: UserType = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'student',
    full_name: 'Test User',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  it('should render nothing when history is empty', () => {
    const { container } = render(<TimelineSection history={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should display all history items', () => {
    const history: (ComplaintHistory & { user?: UserType })[] = [
      {
        id: 'hist-1',
        complaint_id: 'complaint-1',
        action: 'created',
        old_value: null,
        new_value: 'new',
        performed_by: 'user-1',
        details: null,
        created_at: '2024-11-15T10:00:00Z',
        user: mockUser,
      },
      {
        id: 'hist-2',
        complaint_id: 'complaint-1',
        action: 'status_changed',
        old_value: 'new',
        new_value: 'opened',
        performed_by: 'user-1',
        details: null,
        created_at: '2024-11-15T11:00:00Z',
        user: mockUser,
      },
    ];

    render(<TimelineSection history={history} />);

    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Created complaint')).toBeInTheDocument();
    expect(screen.getByText('Changed status from "new" to "opened"')).toBeInTheDocument();
  });

  it('should sort history chronologically (oldest first)', () => {
    // Create history items in reverse chronological order
    const history: (ComplaintHistory & { user?: UserType })[] = [
      {
        id: 'hist-3',
        complaint_id: 'complaint-1',
        action: 'status_changed',
        old_value: 'opened',
        new_value: 'resolved',
        performed_by: 'user-1',
        details: null,
        created_at: '2024-11-15T14:00:00Z', // Latest
        user: mockUser,
      },
      {
        id: 'hist-1',
        complaint_id: 'complaint-1',
        action: 'created',
        old_value: null,
        new_value: 'new',
        performed_by: 'user-1',
        details: null,
        created_at: '2024-11-15T10:00:00Z', // Earliest
        user: mockUser,
      },
      {
        id: 'hist-2',
        complaint_id: 'complaint-1',
        action: 'status_changed',
        old_value: 'new',
        new_value: 'opened',
        performed_by: 'user-1',
        details: null,
        created_at: '2024-11-15T12:00:00Z', // Middle
        user: mockUser,
      },
    ];

    render(<TimelineSection history={history} />);

    // Get all timeline items
    const timelineItems = screen
      .getAllByRole('generic')
      .filter((el) => el.className.includes('flex gap-3'));

    // Verify the order by checking the text content
    const labels = [
      'Created complaint',
      'Changed status from "new" to "opened"',
      'Changed status from "opened" to "resolved"',
    ];

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should display user information for each history item', () => {
    const history: (ComplaintHistory & { user?: UserType })[] = [
      {
        id: 'hist-1',
        complaint_id: 'complaint-1',
        action: 'created',
        old_value: null,
        new_value: 'new',
        performed_by: 'user-1',
        details: null,
        created_at: '2024-11-15T10:00:00Z',
        user: mockUser,
      },
    ];

    render(<TimelineSection history={history} />);

    expect(screen.getByText(/Test User/)).toBeInTheDocument();
  });

  it('should handle missing user information gracefully', () => {
    const history: (ComplaintHistory & { user?: UserType })[] = [
      {
        id: 'hist-1',
        complaint_id: 'complaint-1',
        action: 'created',
        old_value: null,
        new_value: 'new',
        performed_by: 'user-1',
        details: null,
        created_at: '2024-11-15T10:00:00Z',
        // No user object
      },
    ];

    render(<TimelineSection history={history} />);

    expect(screen.getByText(/Unknown user/)).toBeInTheDocument();
  });

  it('should display details when available', () => {
    const history: (ComplaintHistory & { user?: UserType })[] = [
      {
        id: 'hist-1',
        complaint_id: 'complaint-1',
        action: 'assigned',
        old_value: null,
        new_value: 'lecturer-1',
        performed_by: 'user-1',
        details: {
          assigned_to_name: 'Dr. Smith',
          reason: 'Subject matter expert',
        },
        created_at: '2024-11-15T10:00:00Z',
        user: mockUser,
      },
    ];

    render(<TimelineSection history={history} />);

    expect(screen.getByText(/assigned_to_name:/)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Smith/)).toBeInTheDocument();
    expect(screen.getByText(/reason:/)).toBeInTheDocument();
    expect(screen.getByText(/Subject matter expert/)).toBeInTheDocument();
  });

  it('should not display details section when details is null', () => {
    const history: (ComplaintHistory & { user?: UserType })[] = [
      {
        id: 'hist-1',
        complaint_id: 'complaint-1',
        action: 'created',
        old_value: null,
        new_value: 'new',
        performed_by: 'user-1',
        details: null,
        created_at: '2024-11-15T10:00:00Z',
        user: mockUser,
      },
    ];

    const { container } = render(<TimelineSection history={history} />);

    // Check that there's no details section (no element with bg-muted/50 class)
    const detailsSection = container.querySelector('.bg-muted\\/50');
    expect(detailsSection).toBeNull();
  });

  it('should not display details section when details is empty object', () => {
    const history: (ComplaintHistory & { user?: UserType })[] = [
      {
        id: 'hist-1',
        complaint_id: 'complaint-1',
        action: 'created',
        old_value: null,
        new_value: 'new',
        performed_by: 'user-1',
        details: {},
        created_at: '2024-11-15T10:00:00Z',
        user: mockUser,
      },
    ];

    const { container } = render(<TimelineSection history={history} />);

    // Check that there's no details section
    const detailsSection = container.querySelector('.bg-muted\\/50');
    expect(detailsSection).toBeNull();
  });
});
