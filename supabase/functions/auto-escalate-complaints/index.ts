/// <reference lib="deno.ns" />

/**
 * Supabase Edge Function: auto-escalate-complaints
 *
 * This function runs periodically (via cron job) to check for complaints
 * that need to be escalated based on configured escalation rules.
 *
 * Escalation Logic:
 * 1. Fetch all active escalation rules
 * 2. For each rule, find complaints matching category/priority that:
 *    - Are in 'new' or 'opened' status
 *    - Have not been escalated yet (escalated_at is null)
 *    - Were created more than hours_threshold ago
 * 3. Escalate matching complaints by:
 *    - Setting escalated_at timestamp
 *    - Incrementing escalation_level
 *    - Assigning to the escalate_to user
 *    - Creating a notification for the assigned user
 *    - Logging the escalation in complaint_history
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface EscalationRule {
  id: string;
  category: string;
  priority: string;
  hours_threshold: number;
  escalate_to: string;
  is_active: boolean;
}

interface Complaint {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  escalation_level: number;
  escalated_at: string | null;
  student_id: string | null;
}

interface EscalationResult {
  rule_id: string;
  complaints_escalated: number;
  complaint_ids: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('Starting auto-escalation check...');

    // Fetch all active escalation rules
    const { data: rules, error: rulesError } = await supabase
      .from('escalation_rules')
      .select('*')
      .eq('is_active', true);

    if (rulesError) {
      console.error('Error fetching escalation rules:', rulesError);
      throw rulesError;
    }

    if (!rules || rules.length === 0) {
      console.log('No active escalation rules found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active escalation rules',
          results: [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`Found ${rules.length} active escalation rule(s)`);

    const results: EscalationResult[] = [];

    // Process each escalation rule
    for (const rule of rules as EscalationRule[]) {
      console.log(`Processing rule ${rule.id} for ${rule.category}/${rule.priority}`);

      // Calculate threshold time
      const thresholdTime = new Date();
      thresholdTime.setHours(thresholdTime.getHours() - rule.hours_threshold);
      const thresholdISO = thresholdTime.toISOString();

      console.log(`Looking for complaints created before ${thresholdISO}`);

      // Find complaints that need escalation
      const { data: complaints, error: complaintsError } = await supabase
        .from('complaints')
        .select(
          'id, title, category, priority, status, created_at, escalation_level, student_id, escalated_at'
        )
        .eq('category', rule.category)
        .eq('priority', rule.priority)
        .in('status', ['new', 'opened'])
        .lt('created_at', thresholdISO)
        .is('escalated_at', null);

      if (complaintsError) {
        console.error(`Error fetching complaints for rule ${rule.id}:`, complaintsError);
        continue;
      }

      if (!complaints || complaints.length === 0) {
        console.log(`No complaints to escalate for rule ${rule.id}`);
        results.push({
          rule_id: rule.id,
          complaints_escalated: 0,
          complaint_ids: [],
        });
        continue;
      }

      console.log(`Found ${complaints.length} complaint(s) to escalate`);

      const escalatedIds: string[] = [];

      // Escalate each complaint
      for (const complaint of complaints as Complaint[]) {
        console.log(`Escalating complaint ${complaint.id}: "${complaint.title}"`);

        const now = new Date().toISOString();
        const newEscalationLevel = (complaint.escalation_level || 0) + 1;

        // Update complaint with escalation details
        // Note: The database trigger 'notify_on_complaint_escalation' will automatically
        // create a notification when escalated_at is set or escalation_level increases
        const { error: updateError } = await supabase
          .from('complaints')
          .update({
            escalated_at: now,
            escalation_level: newEscalationLevel,
            assigned_to: rule.escalate_to,
            updated_at: now,
          })
          .eq('id', complaint.id);

        if (updateError) {
          console.error(`Error updating complaint ${complaint.id}:`, updateError);
          continue;
        }

        console.log(`Notification will be created automatically by database trigger`);

        // Log escalation in complaint history
        const { error: historyError } = await supabase.from('complaint_history').insert({
          complaint_id: complaint.id,
          action: 'escalated',
          old_value: null,
          new_value: `Level ${newEscalationLevel}`,
          performed_by: rule.escalate_to,
          details: {
            escalation_level: newEscalationLevel,
            rule_id: rule.id,
            hours_threshold: rule.hours_threshold,
            auto_escalated: true,
          },
        });

        if (historyError) {
          console.error(`Error logging history for complaint ${complaint.id}:`, historyError);
        }

        escalatedIds.push(complaint.id);
        console.log(`Successfully escalated complaint ${complaint.id}`);
      }

      results.push({
        rule_id: rule.id,
        complaints_escalated: escalatedIds.length,
        complaint_ids: escalatedIds,
      });
    }

    const totalEscalated = results.reduce((sum, r) => sum + r.complaints_escalated, 0);
    console.log(`Auto-escalation complete. Total complaints escalated: ${totalEscalated}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${rules.length} rule(s) and escalated ${totalEscalated} complaint(s)`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in auto-escalation function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
