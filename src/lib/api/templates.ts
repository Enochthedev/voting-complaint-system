import type { ComplaintTemplate } from '@/types/database.types';
import { supabase } from '@/lib/supabase';
import { withRateLimit } from '@/lib/rate-limiter';

/**
 * Complaint Templates API functions
 */

/**
 * Get all templates (with optional filtering)
 */
async function getTemplatesImpl(options?: {
  isActive?: boolean;
  createdBy?: string;
}): Promise<ComplaintTemplate[]> {
  let query = supabase.from('complaint_templates').select('*');

  if (options?.isActive !== undefined) {
    query = query.eq('is_active', options.isActive);
  }

  if (options?.createdBy) {
    query = query.eq('created_by', options.createdBy);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to fetch templates');
  }

  return data || [];
}

export const getTemplates = withRateLimit(getTemplatesImpl, 'read');

/**
 * Get a single template by ID
 */
async function getTemplateByIdImpl(templateId: string): Promise<ComplaintTemplate | null> {
  const { data, error } = await supabase
    .from('complaint_templates')
    .select('*')
    .eq('id', templateId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Failed to fetch template');
  }

  return data;
}

export const getTemplateById = withRateLimit(getTemplateByIdImpl, 'read');

/**
 * Create a new template
 */
async function createTemplateImpl(
  templateData: Omit<ComplaintTemplate, 'id' | 'created_at' | 'updated_at'>
): Promise<ComplaintTemplate> {
  const { data, error } = await supabase
    .from('complaint_templates')
    .insert(templateData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to create template');
  }

  return data;
}

export const createTemplate = withRateLimit(createTemplateImpl, 'write');

/**
 * Update a template
 */
async function updateTemplateImpl(
  templateId: string,
  updates: Partial<Omit<ComplaintTemplate, 'id' | 'created_at' | 'created_by'>>
): Promise<ComplaintTemplate> {
  const { data, error } = await supabase
    .from('complaint_templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', templateId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update template');
  }

  return data;
}

export const updateTemplate = withRateLimit(updateTemplateImpl, 'write');

/**
 * Delete a template
 */
async function deleteTemplateImpl(templateId: string): Promise<void> {
  const { error } = await supabase.from('complaint_templates').delete().eq('id', templateId);

  if (error) {
    throw new Error(error.message || 'Failed to delete template');
  }
}

export const deleteTemplate = withRateLimit(deleteTemplateImpl, 'write');

/**
 * Toggle template active status
 */
async function toggleTemplateActiveImpl(
  templateId: string,
  isActive: boolean
): Promise<ComplaintTemplate> {
  return updateTemplateImpl(templateId, { is_active: isActive });
}

export const toggleTemplateActive = withRateLimit(toggleTemplateActiveImpl, 'write');
