ALTER TABLE public.characters
  DROP CONSTRAINT IF EXISTS characters_user_id_fkey,
  ADD CONSTRAINT characters_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;