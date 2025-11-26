'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileText, X, Loader2 } from 'lucide-react';
import type { ComplaintTemplate } from './types';
import { MOCK_TEMPLATES } from './mock-data';
import { CATEGORIES, PRIORITIES } from './constants';

interface TemplateSelectorProps {
  selectedTemplate: ComplaintTemplate | null;
  onSelect: (template: ComplaintTemplate) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function TemplateSelector({
  selectedTemplate,
  onSelect,
  onClear,
  disabled = false,
}: TemplateSelectorProps) {
  const [showTemplateDropdown, setShowTemplateDropdown] = React.useState(false);
  const [loadingTemplates, setLoadingTemplates] = React.useState(false);
  const templateDropdownRef = React.useRef<HTMLDivElement>(null);

  // Available templates (mock data for UI development)
  const availableTemplates = React.useMemo(() => MOCK_TEMPLATES, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  const handleTemplateSelect = (template: ComplaintTemplate) => {
    onSelect(template);
    setShowTemplateDropdown(false);
  };

  return (
    <div className="space-y-2">
      <Label>Use a Template (Optional)</Label>
      <p className="text-sm text-muted-foreground">
        Select a pre-defined template to help you fill out your complaint faster.
      </p>

      {selectedTemplate ? (
        <div className="flex items-center gap-3 rounded-lg border bg-muted p-4">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-medium text-foreground">{selectedTemplate.title}</p>
            <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={disabled}>
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
            disabled={disabled}
            className="w-full justify-start"
          >
            <FileText className="h-4 w-4" />
            Browse Templates
          </Button>

          {showTemplateDropdown && (
            <div
              className="absolute z-10 mt-2 w-full rounded-md border border-border bg-card shadow-lg backdrop-blur-sm"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
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
                            <p className="font-medium text-foreground">{template.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                                {CATEGORIES.find((c) => c.value === template.category)?.label}
                              </span>
                              <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                                {
                                  PRIORITIES.find((p) => p.value === template.suggested_priority)
                                    ?.label
                                }{' '}
                                Priority
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
  );
}
