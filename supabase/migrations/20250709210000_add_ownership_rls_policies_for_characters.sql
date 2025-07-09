ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY insert_own
  ON public.characters
  FOR INSERT
  WITH CHECK ( auth.uid() IS NOT NULL AND user_id = auth.uid() );

CREATE POLICY update_own
  ON public.characters
  FOR UPDATE
  USING    ( user_id = auth.uid() )
  WITH CHECK ( user_id = auth.uid() );

CREATE POLICY delete_own
  ON public.characters
  FOR DELETE
  USING ( user_id = auth.uid() );