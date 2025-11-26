-- Seed data for Student Complaint System
-- This script populates the database with realistic test data

-- Clear existing data (except users)
TRUNCATE TABLE 
  vote_responses,
  votes,
  announcements,
  notifications,
  feedback,
  escalation_rules,
  complaint_templates,
  complaint_ratings,
  complaint_history,
  complaint_comments,
  complaint_attachments,
  complaint_tags,
  complaints
CASCADE;

-- Get user IDs for reference
DO $$
DECLARE
  student_id_1 uuid;
  student_id_2 uuid;
  student_id_3 uuid;
  student_id_4 uuid;
  lecturer_id_1 uuid;
  lecturer_id_2 uuid;
  admin_id uuid;
BEGIN
  -- Get existing user IDs
  SELECT id INTO student_id_1 FROM users WHERE email = 'student@test.com';
  SELECT id INTO student_id_2 FROM users WHERE email = 'test-student-1763546088225@example.com';
  SELECT id INTO student_id_3 FROM users WHERE email = 'test-student-ratings-1-1763501033169@example.com';
  SELECT id INTO student_id_4 FROM users WHERE email = 'test-student-ratings-2-1763501033920@example.com';
  SELECT id INTO lecturer_id_1 FROM users WHERE email = 'lecturer@test.com';
  SELECT id INTO lecturer_id_2 FROM users WHERE email = 'test-lecturer-ratings-1763501034188@example.com';
  SELECT id INTO admin_id FROM users WHERE email = 'admin@test.com';

  -- Insert Complaint Templates
  INSERT INTO complaint_templates (id, title, description, category, suggested_priority, fields, created_by, is_active) VALUES
    (gen_random_uuid(), 'Broken Equipment', 'Report broken or malfunctioning equipment in classrooms or labs', 'facilities', 'high', '{"location": {"type": "text", "label": "Location", "required": true}, "equipment": {"type": "text", "label": "Equipment Name", "required": true}}', lecturer_id_1, true),
    (gen_random_uuid(), 'Course Material Issue', 'Report missing or incorrect course materials', 'academic', 'medium', '{"course_code": {"type": "text", "label": "Course Code", "required": true}, "material_type": {"type": "text", "label": "Material Type", "required": true}}', lecturer_id_1, true),
    (gen_random_uuid(), 'Grading Concern', 'Question or concern about assignment or exam grading', 'academic', 'medium', '{"assignment": {"type": "text", "label": "Assignment Name", "required": true}, "expected_grade": {"type": "text", "label": "Expected Grade", "required": false}}', lecturer_id_2, true);

  -- Insert Escalation Rules
  INSERT INTO escalation_rules (id, category, priority, hours_threshold, escalate_to, is_active) VALUES
    (gen_random_uuid(), 'harassment', 'high', 2, admin_id, true),
    (gen_random_uuid(), 'harassment', 'urgent', 1, admin_id, true),
    (gen_random_uuid(), 'facilities', 'urgent', 4, admin_id, true),
    (gen_random_uuid(), 'academic', 'high', 24, lecturer_id_1, true);

  -- Insert Complaints with various statuses
  -- Complaint 1: New complaint from student 1
  INSERT INTO complaints (id, student_id, title, description, category, priority, status, is_anonymous, is_draft, created_at, updated_at)
  VALUES (
    '11111111-1111-1111-1111-111111111111',
    student_id_1,
    'Broken AC in Lecture Hall B',
    '<p>The air conditioning unit in Lecture Hall B has been malfunctioning for the past week. The room temperature is unbearable, especially during afternoon classes.</p><p>This is affecting students'' ability to concentrate during lectures.</p>',
    'facilities',
    'high',
    'new',
    false,
    false,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  );

  -- Complaint 2: In progress complaint assigned to lecturer
  INSERT INTO complaints (id, student_id, title, description, category, priority, status, is_anonymous, is_draft, assigned_to, opened_at, opened_by, created_at, updated_at)
  VALUES (
    '22222222-2222-2222-2222-222222222222',
    student_id_2,
    'Missing course materials for CS301',
    '<p>The required textbook and lab materials for CS301 are not available in the library or bookstore.</p><p>Professor mentioned we need these for next week''s assignment.</p>',
    'academic',
    'medium',
    'in_progress',
    false,
    false,
    lecturer_id_1,
    NOW() - INTERVAL '1 day',
    lecturer_id_1,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '6 hours'
  );

  -- Complaint 3: Resolved complaint with feedback
  INSERT INTO complaints (id, student_id, title, description, category, priority, status, is_anonymous, is_draft, assigned_to, opened_at, opened_by, resolved_at, created_at, updated_at)
  VALUES (
    '33333333-3333-3333-3333-333333333333',
    student_id_3,
    'Parking lot lighting issue',
    '<p>Several lights in the student parking lot (Section C) are not working, making it unsafe to walk to cars after evening classes.</p>',
    'facilities',
    'high',
    'resolved',
    false,
    false,
    lecturer_id_2,
    NOW() - INTERVAL '5 days',
    lecturer_id_2,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '1 day'
  );

  -- Complaint 4: Anonymous complaint
  INSERT INTO complaints (id, student_id, title, description, category, priority, status, is_anonymous, is_draft, created_at, updated_at)
  VALUES (
    '44444444-4444-4444-4444-444444444444',
    student_id_4,
    'Inappropriate behavior in class',
    '<p>There have been instances of inappropriate comments and behavior during lectures that make some students uncomfortable.</p>',
    'harassment',
    'high',
    'new',
    true,
    false,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
  );

  -- Complaint 5: Draft complaint
  INSERT INTO complaints (id, student_id, title, description, category, priority, status, is_anonymous, is_draft, created_at, updated_at)
  VALUES (
    '55555555-5555-5555-5555-555555555555',
    student_id_1,
    'Cafeteria food quality concerns',
    '<p>Draft: Need to provide more details about specific incidents...</p>',
    'administrative',
    'low',
    'new',
    false,
    true,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  );

  -- Complaint 6: Closed complaint
  INSERT INTO complaints (id, student_id, title, description, category, priority, status, is_anonymous, is_draft, assigned_to, opened_at, opened_by, resolved_at, created_at, updated_at)
  VALUES (
    '66666666-6666-6666-6666-666666666666',
    student_id_2,
    'WiFi connectivity issues in library',
    '<p>WiFi keeps disconnecting in the library, making it impossible to complete online assignments.</p>',
    'facilities',
    'medium',
    'closed',
    false,
    false,
    lecturer_id_1,
    NOW() - INTERVAL '10 days',
    lecturer_id_1,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '2 days'
  );

  -- Insert Tags for complaints
  INSERT INTO complaint_tags (complaint_id, tag_name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'air-conditioning'),
    ('11111111-1111-1111-1111-111111111111', 'lecture-hall'),
    ('11111111-1111-1111-1111-111111111111', 'urgent'),
    ('22222222-2222-2222-2222-222222222222', 'course-materials'),
    ('22222222-2222-2222-2222-222222222222', 'cs301'),
    ('33333333-3333-3333-3333-333333333333', 'parking'),
    ('33333333-3333-3333-3333-333333333333', 'lighting'),
    ('33333333-3333-3333-3333-333333333333', 'safety'),
    ('44444444-4444-4444-4444-444444444444', 'harassment'),
    ('44444444-4444-4444-4444-444444444444', 'classroom'),
    ('66666666-6666-6666-6666-666666666666', 'wifi'),
    ('66666666-6666-6666-6666-666666666666', 'library');

  -- Insert Comments
  INSERT INTO complaint_comments (complaint_id, user_id, comment, is_internal, created_at) VALUES
    ('22222222-2222-2222-2222-222222222222', lecturer_id_1, '<p>I''ve contacted the bookstore. They should have the materials in stock by Friday.</p>', false, NOW() - INTERVAL '6 hours'),
    ('22222222-2222-2222-2222-222222222222', student_id_2, '<p>Thank you! Will the library also get copies?</p>', false, NOW() - INTERVAL '5 hours'),
    ('22222222-2222-2222-2222-222222222222', lecturer_id_1, '<p>Yes, I''ve requested 5 copies for the library reserve section.</p>', false, NOW() - INTERVAL '4 hours'),
    ('33333333-3333-3333-3333-333333333333', lecturer_id_2, '<p>Maintenance has been notified and will replace the lights this week.</p>', false, NOW() - INTERVAL '2 days'),
    ('33333333-3333-3333-3333-333333333333', lecturer_id_2, '<p>Internal note: Facilities confirmed completion on Nov 23.</p>', true, NOW() - INTERVAL '1 day');

  -- Insert Feedback
  INSERT INTO feedback (complaint_id, lecturer_id, content, created_at) VALUES
    ('33333333-3333-3333-3333-333333333333', lecturer_id_2, '<p>The lighting issue has been resolved. All lights in Section C have been replaced and are now functioning properly. Thank you for bringing this to our attention.</p>', NOW() - INTERVAL '1 day'),
    ('66666666-6666-6666-6666-666666666666', lecturer_id_1, '<p>IT department has upgraded the WiFi access points in the library. The connectivity should be much more stable now.</p>', NOW() - INTERVAL '3 days');

  -- Insert Ratings
  INSERT INTO complaint_ratings (complaint_id, student_id, rating, feedback_text, created_at) VALUES
    ('33333333-3333-3333-3333-333333333333', student_id_3, 5, 'Very satisfied with how quickly this was resolved. The parking lot is much safer now.', NOW() - INTERVAL '12 hours'),
    ('66666666-6666-6666-6666-666666666666', student_id_2, 4, 'WiFi is better now, though still occasionally drops during peak hours.', NOW() - INTERVAL '2 days');

  -- Insert Complaint History
  INSERT INTO complaint_history (complaint_id, action, old_value, new_value, performed_by, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'created', NULL, NULL, student_id_1, NOW() - INTERVAL '2 hours'),
    ('22222222-2222-2222-2222-222222222222', 'created', NULL, NULL, student_id_2, NOW() - INTERVAL '2 days'),
    ('22222222-2222-2222-2222-222222222222', 'status_changed', 'new', 'open', lecturer_id_1, NOW() - INTERVAL '1 day'),
    ('22222222-2222-2222-2222-222222222222', 'assigned', NULL, lecturer_id_1::text, lecturer_id_1, NOW() - INTERVAL '1 day'),
    ('22222222-2222-2222-2222-222222222222', 'status_changed', 'open', 'in_progress', lecturer_id_1, NOW() - INTERVAL '6 hours'),
    ('33333333-3333-3333-3333-333333333333', 'created', NULL, NULL, student_id_3, NOW() - INTERVAL '7 days'),
    ('33333333-3333-3333-3333-333333333333', 'status_changed', 'new', 'open', lecturer_id_2, NOW() - INTERVAL '5 days'),
    ('33333333-3333-3333-3333-333333333333', 'assigned', NULL, lecturer_id_2::text, lecturer_id_2, NOW() - INTERVAL '5 days'),
    ('33333333-3333-3333-3333-333333333333', 'status_changed', 'open', 'in_progress', lecturer_id_2, NOW() - INTERVAL '3 days'),
    ('33333333-3333-3333-3333-333333333333', 'status_changed', 'in_progress', 'resolved', lecturer_id_2, NOW() - INTERVAL '1 day'),
    ('66666666-6666-6666-6666-666666666666', 'created', NULL, NULL, student_id_2, NOW() - INTERVAL '12 days'),
    ('66666666-6666-6666-6666-666666666666', 'status_changed', 'new', 'open', lecturer_id_1, NOW() - INTERVAL '10 days'),
    ('66666666-6666-6666-6666-666666666666', 'assigned', NULL, lecturer_id_1::text, lecturer_id_1, NOW() - INTERVAL '10 days'),
    ('66666666-6666-6666-6666-666666666666', 'status_changed', 'open', 'in_progress', lecturer_id_1, NOW() - INTERVAL '5 days'),
    ('66666666-6666-6666-6666-666666666666', 'status_changed', 'in_progress', 'resolved', lecturer_id_1, NOW() - INTERVAL '3 days'),
    ('66666666-6666-6666-6666-666666666666', 'status_changed', 'resolved', 'closed', lecturer_id_1, NOW() - INTERVAL '2 days');

  -- Insert Notifications
  INSERT INTO notifications (user_id, type, title, message, related_id, is_read, created_at) VALUES
    (student_id_1, 'complaint_update', 'Complaint Submitted', 'Your complaint "Broken AC in Lecture Hall B" has been submitted successfully.', '11111111-1111-1111-1111-111111111111', true, NOW() - INTERVAL '2 hours'),
    (student_id_2, 'assignment', 'Complaint Assigned', 'Your complaint has been assigned to a lecturer for review.', '22222222-2222-2222-2222-222222222222', true, NOW() - INTERVAL '1 day'),
    (student_id_2, 'comment', 'New Comment', 'A lecturer has commented on your complaint about course materials.', '22222222-2222-2222-2222-222222222222', false, NOW() - INTERVAL '6 hours'),
    (student_id_3, 'resolution', 'Complaint Resolved', 'Your complaint about parking lot lighting has been resolved.', '33333333-3333-3333-3333-333333333333', true, NOW() - INTERVAL '1 day'),
    (lecturer_id_1, 'complaint_update', 'New Complaint', 'A new complaint has been submitted and requires attention.', '11111111-1111-1111-1111-111111111111', false, NOW() - INTERVAL '2 hours'),
    (lecturer_id_1, 'complaint_update', 'Anonymous Complaint', 'A new anonymous complaint about harassment has been submitted.', '44444444-4444-4444-4444-444444444444', false, NOW() - INTERVAL '3 hours');

  -- Insert Announcements
  INSERT INTO announcements (title, content, created_by, created_at) VALUES
    ('System Maintenance Scheduled', '<p>The complaint system will undergo maintenance on November 30, 2024 from 2:00 AM to 4:00 AM. The system will be unavailable during this time.</p><p>Please plan accordingly and submit any urgent complaints before the maintenance window.</p>', admin_id, NOW() - INTERVAL '2 days'),
    ('New Feature: Draft Complaints', '<p>You can now save complaints as drafts and continue editing them later. This is useful if you need to gather more information before submitting.</p><p>Drafts are only visible to you and won''t be reviewed until you submit them.</p>', lecturer_id_1, NOW() - INTERVAL '5 days'),
    ('Holiday Hours', '<p>Please note that during the upcoming holiday break (Dec 20 - Jan 5), complaint response times may be longer than usual.</p><p>Urgent matters will still be addressed promptly.</p>', admin_id, NOW() - INTERVAL '1 day');

  -- Insert Votes
  INSERT INTO votes (id, title, description, options, related_complaint_id, is_active, closes_at, created_by, created_at) VALUES
    (gen_random_uuid(), 'Preferred Library Study Hours Extension', '<p>Should we extend library study hours during exam periods?</p>', '["Yes, extend to midnight", "Yes, extend to 2 AM", "No, keep current hours", "Unsure"]', NULL, true, NOW() + INTERVAL '7 days', lecturer_id_1, NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), 'Cafeteria Menu Improvements', '<p>What type of food options would you like to see added to the cafeteria?</p>', '["More vegetarian options", "More vegan options", "International cuisine", "Healthier snacks", "All of the above"]', NULL, true, NOW() + INTERVAL '14 days', admin_id, NOW() - INTERVAL '1 day');

END $$;

-- Verify the seed data
SELECT 'Complaints' as table_name, COUNT(*) as count FROM complaints
UNION ALL
SELECT 'Complaint Tags', COUNT(*) FROM complaint_tags
UNION ALL
SELECT 'Complaint Comments', COUNT(*) FROM complaint_comments
UNION ALL
SELECT 'Complaint History', COUNT(*) FROM complaint_history
UNION ALL
SELECT 'Feedback', COUNT(*) FROM feedback
UNION ALL
SELECT 'Ratings', COUNT(*) FROM complaint_ratings
UNION ALL
SELECT 'Templates', COUNT(*) FROM complaint_templates
UNION ALL
SELECT 'Escalation Rules', COUNT(*) FROM escalation_rules
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Announcements', COUNT(*) FROM announcements
UNION ALL
SELECT 'Votes', COUNT(*) FROM votes;
