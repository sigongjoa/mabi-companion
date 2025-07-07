CREATE TABLE IF NOT EXISTS star_seal_black_hole_types (
    id SERIAL PRIMARY KEY,
    method_id INTEGER REFERENCES star_seal_acquisition_methods(id),
    type TEXT NOT NULL,
    features TEXT
);
