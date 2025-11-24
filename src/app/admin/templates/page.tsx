'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TemplateForm } from '@/components/complaints/template-form';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import type { ComplaintTemplate, ComplaintCategory, ComplaintPriority } from '@/types/database.types';

// Mock templates data for UI development
const mockTemplates: ComplaintTemplate[] = [
  {
    id: '1',
    title: 'Broken Equipment in Lab',
    description: 'Template for reporting broken or malfunctioning equipment in laboratory facilities',
    category: 'facilities',
    suggested_priority: 'high',
    fields: {
      equipment_name: '',
      lab_room: '',
      issue_description: '',
    },
    created_by: 'lecturer-1',
    is_active: true,
    created_at: '2024-11-15T10:00:00Z',
    updated_at: '2024-11-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Assignment Grading Issue',
    description: 'Template for students to report concerns about assignment grading',
    category: 'academic',
    suggested_priority: 'medium',
    fields: {
      assignment_name: '',
      course_code: '',
      expected_grade: '',
      received_grade: '',
      concern_details: '',
    },
    created_by: 'lecturer-1',
    is_active: true,
    created_at: '2024-11-10T14:30:00Z',
    updated_at: '2024-11-10T14:30:00Z',
  },
  {
    id: '3',
    title: 'Classroom AC Not Working',
    description: 'Template for reporting air conditioning issues in classrooms',
    category: 'facilities',
    suggested_priority: 'medium',
    fields: {
      room_number: '',
      building: '',
      temperature_issue: '',
    },
    created_by: 'lecturer-2',
    is_active: true,
    created_at: '2024-11-08T09:15:00Z',
    updated_at: '2024-11-08T09:15:00Z',
  },
  {
    id: '4',
    title: 'Course Material Access Problem',
    description: 'Template for reporting issues accessing course materials or online resources',
    category: 'course_content',
    suggested_priority: 'high',
    fields: {
      course_name: '',
      material_type: '',
      access_error: '',
      platform: '',
    },
    created_by: 'lecturer-1',
    is_active: false,
    created_at: '2024-11-05T11:20:00Z',
    updated_at: '2024-11-18T16:45:00Z',
  },
  {
    id: '5',
    title: 'Parking Permit Issue',
    description: 'Template for reporting problems with parking permits or parking facilities',
    category: 'administrative',
    suggested_priority: 'low',
    fields: {
      permit_number: '',
      parking_lot: '',
      issue_type: '',
    },
    created_by: 'lecturer-3',
    is_active: true,
    created_at: '2024-11-01T08:00:00Z',
    updated_at: '2024-11-01T08:00:00Z',
  },
];

const CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'course_content', label: 'Course Content' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES: { value: ComplaintPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

export default function TemplateManagementPage() {
  const [templates, setTemplates] = React.useState<ComplaintTemplate[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState<ComplaintCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<ComplaintTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = React.useState<ComplaintTemplate | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Filter templates based on search and filters
  const filteredTemplates = React.useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        searchQuery === '' ||
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        filterCategory === 'all' || template.category === filterCategory;

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && template.is_active) ||
        (filterStatus === 'inactive' && !template.is_active);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [templates, searchQuery, filterCategory, filterStatus]);

  const handleToggleActive = (template: ComplaintTemplate) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === template.id
          ? { ...t, is_active: !t.is_active, updated_at: new Date().toISOString() }
          : t
      )
    );
    setSuccessMessage(
      `Template "${template.title}" ${template.is_active ? 'deactivated' : 'activated'} successfully`
    );
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDelete = (template: ComplaintTemplate) => {
    setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    setDeletingTemplate(null);
    setSuccessMessage(`Template "${template.title}" deleted successfully`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleEdit = (template: ComplaintTemplate) => {
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowCreateModal(true);
  };

  const handleSaveTemplate = (templateData: Partial<ComplaintTemplate>) => {
    if (editingTemplate) {
      // Update existing template
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                ...templateData,
                updated_at: new Date().toISOString(),
              }
            : t
        )
      );
      setSuccessMessage(`Template "${templateData.title}" updated successfully`);
    } else {
      // Create new template
      const newTemplate: ComplaintTemplate = {
        id: `template-${Date.now()}`,
        title: templateData.title!,
        description: templateData.description!,
        category: templateData.category!,
        suggested_priority: templateData.suggested_priority!,
        fields: templateData.fields || {},
        created_by: 'mock-lecturer-id',
        is_active: templateData.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTemplates((prev) => [newTemplate, ...prev]);
      setSuccessMessage(`Template "${templateData.title}" created successfully`);
    }
    setShowCreateModal(false);
    setEditingTemplate(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const getCategoryLabel = (category: ComplaintCategory) => {
    return CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const getPriorityBadge = (priority: ComplaintPriority) => {
    const priorityConfig = PRIORITIES.find((p) => p.value === priority);
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityConfig?.color}`}
      >
        {priorityConfig?.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Complaint Templates
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Create and manage templates to help students submit complaints more efficiently
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="md:col-span-1">
              <Label htmlFor="search">Search Templates</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <select
                id="category-filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ComplaintCategory | 'all')}
                className="mt-2 flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="mt-2 flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Create Button */}
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4" />
              Create New Template
            </Button>
          </div>
        </div>

        {/* Templates List */}
        <div className="space-y-4">
          {filteredTemplates.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-zinc-600 dark:text-zinc-400">
                {searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'No templates found matching your filters'
                  : 'No templates created yet. Create your first template to get started.'}
              </p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {template.title}
                      </h3>
                      {template.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {template.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      <div>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          Category:
                        </span>{' '}
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {getCategoryLabel(template.category)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          Suggested Priority:
                        </span>{' '}
                        {getPriorityBadge(template.suggested_priority)}
                      </div>
                      <div>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          Fields:
                        </span>{' '}
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {Object.keys(template.fields).length}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                      Created: {new Date(template.created_at).toLocaleDateString()} • Last
                      updated: {new Date(template.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(template)}
                      title={template.is_active ? 'Deactivate template' : 'Activate template'}
                    >
                      {template.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                      title="Edit template"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingTemplate(template)}
                      title="Delete template"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deletingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Delete Template
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Are you sure you want to delete &quot;{deletingTemplate.title}&quot;? This action
                cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeletingTemplate(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(deletingTemplate)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="my-8 w-full max-w-3xl rounded-lg border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {editingTemplate
                    ? 'Update the template details and fields below'
                    : 'Create a new template to help students submit complaints more efficiently'}
                </p>
              </div>
              <TemplateForm
                template={editingTemplate}
                onSave={handleSaveTemplate}
                onCancel={() => {
                  setShowCreateModal(false);
                  setEditingTemplate(null);
                }}
                isLoading={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
