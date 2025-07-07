CREATE TABLE IF NOT EXISTS avatar_set_items (
    id SERIAL PRIMARY KEY,
    set_id INTEGER REFERENCES avatar_sets(id),
    name TEXT NOT NULL,
    imageUrl TEXT
);
