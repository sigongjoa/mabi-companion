ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert characters"
ON public.characters FOR INSERT
TO authenticated
WITH CHECK (true);