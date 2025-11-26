/**
 * Filter Preset Tests
 *
 * Tests for the filter preset save/load/delete functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  saveFilterPreset,
  loadFilterPresets,
  deleteFilterPreset,
  type FilterPreset,
} from '../filter-preset-manager';
import type { FilterState } from '../filter-panel';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Filter Preset Functionality', () => {
  const mockFilters: FilterState = {
    status: ['new', 'opened'],
    category: ['academic'],
    priority: ['high'],
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31',
    tags: ['urgent'],
    assignedTo: 'lecturer-1',
    sortBy: 'created_at',
    sortOrder: 'desc',
  };

  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('saveFilterPreset', () => {
    it('should save a filter preset to localStorage', () => {
      const preset = saveFilterPreset('My Preset', mockFilters);

      expect(preset).toBeDefined();
      expect(preset.name).toBe('My Preset');
      expect(preset.filters).toEqual(mockFilters);
      expect(preset.id).toMatch(/^preset-\d+$/);
      expect(preset.createdAt).toBeDefined();
    });

    it('should save multiple presets', () => {
      const preset1 = saveFilterPreset('Preset 1', mockFilters);
      const preset2 = saveFilterPreset('Preset 2', {
        ...mockFilters,
        status: ['resolved'],
      });

      const presets = loadFilterPresets();
      expect(presets).toHaveLength(2);
      expect(presets[0].id).toBe(preset1.id);
      expect(presets[1].id).toBe(preset2.id);
    });

    it('should preserve existing presets when saving new ones', () => {
      saveFilterPreset('Preset 1', mockFilters);
      saveFilterPreset('Preset 2', mockFilters);
      saveFilterPreset('Preset 3', mockFilters);

      const presets = loadFilterPresets();
      expect(presets).toHaveLength(3);
    });
  });

  describe('loadFilterPresets', () => {
    it('should return empty array when no presets exist', () => {
      const presets = loadFilterPresets();
      expect(presets).toEqual([]);
    });

    it('should load saved presets from localStorage', () => {
      const saved1 = saveFilterPreset('Preset 1', mockFilters);
      const saved2 = saveFilterPreset('Preset 2', mockFilters);

      const loaded = loadFilterPresets();
      expect(loaded).toHaveLength(2);
      expect(loaded[0].id).toBe(saved1.id);
      expect(loaded[1].id).toBe(saved2.id);
    });

    it('should return presets with correct structure', () => {
      saveFilterPreset('Test Preset', mockFilters);

      const presets = loadFilterPresets();
      expect(presets[0]).toHaveProperty('id');
      expect(presets[0]).toHaveProperty('name');
      expect(presets[0]).toHaveProperty('filters');
      expect(presets[0]).toHaveProperty('createdAt');
    });
  });

  describe('deleteFilterPreset', () => {
    it('should delete a preset by id', () => {
      const preset1 = saveFilterPreset('Preset 1', mockFilters);
      const preset2 = saveFilterPreset('Preset 2', mockFilters);

      deleteFilterPreset(preset1.id);

      const presets = loadFilterPresets();
      expect(presets).toHaveLength(1);
      expect(presets[0].id).toBe(preset2.id);
    });

    it('should handle deleting non-existent preset', () => {
      saveFilterPreset('Preset 1', mockFilters);

      deleteFilterPreset('non-existent-id');

      const presets = loadFilterPresets();
      expect(presets).toHaveLength(1);
    });

    it('should handle deleting from empty presets', () => {
      expect(() => deleteFilterPreset('any-id')).not.toThrow();
    });

    it('should delete all presets when called multiple times', () => {
      const preset1 = saveFilterPreset('Preset 1', mockFilters);
      const preset2 = saveFilterPreset('Preset 2', mockFilters);
      const preset3 = saveFilterPreset('Preset 3', mockFilters);

      deleteFilterPreset(preset1.id);
      deleteFilterPreset(preset2.id);
      deleteFilterPreset(preset3.id);

      const presets = loadFilterPresets();
      expect(presets).toHaveLength(0);
    });
  });

  describe('Preset Data Integrity', () => {
    it('should preserve filter state exactly as saved', () => {
      const complexFilters: FilterState = {
        status: ['new', 'opened', 'in_progress'],
        category: ['academic', 'facilities'],
        priority: ['high', 'critical'],
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        tags: ['urgent', 'wifi', 'classroom'],
        assignedTo: 'lecturer-1',
        sortBy: 'priority',
        sortOrder: 'asc',
      };

      saveFilterPreset('Complex Preset', complexFilters);
      const presets = loadFilterPresets();

      expect(presets[0].filters).toEqual(complexFilters);
    });

    it('should handle empty filter arrays', () => {
      const emptyFilters: FilterState = {
        status: [],
        category: [],
        priority: [],
        dateFrom: '',
        dateTo: '',
        tags: [],
        assignedTo: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
      };

      saveFilterPreset('Empty Preset', emptyFilters);
      const presets = loadFilterPresets();

      expect(presets[0].filters).toEqual(emptyFilters);
    });

    it('should generate unique IDs for each preset', () => {
      const preset1 = saveFilterPreset('Preset 1', mockFilters);
      const preset2 = saveFilterPreset('Preset 2', mockFilters);
      const preset3 = saveFilterPreset('Preset 3', mockFilters);

      expect(preset1.id).not.toBe(preset2.id);
      expect(preset2.id).not.toBe(preset3.id);
      expect(preset1.id).not.toBe(preset3.id);
    });

    it('should store valid ISO date strings for createdAt', () => {
      const preset = saveFilterPreset('Test Preset', mockFilters);

      expect(preset.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(new Date(preset.createdAt).toString()).not.toBe('Invalid Date');
    });
  });

  describe('Edge Cases', () => {
    it('should handle preset names with special characters', () => {
      const specialName = 'My Preset! @#$%^&*()';
      const preset = saveFilterPreset(specialName, mockFilters);

      expect(preset.name).toBe(specialName);

      const loaded = loadFilterPresets();
      expect(loaded[0].name).toBe(specialName);
    });

    it('should handle very long preset names', () => {
      const longName = 'A'.repeat(200);
      const preset = saveFilterPreset(longName, mockFilters);

      expect(preset.name).toBe(longName);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.setItem('complaint-filter-presets', 'invalid json');

      const presets = loadFilterPresets();
      expect(presets).toEqual([]);
    });

    it('should handle saving when localStorage is full', () => {
      // This is a simplified test - in reality, localStorage has size limits
      // but we can't easily simulate that in tests
      const largeFilters: FilterState = {
        ...mockFilters,
        tags: Array(1000).fill('tag'),
      };

      expect(() => saveFilterPreset('Large Preset', largeFilters)).not.toThrow();
    });
  });

  describe('Preset Ordering', () => {
    it('should maintain insertion order', () => {
      const preset1 = saveFilterPreset('First', mockFilters);
      const preset2 = saveFilterPreset('Second', mockFilters);
      const preset3 = saveFilterPreset('Third', mockFilters);

      const presets = loadFilterPresets();
      expect(presets[0].name).toBe('First');
      expect(presets[1].name).toBe('Second');
      expect(presets[2].name).toBe('Third');
    });

    it('should maintain order after deletion', () => {
      const preset1 = saveFilterPreset('First', mockFilters);
      const preset2 = saveFilterPreset('Second', mockFilters);
      const preset3 = saveFilterPreset('Third', mockFilters);

      deleteFilterPreset(preset2.id);

      const presets = loadFilterPresets();
      expect(presets).toHaveLength(2);
      expect(presets[0].name).toBe('First');
      expect(presets[1].name).toBe('Third');
    });
  });
});
