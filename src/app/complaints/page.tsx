'use client';

import * as React from 'react';
import { lazy, Suspense } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import {
  ComplaintsHeader,
  ComplaintsSearchBar,
  saveFilterPreset,
  type FilterState,
  type FilterPreset,
} from '@/components/complaints';
import { useRouter } from 'next/navigation';
import type { Complaint, ComplaintTag, ComplaintStatus, User } from '@/types/database.types';
import { useAuth } from '@/hooks/useAuth';
import { useComplaintSearch } from '@/hooks/use-complaint-search';
import { exportComplaintsToCSV } from '@/lib/export';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components for better initial page load
const ComplaintsFilters = lazy(() =>
  import('@/components/complaints').then((mod) => ({ default: mod.ComplaintsFilters }))
);
const ComplaintsGrid = lazy(() =>
  import('@/components/complaints').then((mod) => ({ default: mod.ComplaintsGrid }))
);
const BulkActionBar = lazy(() =>
  import('@/components/complaints').then((mod) => ({ default: mod.BulkActionBar }))
);
const BulkActionConfirmationModal = lazy(() =>
  import('@/components/complaints').then((mod) => ({ default: mod.BulkActionConfirmationModal }))
);
const BulkAssignmentModal = lazy(() =>
  import('@/components/complaints').then((mod) => ({ default: mod.BulkAssignmentModal }))
);
const BulkTagAdditionModal = lazy(() =>
  import('@/components/complaints').then((mod) => ({ default: mod.BulkTagAdditionModal }))
);

// Mock lecturer data
const MOCK_LECTURERS: Record<string, User> = {
  'lecturer-1': {
    id: 'lecturer-1',
    email: 'smith@university.edu',
    role: 'lecturer',
    full_name: 'Dr. Smith',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'lecturer-2': {
    id: 'lecturer-2',
    email: 'johnson@university.edu',
    role: 'lecturer',
    full_name: 'Prof. Johnson',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'admin-1': {
    id: 'admin-1',
    email: 'davis@university.edu',
    role: 'admin',
    full_name: 'Admin Davis',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'admin-2': {
    id: 'admin-2',
    email: 'wilson@university.edu',
    role: 'admin',
    full_name: 'Admin Wilson',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

// Mock data for UI development
// Note: Using mock-student-id to match the getMockUser() ID for proper filtering
const MOCK_COMPLAINTS: (Complaint & {
  complaint_tags?: ComplaintTag[];
  assigned_lecturer?: User | null;
})[] = [
  {
    id: '1',
    student_id: 'mock-student-id', // Matches the mock student user
    is_anonymous: false,
    is_draft: false,
    title: 'Broken Air Conditioning in Lecture Hall A',
    description:
      '<p>The air conditioning system in Lecture Hall A has been malfunctioning for the past week. The temperature is unbearable during afternoon classes, making it difficult to concentrate.</p>',
    category: 'facilities',
    priority: 'high',
    status: 'new',
    assigned_to: null,
    assigned_lecturer: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    opened_at: null,
    opened_by: null,
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      {
        id: 't1',
        complaint_id: '1',
        tag_name: 'air-conditioning',
        created_at: new Date().toISOString(),
      },
      {
        id: 't2',
        complaint_id: '1',
        tag_name: 'lecture-hall',
        created_at: new Date().toISOString(),
      },
      { id: 't3', complaint_id: '1', tag_name: 'urgent', created_at: new Date().toISOString() },
    ],
  },
  {
    id: '2',
    student_id: null,
    is_anonymous: true,
    is_draft: false,
    title: 'Unfair Grading in CS101',
    description:
      '<p>I believe the grading criteria for the recent CS101 assignment were not clearly communicated. Several students received lower grades than expected without proper feedback.</p>',
    category: 'academic',
    priority: 'medium',
    status: 'opened',
    assigned_to: 'lecturer-1',
    assigned_lecturer: MOCK_LECTURERS['lecturer-1'],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    opened_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    opened_by: 'lecturer-1',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      { id: 't4', complaint_id: '2', tag_name: 'grading', created_at: new Date().toISOString() },
      { id: 't5', complaint_id: '2', tag_name: 'cs101', created_at: new Date().toISOString() },
    ],
  },
  {
    id: '3',
    student_id: 'mock-student-id', // Matches the mock student user
    is_anonymous: false,
    is_draft: false,
    title: 'Library WiFi Connection Issues',
    description:
      '<p>The WiFi in the library keeps disconnecting every 10-15 minutes. This is affecting my ability to complete online assignments and research.</p>',
    category: 'facilities',
    priority: 'medium',
    status: 'in_progress',
    assigned_to: 'admin-1',
    assigned_lecturer: MOCK_LECTURERS['admin-1'],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    opened_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    opened_by: 'admin-1',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      { id: 't6', complaint_id: '3', tag_name: 'wifi', created_at: new Date().toISOString() },
      { id: 't7', complaint_id: '3', tag_name: 'library', created_at: new Date().toISOString() },
      {
        id: 't8',
        complaint_id: '3',
        tag_name: 'connectivity',
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: '4',
    student_id: 'student-2',
    is_anonymous: false,
    is_draft: false,
    title: 'Missing Course Materials for MATH202',
    description:
      '<p>The professor mentioned that course materials would be uploaded to the portal, but they have not been made available yet. The midterm is next week and we need these materials to study.</p>',
    category: 'course_content',
    priority: 'high',
    status: 'new',
    assigned_to: null,
    assigned_lecturer: null,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    opened_at: null,
    opened_by: null,
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      {
        id: 't9',
        complaint_id: '4',
        tag_name: 'course-materials',
        created_at: new Date().toISOString(),
      },
      { id: 't10', complaint_id: '4', tag_name: 'math202', created_at: new Date().toISOString() },
    ],
  },
  {
    id: '5',
    student_id: 'mock-student-id', // Matches the mock student user
    is_anonymous: false,
    is_draft: false,
    title: 'Parking Lot Lighting Safety Concern',
    description:
      '<p>Several lights in the north parking lot are not working, making it very dark and unsafe for students leaving evening classes. This is a safety hazard that needs immediate attention.</p>',
    category: 'facilities',
    priority: 'critical',
    status: 'opened',
    assigned_to: 'admin-2',
    assigned_lecturer: MOCK_LECTURERS['admin-2'],
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    opened_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    opened_by: 'admin-2',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      { id: 't11', complaint_id: '5', tag_name: 'parking', created_at: new Date().toISOString() },
      { id: 't12', complaint_id: '5', tag_name: 'safety', created_at: new Date().toISOString() },
      { id: 't13', complaint_id: '5', tag_name: 'lighting', created_at: new Date().toISOString() },
    ],
  },
  {
    id: '6',
    student_id: 'student-3',
    is_anonymous: false,
    is_draft: false,
    title: 'Registration System Error',
    description:
      '<p>I am unable to register for next semester courses. The system shows an error message every time I try to add a course to my schedule.</p>',
    category: 'administrative',
    priority: 'high',
    status: 'resolved',
    assigned_to: 'admin-1',
    assigned_lecturer: MOCK_LECTURERS['admin-1'],
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    opened_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    opened_by: 'admin-1',
    resolved_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      {
        id: 't14',
        complaint_id: '6',
        tag_name: 'registration',
        created_at: new Date().toISOString(),
      },
      {
        id: 't15',
        complaint_id: '6',
        tag_name: 'system-error',
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: '7',
    student_id: null,
    is_anonymous: true,
    is_draft: false,
    title: 'Inappropriate Behavior in Class',
    description:
      '<p>There have been instances of disruptive and inappropriate behavior from certain students during lectures. This is affecting the learning environment for everyone.</p>',
    category: 'harassment',
    priority: 'high',
    status: 'in_progress',
    assigned_to: 'lecturer-2',
    assigned_lecturer: MOCK_LECTURERS['lecturer-2'],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    opened_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    opened_by: 'lecturer-2',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      { id: 't16', complaint_id: '7', tag_name: 'behavior', created_at: new Date().toISOString() },
      { id: 't17', complaint_id: '7', tag_name: 'classroom', created_at: new Date().toISOString() },
    ],
  },
  {
    id: '8',
    student_id: 'mock-student-id', // Matches the mock student user
    is_anonymous: false,
    is_draft: false,
    title: 'Cafeteria Food Quality',
    description:
      '<p>The quality of food in the cafeteria has declined significantly. Many students have complained about the taste and freshness of the meals.</p>',
    category: 'other',
    priority: 'low',
    status: 'new',
    assigned_to: null,
    assigned_lecturer: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    opened_at: null,
    opened_by: null,
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      { id: 't18', complaint_id: '8', tag_name: 'cafeteria', created_at: new Date().toISOString() },
      {
        id: 't19',
        complaint_id: '8',
        tag_name: 'food-quality',
        created_at: new Date().toISOString(),
      },
    ],
  },
];

export default function ComplaintsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [useSearch, setUseSearch] = React.useState(false);
  const [presetManagerKey, setPresetManagerKey] = React.useState(0);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);
  const [exportMessage, setExportMessage] = React.useState('');

  // Bulk selection state
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Bulk action modals state
  const [bulkActionModal, setBulkActionModal] = React.useState<{
    type: 'status' | 'assignment' | 'tags' | null;
    status?: ComplaintStatus;
  }>({ type: null });
  const [showConfirmationModal, setShowConfirmationModal] = React.useState(false);
  const [confirmationConfig, setConfirmationConfig] = React.useState<{
    title: string;
    description: string;
    action: () => void;
  } | null>(null);
  const [isBulkActionLoading, setIsBulkActionLoading] = React.useState(false);
  const [bulkActionProgress, setBulkActionProgress] = React.useState(0);
  const [bulkActionMessage, setBulkActionMessage] = React.useState('');

  // Get current user for role-based filtering
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const userRole = user?.role || 'student';
  const userId = user?.id || '';

  React.useEffect(() => {
    if (!authLoading && !user && !authError) {
      router.push('/login');
    }
  }, [user, authLoading, authError, router]);

  // Filter state
  const [filters, setFilters] = React.useState<FilterState>({
    status: [],
    category: [],
    priority: [],
    dateFrom: '',
    dateTo: '',
    tags: [],
    assignedTo: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Initialize search hook
  const {
    query: searchQuery,
    results: searchResults,
    isLoading: isSearching,
    error: searchError,
    suggestions: searchSuggestions,
    setQuery: setSearchQuery,
    search: performSearch,
    clearSearch,
  } = useComplaintSearch({
    autoSearch: false, // Manual search on button click or Enter
    pageSize: 5,
  });

  // Filter complaints based on user role and active filters
  const filteredComplaints = React.useMemo(() => {
    let complaints = MOCK_COMPLAINTS;

    // First, apply role-based filtering
    if (userRole === 'student') {
      // Students see only their own complaints
      complaints = complaints.filter((complaint) => complaint.student_id === userId);
    }

    // Apply status filter
    if (filters.status.length > 0) {
      complaints = complaints.filter((complaint) => filters.status.includes(complaint.status));
    }

    // Apply category filter
    if (filters.category.length > 0) {
      complaints = complaints.filter((complaint) => filters.category.includes(complaint.category));
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      complaints = complaints.filter((complaint) => filters.priority.includes(complaint.priority));
    }

    // Apply date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      complaints = complaints.filter((complaint) => new Date(complaint.created_at) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day
      complaints = complaints.filter((complaint) => new Date(complaint.created_at) <= toDate);
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      complaints = complaints.filter((complaint) =>
        complaint.complaint_tags?.some((tag) => filters.tags.includes(tag.tag_name))
      );
    }

    // Apply assigned lecturer filter
    if (filters.assignedTo) {
      complaints = complaints.filter((complaint) => complaint.assigned_to === filters.assignedTo);
    }

    // Apply sorting
    complaints = [...complaints].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          const statusOrder: Record<string, number> = {
            new: 1,
            opened: 2,
            in_progress: 3,
            resolved: 4,
            closed: 5,
            reopened: 6,
            draft: 7,
          };
          aValue = statusOrder[a.status] || 0;
          bValue = statusOrder[b.status] || 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return complaints;
  }, [userRole, userId, filters]);

  // Determine which complaints to display
  const displayComplaints = React.useMemo(() => {
    if (useSearch && searchResults) {
      // Use search results
      return searchResults.complaints;
    } else {
      // Use filtered mock data with pagination
      const itemsPerPage = 5;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredComplaints.slice(startIndex, endIndex);
    }
  }, [useSearch, searchResults, filteredComplaints, currentPage]);

  // Calculate pagination info
  const itemsPerPage = 5;
  const totalPages =
    useSearch && searchResults
      ? searchResults.totalPages
      : Math.ceil(filteredComplaints.length / itemsPerPage);

  // Simulate loading state on page change
  const handlePageChange = (page: number) => {
    setIsLoading(true);
    setCurrentPage(page);

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  };

  const handleComplaintClick = (complaintId: string) => {
    router.push(`/complaints/${complaintId}`);
  };

  const handleNewComplaint = () => {
    router.push('/complaints/new');
  };

  // Handle search
  const handleSearch = async (query: string) => {
    if (!query || query.trim().length < 2) {
      return;
    }

    setUseSearch(true);
    await performSearch(query);
  };

  // Handle search clear
  const handleClearSearch = () => {
    clearSearch();
    setUseSearch(false);
    setCurrentPage(1);
  };

  // Handle search query change
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);

    // If query is cleared, reset to normal view
    if (!query || query.trim().length === 0) {
      handleClearSearch();
    }
  };

  // Extract available tags from all complaints
  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    MOCK_COMPLAINTS.forEach((complaint) => {
      complaint.complaint_tags?.forEach((tag) => {
        tagSet.add(tag.tag_name);
      });
    });
    return Array.from(tagSet).sort();
  }, []);

  // Mock lecturers for filter
  const availableLecturers = React.useMemo(() => {
    return [
      { id: 'lecturer-1', name: 'Dr. Smith' },
      { id: 'lecturer-2', name: 'Prof. Johnson' },
      { id: 'admin-1', name: 'Admin Davis' },
      { id: 'admin-2', name: 'Admin Wilson' },
    ];
  }, []);

  // Handle save filter preset
  const handleSavePreset = (name: string, presetFilters: FilterState) => {
    try {
      saveFilterPreset(name, presetFilters);
      // Force re-render of preset manager to show new preset
      setPresetManagerKey((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to save preset:', error);
      // In a real app, show a toast notification
    }
  };

  // Handle load filter preset
  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
    setCurrentPage(1); // Reset to first page when loading preset
    // Clear search when loading preset
    if (useSearch) {
      handleClearSearch();
    }
  };

  // Handle CSV export (all filtered complaints)
  const handleExportCSV = () => {
    setIsExporting(true);

    try {
      // Export all filtered complaints (not just current page)
      const complaintsToExport = filteredComplaints.map((complaint) => ({
        ...complaint,
        student: complaint.student_id
          ? { id: complaint.student_id, full_name: 'Student', email: 'student@example.com' }
          : null,
        assigned_user: complaint.assigned_to ? MOCK_LECTURERS[complaint.assigned_to] : null,
        tags: complaint.complaint_tags,
      }));

      // Generate filename with timestamp and filters info
      const timestamp = new Date().toISOString().split('T')[0];
      const statusFilter = filters.status.length > 0 ? `_${filters.status.join('-')}` : '';
      const filename = `complaints_${timestamp}${statusFilter}.csv`;

      exportComplaintsToCSV(complaintsToExport, filename);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      // In a real app, show a toast notification
    } finally {
      setIsExporting(false);
    }
  };

  // Handle bulk export (selected complaints only)
  const handleBulkExport = () => {
    setConfirmationConfig({
      title: 'Export Complaints',
      description: `Are you sure you want to export ${selectedIds.size} complaint${selectedIds.size === 1 ? '' : 's'} to CSV? This will download a file to your computer.`,
      action: () => performBulkExport(),
    });
    setShowConfirmationModal(true);
  };

  const performBulkExport = async () => {
    setShowConfirmationModal(false);
    setIsExporting(true);
    setExportProgress(0);
    setExportMessage('Preparing export...');

    try {
      // Get selected complaints
      const selectedComplaints = filteredComplaints.filter((complaint) =>
        selectedIds.has(complaint.id)
      );

      setExportProgress(20);
      setExportMessage(`Preparing ${selectedComplaints.length} complaints for export...`);

      const complaintsToExport = selectedComplaints.map((complaint) => ({
        ...complaint,
        student: complaint.student_id
          ? { id: complaint.student_id, full_name: 'Student', email: 'student@example.com' }
          : null,
        assigned_user: complaint.assigned_to ? MOCK_LECTURERS[complaint.assigned_to] : null,
        tags: complaint.complaint_tags,
      }));

      setExportProgress(60);
      setExportMessage('Generating CSV file...');

      // Simulate async operation for progress
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `complaints_selected_${timestamp}.csv`;

      exportComplaintsToCSV(complaintsToExport, filename);

      setExportProgress(100);
      setExportMessage('Export complete!');

      // Wait a bit before clearing
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Clear selection after export
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      setExportMessage('Export failed');
      // In a real app, show a toast notification
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setExportMessage('');
    }
  };

  // Toggle selection mode
  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      // Clear selection when exiting selection mode
      setSelectedIds(new Set());
    }
  };

  // Select all complaints on current page
  const handleSelectAll = () => {
    const allIds = new Set(filteredComplaints.map((c) => c.id));
    setSelectedIds(allIds);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  // Bulk status change
  const handleBulkStatusChange = (status: ComplaintStatus) => {
    setConfirmationConfig({
      title: 'Change Status',
      description: `Are you sure you want to change the status of the selected complaints to "${status}"?`,
      action: () => performBulkStatusChange(status),
    });
    setShowConfirmationModal(true);
  };

  const performBulkStatusChange = async (status: ComplaintStatus) => {
    setIsBulkActionLoading(true);
    setBulkActionProgress(0);
    setBulkActionMessage('Preparing to change status...');
    setShowConfirmationModal(false);

    try {
      const complaintIdsArray = Array.from(selectedIds);
      const totalComplaints = complaintIdsArray.length;

      setBulkActionProgress(10);
      setBulkActionMessage(
        `Changing status of ${totalComplaints} complaint${totalComplaints === 1 ? '' : 's'}...`
      );

      // Call the bulk status change API
      const { bulkChangeStatus } = await import('@/lib/api/complaints');

      // Simulate progress during API call
      setBulkActionProgress(30);
      setBulkActionMessage('Processing status changes...');

      const results = await bulkChangeStatus(complaintIdsArray, status, userId);

      setBulkActionProgress(80);
      setBulkActionMessage('Updating history and sending notifications...');
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Show results
      if (results.success > 0) {
        setBulkActionProgress(100);
        setBulkActionMessage(
          `Successfully changed status of ${results.success} complaint${results.success === 1 ? '' : 's'}!`
        );
        console.log(`Successfully changed status of ${results.success} complaint(s)`);
        // In real app, show success toast notification
      }

      if (results.failed > 0) {
        console.error(`Failed to change status of ${results.failed} complaint(s):`, results.errors);
        setBulkActionMessage(
          `Changed status of ${results.success} complaints, ${results.failed} failed`
        );
        // In real app, show error toast notification with details
      }

      // Wait a moment to show completion
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Clear selection after successful action
      setSelectedIds(new Set());
      setSelectionMode(false);

      // In a real implementation with live data, you would refresh the complaint list here
      // For now with mock data, the UI will update on next page load
    } catch (error) {
      console.error('Failed to change status:', error);
      setBulkActionMessage('Failed to change status');
      // In real app, show error toast notification
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to change status'}`);
    } finally {
      setIsBulkActionLoading(false);
      setBulkActionProgress(0);
      setBulkActionMessage('');
    }
  };

  // Bulk assignment
  const handleBulkAssignment = () => {
    setConfirmationConfig({
      title: 'Assign Complaints',
      description: `You are about to assign ${selectedIds.size} complaint${selectedIds.size === 1 ? '' : 's'}. This action will open the assignment dialog.`,
      action: () => {
        setShowConfirmationModal(false);
        setBulkActionModal({ type: 'assignment' });
      },
    });
    setShowConfirmationModal(true);
  };

  const performBulkAssignment = async (lecturerId: string) => {
    setIsBulkActionLoading(true);
    setBulkActionProgress(0);
    setBulkActionMessage('Preparing to assign complaints...');
    setBulkActionModal({ type: null });

    try {
      const complaintIdsArray = Array.from(selectedIds);
      const totalComplaints = complaintIdsArray.length;

      setBulkActionProgress(10);
      setBulkActionMessage(
        `Assigning ${totalComplaints} complaint${totalComplaints === 1 ? '' : 's'}...`
      );

      // Call the bulk assignment API
      const { bulkAssignComplaints } = await import('@/lib/api/complaints');

      // Simulate progress during API call
      setBulkActionProgress(30);
      setBulkActionMessage('Processing assignments...');

      const results = await bulkAssignComplaints(complaintIdsArray, lecturerId, userId);

      setBulkActionProgress(80);
      setBulkActionMessage('Updating records and sending notifications...');
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Show results
      if (results.success > 0) {
        setBulkActionProgress(100);
        setBulkActionMessage(
          `Successfully assigned ${results.success} complaint${results.success === 1 ? '' : 's'}!`
        );
        console.log(`Successfully assigned ${results.success} complaint(s)`);
        // In real app, show success toast notification
      }

      if (results.failed > 0) {
        console.error(`Failed to assign ${results.failed} complaint(s):`, results.errors);
        setBulkActionMessage(`Assigned ${results.success} complaints, ${results.failed} failed`);
        // In real app, show error toast notification with details
      }

      // Wait a moment to show completion
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Clear selection after action
      setSelectedIds(new Set());
      setSelectionMode(false);

      // In a real implementation with live data, you would refresh the complaint list here
      // For now with mock data, the UI will update on next page load
    } catch (error) {
      console.error('Failed to assign complaints:', error);
      setBulkActionMessage('Failed to assign complaints');
      // In real app, show error toast notification
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to assign complaints'}`);
    } finally {
      setIsBulkActionLoading(false);
      setBulkActionProgress(0);
      setBulkActionMessage('');
    }
  };

  // Bulk tag addition
  const handleBulkTagAddition = () => {
    setConfirmationConfig({
      title: 'Add Tags',
      description: `You are about to add tags to ${selectedIds.size} complaint${selectedIds.size === 1 ? '' : 's'}. This action will open the tag addition dialog.`,
      action: () => {
        setShowConfirmationModal(false);
        setBulkActionModal({ type: 'tags' });
      },
    });
    setShowConfirmationModal(true);
  };

  const performBulkTagAddition = async (tags: string[]) => {
    setIsBulkActionLoading(true);
    setBulkActionProgress(0);
    setBulkActionMessage('Preparing to add tags...');
    setBulkActionModal({ type: null });

    try {
      const complaintIdsArray = Array.from(selectedIds);
      const totalComplaints = complaintIdsArray.length;

      setBulkActionProgress(10);
      setBulkActionMessage(
        `Adding ${tags.length} tag${tags.length === 1 ? '' : 's'} to ${totalComplaints} complaint${totalComplaints === 1 ? '' : 's'}...`
      );

      // Call the bulk tag addition API
      const { bulkAddTags } = await import('@/lib/api/complaints');

      // Simulate progress during API call
      setBulkActionProgress(30);
      setBulkActionMessage('Processing tag additions...');

      const results = await bulkAddTags(complaintIdsArray, tags, userId);

      setBulkActionProgress(80);
      setBulkActionMessage('Updating records...');
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Show results
      if (results.success > 0) {
        setBulkActionProgress(100);
        setBulkActionMessage(
          `Successfully added tags to ${results.success} complaint${results.success === 1 ? '' : 's'}!`
        );
        console.log(`Successfully added tags to ${results.success} complaint(s)`);
        // In real app, show success toast notification
      }

      if (results.failed > 0) {
        console.error(`Failed to add tags to ${results.failed} complaint(s):`, results.errors);
        setBulkActionMessage(
          `Added tags to ${results.success} complaints, ${results.failed} failed`
        );
        // In real app, show error toast notification with details
      }

      // Wait a moment to show completion
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Clear selection after action
      setSelectedIds(new Set());
      setSelectionMode(false);

      // In a real implementation with live data, you would refresh the complaint list here
      // For now with mock data, the UI will update on next page load
    } catch (error) {
      console.error('Failed to add tags:', error);
      setBulkActionMessage('Failed to add tags');
      // In real app, show error toast notification
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to add tags'}`);
    } finally {
      setIsBulkActionLoading(false);
      setBulkActionProgress(0);
      setBulkActionMessage('');
    }
  };

  if (authLoading || !user) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'student'}
        userName={user?.full_name || 'Loading...'}
        userEmail={user?.email || ''}
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-[300px] mb-4" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole={userRole} userName={user.full_name} userEmail={user.email}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <ComplaintsHeader
          userRole={userRole}
          onNewComplaint={handleNewComplaint}
          onExportCSV={handleExportCSV}
          isExporting={isExporting}
          selectionMode={selectionMode}
          onToggleSelectionMode={handleToggleSelectionMode}
        />

        {/* Search Bar */}
        <ComplaintsSearchBar
          searchQuery={searchQuery}
          searchSuggestions={searchSuggestions}
          isSearching={isSearching}
          searchError={searchError}
          useSearch={useSearch}
          searchResults={searchResults}
          onSearchQueryChange={handleSearchQueryChange}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filter Panel - Sidebar */}
          <div className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              }
            >
              <ComplaintsFilters
                userRole={userRole}
                userId={userId}
                filters={filters}
                availableTags={availableTags}
                availableLecturers={availableLecturers}
                useSearch={useSearch}
                presetManagerKey={presetManagerKey}
                onFiltersChange={setFilters}
                onResetPage={() => setCurrentPage(1)}
                onClearSearch={handleClearSearch}
                onSavePreset={handleSavePreset}
                onLoadPreset={handleLoadPreset}
              />
            </Suspense>
          </div>

          {/* Complaint List - Main Content */}
          <div className="lg:col-span-3">
            <Suspense
              fallback={
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              }
            >
              <ComplaintsGrid
                userRole={userRole}
                complaints={displayComplaints}
                isLoading={isLoading || isSearching}
                currentPage={currentPage}
                totalPages={totalPages}
                useSearch={useSearch}
                searchQuery={searchQuery}
                onComplaintClick={handleComplaintClick}
                onPageChange={handlePageChange}
                onClearSearch={handleClearSearch}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
            </Suspense>
          </div>
        </div>

        {/* Bulk Action Bar */}
        <Suspense fallback={null}>
          <BulkActionBar
            selectedCount={selectedIds.size}
            totalCount={filteredComplaints.length}
            isExporting={isExporting}
            exportProgress={exportProgress}
            exportMessage={exportMessage}
            isBulkActionLoading={isBulkActionLoading}
            bulkActionProgress={bulkActionProgress}
            bulkActionMessage={bulkActionMessage}
            onExport={handleBulkExport}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkAssignment={handleBulkAssignment}
            onBulkTagAddition={handleBulkTagAddition}
            userRole={userRole}
          />
        </Suspense>

        {/* Bulk Action Confirmation Modal */}
        {confirmationConfig && (
          <Suspense fallback={null}>
            <BulkActionConfirmationModal
              open={showConfirmationModal}
              onOpenChange={setShowConfirmationModal}
              title={confirmationConfig.title}
              description={confirmationConfig.description}
              itemCount={selectedIds.size}
              onConfirm={confirmationConfig.action}
              isLoading={isBulkActionLoading}
            />
          </Suspense>
        )}

        {/* Bulk Assignment Modal */}
        <Suspense fallback={null}>
          <BulkAssignmentModal
            open={bulkActionModal.type === 'assignment'}
            onOpenChange={(open) => !open && setBulkActionModal({ type: null })}
            itemCount={selectedIds.size}
            availableLecturers={availableLecturers}
            onConfirm={performBulkAssignment}
            isLoading={isBulkActionLoading}
          />
        </Suspense>

        {/* Bulk Tag Addition Modal */}
        <Suspense fallback={null}>
          <BulkTagAdditionModal
            open={bulkActionModal.type === 'tags'}
            onOpenChange={(open) => !open && setBulkActionModal({ type: null })}
            itemCount={selectedIds.size}
            availableTags={availableTags}
            onConfirm={performBulkTagAddition}
            isLoading={isBulkActionLoading}
          />
        </Suspense>
      </div>
    </AppLayout>
  );
}
