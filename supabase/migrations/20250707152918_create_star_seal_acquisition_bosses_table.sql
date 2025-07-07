CREATE TABLE IF NOT EXISTS star_seal_acquisition_bosses (
    id SERIAL PRIMARY KEY,
    method_id INTEGER REFERENCES star_seal_acquisition_methods(id),
    name TEXT NOT NULL,
    recommended_class TEXT,
    unique_equipment TEXT
);
