import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComplaintsHeader } from '../complaints-header';

describe('ComplaintsHeader', () => {
    const mockOnNewComplaint = jest.fn();

    beforeEach(() => {
        mockOnNewComplaint.mockClear();
    });

    describe('Student View', () => {
        it('should render "My Complaints" title for students', () => {
            render(
                <ComplaintsHeader
                    userRole="student"
                    onNewComplaint={mockOnNewComplaint}
                />
            );

            expect(screen.getByText('My Complaints')).toBeInTheDocument();
            expect(
                screen.getByText('View and manage your submitted complaints')
            ).toBeInTheDocument();
        });

        it('should show "New Complaint" button for students', () => {
            render(
                <ComplaintsHeader
                    userRole="student"
                    onNewComplaint={mockOnNewComplaint}
                />
            );

            const button = screen.getByRole('button', { name: /new complaint/i });
            expect(button).toBeInTheDocument();
        });

        it('should call onNewComplaint when button is clicked', async () => {
            const user = userEvent.setup();
            render(
                <ComplaintsHeader
                    userRole="student"
                    onNewComplaint={mockOnNewComplaint}
                />
            );

            const button = screen.getByRole('button', { name: /new complaint/i });
            await user.click(button);

            expect(mockOnNewComplaint).toHaveBeenCalledTimes(1);
        });
    });

    describe('Lecturer View', () => {
        it('should render "All Complaints" title for lecturers', () => {
            render(
                <ComplaintsHeader
                    userRole="lecturer"
                    onNewComplaint={mockOnNewComplaint}
                />
            );

            expect(screen.getByText('All Complaints')).toBeInTheDocument();
            expect(
                screen.getByText('View and manage all student complaints')
            ).toBeInTheDocument();
        });

        it('should not show "New Complaint" button for lecturers', () => {
            render(
                <ComplaintsHeader
                    userRole="lecturer"
                    onNewComplaint={mockOnNewComplaint}
                />
            );

            expect(
                screen.queryByRole('button', { name: /new complaint/i })
            ).not.toBeInTheDocument();
        });
    });

    describe('Admin View', () => {
        it('should render "All Complaints" title for admins', () => {
            render(
                <ComplaintsHeader
                    userRole="admin"
                    onNewComplaint={mockOnNewComplaint}
                />
            );

            expect(screen.getByText('All Complaints')).toBeInTheDocument();
            expect(
                screen.getByText('View and manage all student complaints')
            ).toBeInTheDocument();
        });

        it('should not show "New Complaint" button for admins', () => {
            render(
                <ComplaintsHeader
                    userRole="admin"
                    onNewComplaint={mockOnNewComplaint}
                />
            );

            expect(
                screen.queryByRole('button', { name: /new complaint/i })
            ).not.toBeInTheDocument();
        });
    });
});
