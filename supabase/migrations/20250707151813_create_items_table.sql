CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    icon TEXT,
    description TEXT,
    weight REAL,
    price INTEGER,
    tradeable BOOLEAN,
    sellable BOOLEAN,
    isFavorite BOOLEAN,
    initialQuantity INTEGER
);
