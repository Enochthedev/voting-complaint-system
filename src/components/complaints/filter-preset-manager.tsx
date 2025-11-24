'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterState } from './filter-panel';

export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: string;
}

export interface FilterPresetManagerProps {
  onLoadPreset: (preset: FilterPreset) => void;
  className?: string;
}

const STORAGE_KEY = 'complaint-filter-presets';

/**
 * Filter Preset Manager Component
 * 
 * Manages saved filter presets with:
 * - Display list of saved presets
 * - Load preset functionality
 * - Delete preset functionality
 * - LocalStorage persistence
 */
export function FilterPresetManager({
  onLoadPreset,
  className,
}: FilterPresetManagerProps) {
  const [presets, setPresets] = React.useState<FilterPreset[]>([]);
  const [activePresetId, setActivePresetId] = React.useState<string | null>(null);

  // Load presets from localStorage on mount
  React.useEffect(() => {
    loadPresets();
  }, []);

  // Load presets from localStorage
  const loadPresets = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPresets(parsed);
      }
    } catch (error) {
      console.error('Error loading filter presets:', error);
    }
  };

  // Save presets to localStorage
  const savePresets = (newPresets: FilterPreset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
      setPresets(newPresets);
    } catch (error) {
      console.error('Error saving filter presets:', error);
    }
  };

  // Add a new preset
  const addPreset = (name: string, filters: FilterState) => {
    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    const newPresets = [...presets, newPreset];
    savePresets(newPresets);
  };

  // Delete a preset
  const deletePreset = (presetId: string) => {
    const newPresets = presets.filter((p) => p.id !== presetId);
    savePresets(newPresets);
    if (activePresetId === presetId) {
      setActivePresetId(null);
    }
  };

  // Load a preset
  const handleLoadPreset = (preset: FilterPreset) => {
    setActivePresetId(preset.id);
    onLoadPreset(preset);
  };

  // Expose addPreset function to parent
  React.useImperativeHandle(
    React.useRef<{ addPreset: typeof addPreset }>(null),
    () => ({
      addPreset,
    })
  );

  if (presets.length === 0) {
    return null;
  }

  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="mb-3 flex items-center gap-2">
        <Bookmark className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-card-foreground">
          Saved Presets
        </h3>
      </div>
      
      <div className="space-y-2">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className={cn(
              'flex items-center justify-between rounded-md border p-2 transition-colors',
              activePresetId === preset.id
                ? 'border-primary bg-accent'
                : 'border-border hover:bg-accent/50'
            )}
          >
            <button
              onClick={() => handleLoadPreset(preset)}
              className="flex flex-1 items-center gap-2 text-left"
            >
              {activePresetId === preset.id && (
                <Check className="h-3 w-3 text-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">
                {preset.name}
              </span>
            </button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                deletePreset(preset.id);
              }}
              className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
              aria-label={`Delete ${preset.name} preset`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-muted-foreground">
        {presets.length} saved preset{presets.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// Export helper functions for use in parent components
export function saveFilterPreset(name: string, filters: FilterState): FilterPreset {
  const newPreset: FilterPreset = {
    id: `preset-${Date.now()}`,
    name,
    filters,
    createdAt: new Date().toISOString(),
  };
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const presets: FilterPreset[] = stored ? JSON.parse(stored) : [];
    const newPresets = [...presets, newPreset];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
    return newPreset;
  } catch (error) {
    console.error('Error saving filter preset:', error);
    throw error;
  }
}

export function loadFilterPresets(): FilterPreset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading filter presets:', error);
    return [];
  }
}

export function deleteFilterPreset(presetId: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const presets: FilterPreset[] = JSON.parse(stored);
      const newPresets = presets.filter((p) => p.id !== presetId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
    }
  } catch (error) {
    console.error('Error deleting filter preset:', error);
    throw error;
  }
}
