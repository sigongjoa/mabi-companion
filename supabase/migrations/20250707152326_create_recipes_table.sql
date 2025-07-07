CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    resultId INTEGER NOT NULL,
    materials JSONB
);
