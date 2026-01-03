import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateActive,
} from '@/lib/api/templates';
import type { ComplaintTemplate } from '@/types/database.types';

/**
 * Hook to fetch all templates
 */
export function useTemplates(options?: { isActive?: boolean; createdBy?: string }) {
  return useQuery({
    queryKey: ['templates', options],
    queryFn: () => getTemplates(options),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch a single template by ID
 */
export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: ['template', templateId],
    queryFn: () => getTemplateById(templateId),
    enabled: !!templateId,
  });
}

/**
 * Hook to create a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateData: Omit<ComplaintTemplate, 'id' | 'created_at' | 'updated_at'>) =>
      createTemplate(templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    retry: 1,
    retryDelay: 1000,
  });
}

/**
 * Hook to update a template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      updates,
    }: {
      templateId: string;
      updates: Partial<Omit<ComplaintTemplate, 'id' | 'created_at' | 'created_by'>>;
    }) => updateTemplate(templateId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', variables.templateId] });
    },
    retry: 1,
    retryDelay: 1000,
  });
}

/**
 * Hook to delete a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

/**
 * Hook to toggle template active status
 */
export function useToggleTemplateActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, isActive }: { templateId: string; isActive: boolean }) =>
      toggleTemplateActive(templateId, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', variables.templateId] });
    },
    retry: 1,
    retryDelay: 1000,
  });
}
