-- This migration assigns existing user_items to the oldest character of each user.

-- up
UPDATE public.user_items ui
SET character_id = (
    SELECT c.id
    FROM public.characters c
    WHERE c.user_id = ui.user_id
    ORDER BY c.created_at ASC
    LIMIT 1
)
WHERE ui.character_id IS NULL;

-- down
-- Reverting this migration would mean setting character_id back to NULL for all items
-- that were assigned by this migration. This might not be desirable if new items
-- have been added with a character_id. For simplicity, we will not revert the data
-- assignment in the down migration, only the schema changes if any were made here.
-- Since this migration only updates data, the down section can be empty or contain
-- a comment indicating no direct revert for data assignment.

-- No direct revert for data assignment in down section to prevent data loss/inconsistency.
