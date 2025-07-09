CREATE TABLE public."craftingFacilities" (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NULL,
  CONSTRAINT "craftingFacilities_pkey" PRIMARY KEY (id)
) TABLESPACE pg_default;