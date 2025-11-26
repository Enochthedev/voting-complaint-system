-- Add 'tags_added' to complaint_action enum
-- This allows proper logging of tag addition actions in complaint history

-- Add the new enum value
ALTER TYPE complaint_action ADD VALUE IF NOT EXISTS 'tags_added';

-- Comment for documentation
COMMENT ON TYPE complaint_action IS 'Enum of possible actions that can be performed on complaints, including status changes, assignments, feedback, comments, reopening, escalation, rating, and tag additions';
