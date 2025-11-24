'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { FileUpload } from '@/components/ui/file-upload';
import { AlertCircle, Loader2, Info, FileText, X } from 'lucide-react';
import type { ComplaintCategory, ComplaintPriority, ComplaintTemplate } from '@/types/database.types';

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  general?: string;
}

interface ComplaintFormData {
  title: string;
  description: string;
  category: ComplaintCategory | '';
  priority: ComplaintPriority | '';
  isAnonymous: boolean;
  tags: string[];
  files: File[];
}

interface ComplaintFormProps {
  onSubmit?: (data: ComplaintFormData, isDraft: boolean) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<Omit<ComplaintFormData, 'files'>> & { files?: File[] };
  isEditing?: boolean;
  showTemplateSelector?: boolean;
}

const CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'course_content', label: 'Course Content' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES: { value: ComplaintPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-secondary text-secondary-foreground border-border' },
  { value: 'medium', label: 'Medium', color: 'bg-accent/20 text-accent-foreground border-accent/30' },
  { value: 'high', label: 'High', color: 'bg-primary/20 text-primary border-primary/30' },
  { value: 'critical', label: 'Critical', color: 'bg-destructive/20 text-destructive border-destructive/30' },
];

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;

export function ComplaintForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  showTemplateSelector = true,
}: ComplaintFormProps) {
  const [formData, setFormData] = React.useState<ComplaintFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    priority: initialData?.priority || '',
    isAnonymous: initialData?.isAnonymous || false,
    tags: initialData?.tags || [],
    files: initialData?.files || [],
  });

  const [tagInput, setTagInput] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(-1);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<ComplaintTemplate | null>(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = React.useState(false);
  const [loadingTemplates, setLoadingTemplates] = React.useState(false);
  const tagInputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);
  const templateDropdownRef = React.useRef<HTMLDivElement>(null);

  // Mock templates for UI development (in production, fetch from database)
  const availableTemplates = React.useMemo<ComplaintTemplate[]>(
    () => [
      {
        id: '1',
        title: 'Broken Equipment in Lab',
        description: 'Template for reporting broken or malfunctioning equipment in laboratory facilities',
        category: 'facilities',
        suggested_priority: 'high',
        fields: {
          equipment_name: { label: 'Equipment Name', type: 'text', required: true, placeholder: 'e.g., Microscope, Computer' },
          lab_room: { label: 'Lab Room', type: 'text', required: true, placeholder: 'e.g., Lab 301' },
          issue_description: { label: 'Issue Description', type: 'textarea', required: true, placeholder: 'Describe the problem' },
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
          assignment_name: { label: 'Assignment Name', type: 'text', required: true, placeholder: 'e.g., Assignment 3' },
          course_code: { label: 'Course Code', type: 'text', required: true, placeholder: 'e.g., CS101' },
          expected_grade: { label: 'Expected Grade', type: 'text', required: false, placeholder: 'e.g., A' },
          received_grade: { label: 'Received Grade', type: 'text', required: true, placeholder: 'e.g., B' },
          concern_details: { label: 'Concern Details', type: 'textarea', required: true, placeholder: 'Explain your concern' },
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
          room_number: { label: 'Room Number', type: 'text', required: true, placeholder: 'e.g., Room 205' },
          building: { label: 'Building', type: 'text', required: true, placeholder: 'e.g., Engineering Building' },
          temperature_issue: { label: 'Temperature Issue', type: 'textarea', required: true, placeholder: 'Describe the temperature problem' },
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
          course_name: { label: 'Course Name', type: 'text', required: true, placeholder: 'e.g., Introduction to Programming' },
          material_type: { label: 'Material Type', type: 'text', required: true, placeholder: 'e.g., Lecture slides, Video' },
          access_error: { label: 'Access Error', type: 'textarea', required: true, placeholder: 'Describe the error message or issue' },
          platform: { label: 'Platform', type: 'text', required: false, placeholder: 'e.g., Moodle, Canvas' },
        },
        created_by: 'lecturer-1',
        is_active: true,
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
          permit_number: { label: 'Permit Number', type: 'text', required: false, placeholder: 'e.g., P12345' },
          parking_lot: { label: 'Parking Lot', type: 'text', required: true, placeholder: 'e.g., Lot A' },
          issue_type: { label: 'Issue Type', type: 'textarea', required: true, placeholder: 'Describe the parking issue' },
        },
        created_by: 'lecturer-3',
        is_active: true,
        created_at: '2024-11-01T08:00:00Z',
        updated_at: '2024-11-01T08:00:00Z',
      },
    ],
    []
  );

  // Mock popular tags for autocomplete (in production, fetch from database)
  const popularTags = React.useMemo(
    () => [
      'wifi-issues',
      'classroom',
      'assignment',
      'grading',
      'schedule',
      'equipment',
      'parking',
      'library',
      'cafeteria',
      'registration',
      'exam',
      'professor',
      'course-material',
      'lab',
      'software',
      'hardware',
      'accessibility',
      'safety',
      'cleanliness',
      'noise',
    ],
    []
  );

  // Helper function to strip HTML tags and get text content
  const getTextContent = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const validateForm = (isDraft: boolean = false): boolean => {
    const newErrors: FormErrors = {};

    // For drafts, only validate if fields have content
    if (!isDraft) {
      // Title validation
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      } else if (formData.title.length > MAX_TITLE_LENGTH) {
        newErrors.title = `Title must be ${MAX_TITLE_LENGTH} characters or less`;
      }

      // Description validation - check text content, not HTML
      const descriptionText = getTextContent(formData.description).trim();
      if (!descriptionText) {
        newErrors.description = 'Description is required';
      } else if (descriptionText.length > MAX_DESCRIPTION_LENGTH) {
        newErrors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
      }

      // Category validation
      if (!formData.category) {
        newErrors.category = 'Please select a category';
      }

      // Priority validation
      if (!formData.priority) {
        newErrors.priority = 'Please select a priority level';
      }
    } else {
      // For drafts, validate length if content exists
      if (formData.title && formData.title.length > MAX_TITLE_LENGTH) {
        newErrors.title = `Title must be ${MAX_TITLE_LENGTH} characters or less`;
      }
      const descriptionText = getTextContent(formData.description);
      if (descriptionText && descriptionText.length > MAX_DESCRIPTION_LENGTH) {
        newErrors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm(isDraft)) {
      // Scroll to first error
      const firstError = document.querySelector('[class*="border-red"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (isDraft) {
      setIsSavingDraft(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(formData, isDraft);
      } else {
        // Mock submission for UI development
        console.log('Form submitted:', { ...formData, isDraft });
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({
        general: isDraft
          ? 'Failed to save draft. Please try again.'
          : 'An error occurred while submitting. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsSavingDraft(false);
    }
  };

  // Filter suggestions based on input
  React.useEffect(() => {
    if (tagInput.trim()) {
      const input = tagInput.toLowerCase();
      const suggestions = popularTags
        .filter(
          (tag) =>
            tag.toLowerCase().includes(input) && !formData.tags.includes(tag)
        )
        .slice(0, 8); // Limit to 8 suggestions
      setFilteredSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
      setActiveSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [tagInput, formData.tags, popularTags]);

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        tagInputRef.current &&
        !tagInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
      if (
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTemplateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTag = (tag?: string) => {
    const tagToAdd = (tag || tagInput).trim().toLowerCase();
    if (tagToAdd && !formData.tags.includes(tagToAdd)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagToAdd],
      }));
      setTagInput('');
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
      tagInputRef.current?.focus();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && filteredSuggestions[activeSuggestionIndex]) {
        handleAddTag(filteredSuggestions[activeSuggestionIndex]);
      } else {
        handleAddTag();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setActiveSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleSuggestionClick = (tag: string) => {
    handleAddTag(tag);
  };

  const handleTemplateSelect = (template: ComplaintTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateDropdown(false);

    // Pre-fill form fields from template
    setFormData((prev) => ({
      ...prev,
      title: template.title,
      category: template.category,
      priority: template.suggested_priority,
      // Build description from template fields with structured format
      description: buildDescriptionFromTemplate(template),
      // Optionally pre-fill tags based on template category
      tags: getSuggestedTagsForTemplate(template),
    }));
  };

  const getSuggestedTagsForTemplate = (template: ComplaintTemplate): string[] => {
    // Suggest relevant tags based on template category and title
    const tags: string[] = [];
    
    // Add category-based tag
    const categoryTag = template.category.replace('_', '-');
    tags.push(categoryTag);
    
    // Add tags based on template title keywords
    const titleLower = template.title.toLowerCase();
    if (titleLower.includes('equipment') || titleLower.includes('lab')) {
      tags.push('equipment');
    }
    if (titleLower.includes('grading') || titleLower.includes('assignment')) {
      tags.push('grading');
    }
    if (titleLower.includes('classroom') || titleLower.includes('room')) {
      tags.push('classroom');
    }
    if (titleLower.includes('ac') || titleLower.includes('air conditioning')) {
      tags.push('facilities');
    }
    if (titleLower.includes('access') || titleLower.includes('material')) {
      tags.push('course-material');
    }
    if (titleLower.includes('parking')) {
      tags.push('parking');
    }
    
    // Remove duplicates and return
    return [...new Set(tags)];
  };

  const buildDescriptionFromTemplate = (template: ComplaintTemplate): string => {
    // Start with template description as header
    let description = `<p><strong>${template.description}</strong></p><br/>`;
    
    // Add structured fields for user to fill in
    if (template.fields && typeof template.fields === 'object') {
      description += '<p><strong>Please provide the following information:</strong></p><br/>';
      
      Object.entries(template.fields).forEach(([fieldName, fieldConfig]: [string, any]) => {
        const label = fieldConfig.label || fieldName;
        const placeholder = fieldConfig.placeholder || '';
        const required = fieldConfig.required ? ' (Required)' : ' (Optional)';
        
        // Create a structured field entry
        description += `<p><strong>${label}${required}:</strong></p>`;
        description += `<p><em>${placeholder || 'Enter information here...'}</em></p><br/>`;
      });
    }
    
    return description;
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: '',
      isAnonymous: false,
      tags: [],
      files: [],
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(false);
      }}
      className="space-y-6"
    >
      {/* Template Selector */}
      {showTemplateSelector && !isEditing && (
        <div className="space-y-2">
          <Label>Use a Template (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            Select a pre-defined template to help you fill out your complaint faster.
          </p>
          
          {selectedTemplate ? (
            <div className="flex items-center gap-3 rounded-lg border bg-muted p-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {selectedTemplate.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearTemplate}
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          ) : (
            <div className="relative" ref={templateDropdownRef}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                disabled={isLoading || isSavingDraft}
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4" />
                Browse Templates
              </Button>
              
              {showTemplateDropdown && (
                <div className="absolute z-10 mt-2 w-full rounded-md border border-border bg-card shadow-lg backdrop-blur-sm" style={{ backgroundColor: 'hsl(var(--card))' }}>
                  <div className="max-h-96 overflow-auto p-2">
                    {loadingTemplates ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : availableTemplates.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No templates available
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {availableTemplates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => handleTemplateSelect(template)}
                            className="w-full rounded-md p-3 text-left transition-colors hover:bg-accent"
                          >
                            <div className="flex items-start gap-2">
                              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground">
                                  {template.title}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                  {template.description}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                                    {CATEGORIES.find(c => c.value === template.category)?.label}
                                  </span>
                                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                                    {PRIORITIES.find(p => p.value === template.suggested_priority)?.label} Priority
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Anonymous Submission Toggle */}
      <div className="flex items-start space-x-3 rounded-lg border bg-muted p-4">
        <input
          type="checkbox"
          id="isAnonymous"
          checked={formData.isAnonymous}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, isAnonymous: e.target.checked }))
          }
          className="mt-1 h-4 w-4 rounded border-input bg-background focus:ring-2 focus:ring-ring"
        />
        <div className="flex-1">
          <label
            htmlFor="isAnonymous"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Submit anonymously
          </label>
          <p className="mt-1 text-sm text-muted-foreground">
            <Info className="inline h-3 w-3 mr-1" />
            Your identity will be hidden from lecturers and other students. Only system
            administrators can see anonymous complaint authors for security purposes.
          </p>
        </div>
      </div>

      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Brief summary of your complaint"
          value={formData.title}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, title: e.target.value }));
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: undefined }));
            }
          }}
          disabled={isLoading || isSavingDraft}
          className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
          maxLength={MAX_TITLE_LENGTH}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {errors.title && <span className="text-destructive">{errors.title}</span>}
          <span className="ml-auto">
            {formData.title.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      {/* Category Field */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              category: e.target.value as ComplaintCategory,
            }));
            if (errors.category) {
              setErrors((prev) => ({ ...prev, category: undefined }));
            }
          }}
          disabled={isLoading || isSavingDraft}
          className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.category
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-input'
          }`}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category}</p>
        )}
      </div>

      {/* Priority Field */}
      <div className="space-y-2">
        <Label>
          Priority Level <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PRIORITIES.map((priority) => (
            <button
              key={priority.value}
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, priority: priority.value }));
                if (errors.priority) {
                  setErrors((prev) => ({ ...prev, priority: undefined }));
                }
              }}
              disabled={isLoading || isSavingDraft}
              className={`flex items-center justify-center rounded-md border-2 px-4 py-3 text-sm font-medium transition-all ${
                formData.priority === priority.value
                  ? `${priority.color} border-current ring-2 ring-offset-2 ring-ring`
                  : 'border-input bg-background hover:bg-accent'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {priority.label}
            </button>
          ))}
        </div>
        {errors.priority && (
          <p className="text-sm text-destructive">{errors.priority}</p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <RichTextEditor
          value={formData.description}
          onChange={(value) => {
            setFormData((prev) => ({ ...prev, description: value }));
            if (errors.description) {
              setErrors((prev) => ({ ...prev, description: undefined }));
            }
          }}
          placeholder="Provide detailed information about your complaint..."
          disabled={isLoading || isSavingDraft}
          maxLength={MAX_DESCRIPTION_LENGTH}
          error={!!errors.description}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </div>

      {/* Tags Field */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (Optional)</Label>
        <p className="text-sm text-muted-foreground">
          Add tags to help categorize your complaint. Start typing to see suggestions.
        </p>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={tagInputRef}
                id="tags"
                type="text"
                placeholder="Type to search tags or create new..."
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                onFocus={() => {
                  if (tagInput.trim() && filteredSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                disabled={isLoading || isSavingDraft}
                autoComplete="off"
                aria-autocomplete="list"
                aria-controls="tag-suggestions"
                aria-expanded={showSuggestions}
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  id="tag-suggestions"
                  role="listbox"
                  className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card shadow-lg backdrop-blur-sm"
                  style={{ backgroundColor: 'hsl(var(--card))' }}
                >
                  <ul className="max-h-60 overflow-auto py-1">
                    {filteredSuggestions.map((suggestion, index) => (
                      <li
                        key={suggestion}
                        role="option"
                        aria-selected={index === activeSuggestionIndex}
                        className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                          index === activeSuggestionIndex
                            ? 'bg-accent text-accent-foreground'
                            : 'text-card-foreground hover:bg-accent/50'
                        }`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseEnter={() => setActiveSuggestionIndex(index)}
                      >
                        <span className="font-medium">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddTag()}
              disabled={!tagInput.trim() || isLoading || isSavingDraft}
            >
              Add
            </Button>
          </div>
          {tagInput.trim() && !filteredSuggestions.some(s => s === tagInput.toLowerCase()) && (
            <p className="mt-1 text-xs text-muted-foreground">
              Press Enter or click Add to create new tag: &quot;{tagInput.toLowerCase()}&quot;
            </p>
          )}
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  disabled={isLoading || isSavingDraft}
                  className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Remove ${tag} tag`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* File Attachments */}
      <div className="space-y-2">
        <Label>File Attachments (Optional)</Label>
        <p className="text-sm text-muted-foreground">
          Attach supporting documents, images, or other files to your complaint.
        </p>
        <FileUpload
          files={formData.files}
          onFilesSelected={(newFiles) => {
            setFormData((prev) => ({
              ...prev,
              files: [...prev.files, ...newFiles],
            }));
          }}
          onFileRemove={(fileToRemove) => {
            setFormData((prev) => ({
              ...prev,
              files: prev.files.filter((f) => f !== fileToRemove),
            }));
          }}
          disabled={isLoading || isSavingDraft}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || isSavingDraft}
          >
            Cancel
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSubmit(true)}
          disabled={isLoading || isSavingDraft}
        >
          {isSavingDraft ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Draft...
            </>
          ) : (
            'Save as Draft'
          )}
        </Button>
        <Button type="submit" disabled={isLoading || isSavingDraft}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Complaint'
          )}
        </Button>
      </div>
    </form>
  );
}
