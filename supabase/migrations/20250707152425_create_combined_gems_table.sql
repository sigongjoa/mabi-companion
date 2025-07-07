CREATE TABLE IF NOT EXISTS combined_gems (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    recipe JSONB,
    effect TEXT,
    recipe_description TEXT
);
