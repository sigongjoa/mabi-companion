CREATE TABLE IF NOT EXISTS crafting_recipes (
    id SERIAL PRIMARY KEY,
    facility_id TEXT REFERENCES craftingFacilities(id),
    product TEXT NOT NULL,
    time INTEGER,
    level_condition INTEGER,
    materials JSONB
);
