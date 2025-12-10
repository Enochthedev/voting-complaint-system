import { supabase } from '@/lib/supabase';
import { withRateLimit } from '@/lib/rate-limiter';
import type { EscalationRule } from '@/types/database.types';

/**
 * Get all escalation rules
 */
async function getEscalationRulesImpl(): Promise<EscalationRule[]> {
  const { data, error } = await supabase
    .from('escalation_rules')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching escalation rules:', error);
    throw new Error(error.message || 'Failed to fetch escalation rules');
  }

  return data || [];
}

export const getEscalationRules = withRateLimit(getEscalationRulesImpl, 'read');

/**
 * Create a new escalation rule
 */
async function createEscalationRuleImpl(
  rule: Omit<EscalationRule, 'id' | 'created_at' | 'updated_at'>
): Promise<EscalationRule> {
  const { data, error } = await supabase.from('escalation_rules').insert(rule).select().single();

  if (error) {
    console.error('Error creating escalation rule:', error);
    throw new Error(error.message || 'Failed to create escalation rule');
  }

  return data;
}

export const createEscalationRule = withRateLimit(createEscalationRuleImpl, 'write');

/**
 * Update an escalation rule
 */
async function updateEscalationRuleImpl(
  id: string,
  updates: Partial<EscalationRule>
): Promise<EscalationRule> {
  const { data, error } = await supabase
    .from('escalation_rules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating escalation rule:', error);
    throw new Error(error.message || 'Failed to update escalation rule');
  }

  return data;
}

export const updateEscalationRule = withRateLimit(updateEscalationRuleImpl, 'write');

/**
 * Delete an escalation rule
 */
async function deleteEscalationRuleImpl(id: string): Promise<void> {
  const { error } = await supabase.from('escalation_rules').delete().eq('id', id);

  if (error) {
    console.error('Error deleting escalation rule:', error);
    throw new Error(error.message || 'Failed to delete escalation rule');
  }
}

export const deleteEscalationRule = withRateLimit(deleteEscalationRuleImpl, 'write');

/**
 * Toggle escalation rule active status
 */
async function toggleEscalationRuleImpl(id: string, isActive: boolean): Promise<EscalationRule> {
  return updateEscalationRuleImpl(id, { is_active: isActive });
}

export const toggleEscalationRule = withRateLimit(toggleEscalationRuleImpl, 'write');
