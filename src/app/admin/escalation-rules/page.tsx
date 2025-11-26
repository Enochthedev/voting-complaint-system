'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EscalationRuleForm } from '@/components/complaints/escalation-rule-form';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpCircle,
} from 'lucide-react';
import type {
  EscalationRule,
  ComplaintCategory,
  ComplaintPriority,
  User,
} from '@/types/database.types';

// Mock escalation rules data for UI development
const mockRules: EscalationRule[] = [
  {
    id: '1',
    category: 'harassment',
    priority: 'critical',
    hours_threshold: 2,
    escalate_to: 'admin-1',
    is_active: true,
    created_at: '2024-11-01T10:00:00Z',
    updated_at: '2024-11-01T10:00:00Z',
  },
  {
    id: '2',
    category: 'facilities',
    priority: 'high',
    hours_threshold: 24,
    escalate_to: 'admin-2',
    is_active: true,
    created_at: '2024-11-05T14:30:00Z',
    updated_at: '2024-11-05T14:30:00Z',
  },
  {
    id: '3',
    category: 'academic',
    priority: 'high',
    hours_threshold: 48,
    escalate_to: 'admin-1',
    is_active: true,
    created_at: '2024-11-10T09:15:00Z',
    updated_at: '2024-11-10T09:15:00Z',
  },
  {
    id: '4',
    category: 'course_content',
    priority: 'medium',
    hours_threshold: 72,
    escalate_to: 'admin-3',
    is_active: false,
    created_at: '2024-11-12T11:20:00Z',
    updated_at: '2024-11-20T16:45:00Z',
  },
  {
    id: '5',
    category: 'administrative',
    priority: 'low',
    hours_threshold: 168,
    escalate_to: 'admin-2',
    is_active: true,
    created_at: '2024-11-15T08:00:00Z',
    updated_at: '2024-11-15T08:00:00Z',
  },
];

// Mock users (lecturers/admins) for assignment
const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin1@university.edu',
    role: 'admin',
    full_name: 'Dr. Sarah Johnson',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'admin-2',
    email: 'admin2@university.edu',
    role: 'admin',
    full_name: 'Prof. Michael Chen',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'admin-3',
    email: 'admin3@university.edu',
    role: 'admin',
    full_name: 'Dr. Emily Rodriguez',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'lecturer-1',
    email: 'lecturer1@university.edu',
    role: 'lecturer',
    full_name: 'Dr. James Wilson',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
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
  {
    value: 'low',
    label: 'Low',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  {
    value: 'high',
    label: 'High',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  {
    value: 'critical',
    label: 'Critical',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
];

export default function EscalationRulesPage() {
  const [rules, setRules] = React.useState<EscalationRule[]>(mockRules);
  const [users] = React.useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState<ComplaintCategory | 'all'>('all');
  const [filterPriority, setFilterPriority] = React.useState<ComplaintPriority | 'all'>('all');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<EscalationRule | null>(null);
  const [deletingRule, setDeletingRule] = React.useState<EscalationRule | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Filter rules based on search and filters
  const filteredRules = React.useMemo(() => {
    return rules.filter((rule) => {
      const assignedUser = users.find((u) => u.id === rule.escalate_to);
      const matchesSearch =
        searchQuery === '' ||
        getCategoryLabel(rule.category).toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignedUser?.full_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || rule.priority === filterPriority;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && rule.is_active) ||
        (filterStatus === 'inactive' && !rule.is_active);

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [rules, users, searchQuery, filterCategory, filterPriority, filterStatus]);

  const handleToggleActive = (rule: EscalationRule) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === rule.id
          ? { ...r, is_active: !r.is_active, updated_at: new Date().toISOString() }
          : r
      )
    );
    setSuccessMessage(`Rule ${rule.is_active ? 'deactivated' : 'activated'} successfully`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDelete = (rule: EscalationRule) => {
    setRules((prev) => prev.filter((r) => r.id !== rule.id));
    setDeletingRule(null);
    setSuccessMessage('Escalation rule deleted successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleEdit = (rule: EscalationRule) => {
    setEditingRule(rule);
    setShowCreateModal(true);
  };

  const handleCreateNew = () => {
    setEditingRule(null);
    setShowCreateModal(true);
  };

  const handleSaveRule = (ruleData: Partial<EscalationRule>) => {
    if (editingRule) {
      // Update existing rule
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingRule.id
            ? {
                ...r,
                ...ruleData,
                updated_at: new Date().toISOString(),
              }
            : r
        )
      );
      setSuccessMessage('Escalation rule updated successfully');
    } else {
      // Create new rule
      const newRule: EscalationRule = {
        id: `rule-${Date.now()}`,
        category: ruleData.category!,
        priority: ruleData.priority!,
        hours_threshold: ruleData.hours_threshold!,
        escalate_to: ruleData.escalate_to!,
        is_active: ruleData.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setRules((prev) => [newRule, ...prev]);
      setSuccessMessage('Escalation rule created successfully');
    }

    setShowCreateModal(false);
    setEditingRule(null);
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

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.full_name || 'Unknown User';
  };

  const formatThreshold = (hours: number) => {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Auto-Escalation Rules
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Configure automatic escalation rules for complaints that remain unaddressed
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

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Escalation rules automatically reassign complaints to designated users when they remain
            unaddressed for a specified time period. Rules are checked hourly.
          </AlertDescription>
        </Alert>

        {/* Search and Filters */}
        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="md:col-span-1">
              <Label htmlFor="search">Search Rules</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by category or user..."
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

            {/* Priority Filter */}
            <div>
              <Label htmlFor="priority-filter">Priority</Label>
              <select
                id="priority-filter"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as ComplaintPriority | 'all')}
                className="mt-2 flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
              >
                <option value="all">All Priorities</option>
                {PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
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
              Create New Rule
            </Button>
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          {filteredRules.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <ArrowUpCircle className="mx-auto h-12 w-12 text-zinc-400" />
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                {searchQuery ||
                filterCategory !== 'all' ||
                filterPriority !== 'all' ||
                filterStatus !== 'all'
                  ? 'No escalation rules found matching your filters'
                  : 'No escalation rules configured yet. Create your first rule to get started.'}
              </p>
            </div>
          ) : (
            filteredRules.map((rule) => (
              <div
                key={rule.id}
                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {getCategoryLabel(rule.category)} - {getPriorityBadge(rule.priority)}
                      </h3>
                      {rule.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-zinc-500" />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          Time Threshold:
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {formatThreshold(rule.hours_threshold)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="h-4 w-4 text-zinc-500" />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          Escalate To:
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {getUserName(rule.escalate_to)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
                      Created: {new Date(rule.created_at).toLocaleDateString()} • Last updated:{' '}
                      {new Date(rule.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(rule)}
                      title={rule.is_active ? 'Deactivate rule' : 'Activate rule'}
                    >
                      {rule.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(rule)}
                      title="Edit rule"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingRule(rule)}
                      title="Delete rule"
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
        {deletingRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Delete Escalation Rule
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Are you sure you want to delete this escalation rule for{' '}
                <span className="font-semibold">
                  {getCategoryLabel(deletingRule.category)} - {deletingRule.priority}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeletingRule(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(deletingRule)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {editingRule ? 'Edit Escalation Rule' : 'Create New Escalation Rule'}
              </h3>
              <EscalationRuleForm
                rule={editingRule}
                users={users}
                existingRules={rules}
                onSave={handleSaveRule}
                onCancel={() => {
                  setShowCreateModal(false);
                  setEditingRule(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
