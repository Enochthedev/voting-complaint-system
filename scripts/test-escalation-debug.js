/**
 * Debug test for escalation - simplified version
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugTest() {
  console.log('🔍 Debug Test\n');

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

    console.log(`Admin: ${admin.full_name} (${admin.id})`);
    console.log(`Student: ${student.full_name} (${student.id})\n`);

    // Disable all existing rules temporarily
    console.log('Disabling existing rules...');
    await supabase.from('escalation_rules').update({ is_active: false }).eq('is_active', true);
    console.log('✓ Existing rules disabled\n');

    // Create a rule
    const { data: rule, error: ruleError } = await supabase
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

    if (ruleError) {
      console.error('Error creating rule:', ruleError);
      return;
    }

    console.log(`✓ Created rule: ${rule.id}`);
    console.log(`  Category: ${rule.category}, Priority: ${rule.priority}`);
    console.log(`  Threshold: ${rule.hours_threshold}h, Escalate to: ${admin.full_name}\n`);

    // Create a complaint 3 hours old
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

    const { data: complaint, error: complaintError } = await supabase
      .from('complaints')
      .insert({
        student_id: student.id,
        title: 'Debug Test Complaint',
        description: 'Testing escalation',
        category: 'academic',
        priority: 'high',
        status: 'new',
        is_draft: false,
        is_anonymous: false,
      })
      .select()
      .single();

    if (complaintError) {
      console.error('Error creating complaint:', complaintError);
      return;
    }

    // Backdate it
    await supabase
      .from('complaints')
      .update({
        created_at: threeHoursAgo.toISOString(),
        updated_at: threeHoursAgo.toISOString(),
      })
      .eq('id', complaint.id);

    const { data: updated } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', complaint.id)
      .single();

    console.log(`✓ Created complaint: ${updated.id}`);
    console.log(`  Title: ${updated.title}`);
    console.log(`  Created: ${updated.created_at}`);
    console.log(`  Status: ${updated.status}`);
    console.log(`  Category: ${updated.category}, Priority: ${updated.priority}`);
    console.log(`  Escalated: ${updated.escalated_at || 'No'}\n`);

    // Call the edge function
    console.log('Calling edge function...');
    const functionUrl = `${supabaseUrl}/functions/v1/auto-escalate-complaints`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log('\nFunction Response:');
    console.log(JSON.stringify(result, null, 2));

    // Check the complaint again
    const { data: afterEscalation } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', complaint.id)
      .single();

    console.log('\nComplaint After Escalation:');
    console.log(`  Escalated At: ${afterEscalation.escalated_at || 'No'}`);
    console.log(`  Escalation Level: ${afterEscalation.escalation_level}`);
    console.log(`  Assigned To: ${afterEscalation.assigned_to || 'None'}`);
    console.log(`  Expected Assigned To: ${admin.id}`);

    if (afterEscalation.escalated_at && afterEscalation.assigned_to === admin.id) {
      console.log('\n✅ SUCCESS: Complaint was escalated!');
    } else {
      console.log('\n❌ FAIL: Complaint was NOT escalated');
    }

    // Cleanup
    console.log('\nCleaning up...');
    await supabase.from('complaint_history').delete().eq('complaint_id', complaint.id);
    await supabase.from('notifications').delete().eq('related_id', complaint.id);
    await supabase.from('complaints').delete().eq('id', complaint.id);
    await supabase.from('escalation_rules').delete().eq('id', rule.id);

    // Re-enable the original rules
    console.log('Re-enabling original rules...');
    await supabase.from('escalation_rules').update({ is_active: true }).eq('is_active', false);

    console.log('✓ Cleanup complete');
  } catch (error) {
    console.error('Error:', error);
  }
}

debugTest();
