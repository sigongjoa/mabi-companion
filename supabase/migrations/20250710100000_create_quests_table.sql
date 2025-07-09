CREATE TABLE public.quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily JSONB,
  weekly JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default empty quests object
INSERT INTO public.quests (daily, weekly) VALUES ('[]'::jsonb, '[]'::jsonb);