ALTER TABLE public.avatar_sets RENAME TO "avatarSets";

-- Create a unified view for all gem types
CREATE OR REPLACE VIEW public.gems AS
SELECT id, name, description, type FROM (
  SELECT id::text, name, description, 'basic' as type FROM public.basic_gems
  UNION ALL
  SELECT id::text, name, NULL as description, 'combined' as type FROM public.combined_gems
  UNION ALL
  SELECT id::text, name, description, 'premium' as type FROM public.premium_gems
) AS all_gems;

-- Create a view for star seals
CREATE OR REPLACE VIEW public."starSeals" AS
SELECT * FROM public.star_seal_types;

-- Grant usage and select permissions on the new views to the anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.gems TO anon, authenticated;
GRANT SELECT ON public."starSeals" TO anon, authenticated;
