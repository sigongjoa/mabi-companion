
-- Add missing columns to the users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS "llmTokens" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "feedbackCount" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "qaAnswerCount" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "bestAnswerCount" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "representativeCharacterId" UUID;

-- Update the handle_new_auth_user function
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'user_name' -- GitHub
    ?? NEW.raw_user_meta_data->>'full_name' -- Google
    ?? NEW.raw_user_meta_data->>'global_name' -- Discord
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
