/**
 * Manual escalation test - simulates what the edge function does
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function manualTest() {
  console.log('🔍 Manual Escalation Test\n');

  try {
    // Get users
    const { data: admin } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'admin')
      .limit(1)
      .single();

    const { data: student } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'student')
      .limit(1)
      .single();

    console.log(`Admin: ${admin.full_name}`);
    console.log(`Student: ${student.full_name}\n`);

    // Disable existing rules
    await supabase.from('escalation_rules').update({ is_active: false }).eq('is_active', true);

    // Create a rule
    const { data: rule } = await supabase
      .from('escalation_rules')
      .insert({
        category: 'academic',
        priority: 'high',
        hours_threshold: 2,
        escalate_to: admin.id,
        is_active: true,
      })
      .select()
      .single();

    console.log(`✓ Created rule: ${rule.id}`);

    // Create a complaint 3 hours old
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

    const { data: complaint } = await supabase
      .from('complaints')
      .insert({
        student_id: student.id,
        title: 'Manual Test Complaint',
        description: 'Testing',
        category: 'academic',
        priority: 'high',
        status: 'new',
        is_draft: false,
        is_anonymous: false,
      })
      .select()
      .single();

    // Backdate it
    await supabase
      .from('complaints')
      .update({
        created_at: threeHoursAgo.toISOString(),
        updated_at: threeHoursAgo.toISOString(),
      })
      .eq('id', complaint.id);

    console.log(`✓ Created complaint: ${complaint.id}\n`);

    // Now manually do what the edge function does
    console.log('Simulating edge function logic...\n');

    // 1. Fetch active rules
    const { data: rules } = await supabase
      .from('escalation_rules')
      .select('*')
      .eq('is_active', true);

    console.log(`Found ${rules.length} active rule(s)`);

    for (const r of rules) {
      console.log(`\nProcessing rule: ${r.id}`);
      console.log(`  Category: ${r.category}, Priority: ${r.priority}`);
      console.log(`  Threshold: ${r.hours_threshold} hours`);

      // 2. Calculate threshold time
      const thresholdTime = new Date();
      thresholdTime.setHours(thresholdTime.getHours() - r.hours_threshold);
      const thresholdISO = thresholdTime.toISOString();

      console.log(`  Looking for complaints created before: ${thresholdISO}`);

      // 3. Find complaints
      const { data: complaints, error } = await supabase
        .from('complaints')
        .select('id, title, category, priority, status, created_at, escalation_level, escalated_at')
        .eq('category', r.category)
        .eq('priority', r.priority)
        .in('status', ['new', 'open'])
        .lt('created_at', thresholdISO)
        .is('escalated_at', null);

      if (error) {
        console.error('  Error:', error);
        continue;
      }

      console.log(`  Found ${complaints?.length || 0} complaint(s) to escalate`);

      if (complaints && complaints.length > 0) {
        for (const c of complaints) {
          console.log(`\n  Complaint: ${c.id}`);
          console.log(`    Title: ${c.title}`);
          console.log(`    Created: ${c.created_at}`);
          console.log(`    Status: ${c.status}`);
          console.log(`    Category: ${c.category}, Priority: ${c.priority}`);

          // 4. Escalate
          const now = new Date().toISOString();
          const newLevel = (c.escalation_level || 0) + 1;

          const { error: updateError } = await supabase
            .from('complaints')
            .update({
              escalated_at: now,
              escalation_level: newLevel,
              assigned_to: r.escalate_to,
              updated_at: now,
            })
            .eq('id', c.id);

          if (updateError) {
            console.error(`    Error updating: ${updateError.message}`);
          } else {
            console.log(`    ✓ Escalated to level ${newLevel}`);
          }

          // 5. Log history
          await supabase.from('complaint_history').insert({
            complaint_id: c.id,
            action: 'escalated',
            old_value: null,
            new_value: `Level ${newLevel}`,
            performed_by: r.escalate_to,
            details: {
              escalation_level: newLevel,
              rule_id: r.id,
              hours_threshold: r.hours_threshold,
              auto_escalated: true,
            },
          });

          console.log(`    ✓ History logged`);
        }
      }
    }

    // Verify
    console.log('\n\nVerifying escalation...');
    const { data: afterEscalation } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', complaint.id)
      .single();

    console.log(`Escalated At: ${afterEscalation.escalated_at || 'No'}`);
    console.log(`Escalation Level: ${afterEscalation.escalation_level}`);
    console.log(`Assigned To: ${afterEscalation.assigned_to}`);

    if (afterEscalation.escalated_at && afterEscalation.assigned_to === admin.id) {
      console.log('\n✅ SUCCESS!');
    } else {
      console.log('\n❌ FAIL');
    }

    // Cleanup
    console.log('\nCleaning up...');
    await supabase.from('complaint_history').delete().eq('complaint_id', complaint.id);
    await supabase.from('notifications').delete().eq('related_id', complaint.id);
    await supabase.from('complaints').delete().eq('id', complaint.id);
    await supabase.from('escalation_rules').delete().eq('id', rule.id);
    await supabase.from('escalation_rules').update({ is_active: true }).eq('is_active', false);
    console.log('✓ Done');
  } catch (error) {
    console.error('Error:', error);
  }
}

manualTest();
