CREATE TABLE public.crafting_timers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL,
  time_remaining TEXT NOT NULL
);